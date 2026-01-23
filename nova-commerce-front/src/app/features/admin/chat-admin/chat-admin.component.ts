import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import {
  ChatSession,
  ChatMessage,
  SenderType,
  MessageType,
  ChatStatus
} from '../../../core/models/chat.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-admin.component.html',
  styleUrls: ['./chat-admin.component.scss']
})
export class ChatAdminComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  // Lista de sesiones activas
  activeSessions: ChatSession[] = [];
  selectedSession: ChatSession | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  
  // Usuario admin (deberías obtenerlo del servicio de autenticación)
  currentAdmin = {
    id: 'admin_1',
    name: 'Asesor Nova'
  };
  
  isLoading = false;
  isConnecting = false;
  
  private subscriptions: Subscription[] = [];
  
  // Enum para el template
  SenderType = SenderType;
  ChatStatus = ChatStatus;
  
  constructor(private chatService: ChatService) {}
  
  ngOnInit(): void {
    this.initializeChat();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnect();
  }
  
  /**
   * Inicializa el chat del admin
   */
  private async initializeChat(): Promise<void> {
    try {
      this.isConnecting = true;
      
      // Conectar al WebSocket
      await this.chatService.connect();
      
      // Suscribirse a nuevas sesiones
      this.subscribeToNewSessions();
      
      // Suscribirse a mensajes en tiempo real
      this.subscribeToMessages();
      
      // Cargar sesiones activas
      this.loadActiveSessions();
      
      console.log('✅ Chat admin inicializado');
    } catch (error) {
      console.error('❌ Error al inicializar chat admin:', error);
    } finally {
      this.isConnecting = false;
    }
  }
  
  /**
   * Carga las sesiones activas
   */
  loadActiveSessions(): void {
    this.isLoading = true;
    
    this.chatService.getActiveSessions().subscribe({
      next: (sessions) => {
        this.activeSessions = sessions;
        this.isLoading = false;
        
        // Si hay una sesión seleccionada, actualizarla
        if (this.selectedSession) {
          const updated = sessions.find(s => s.id === this.selectedSession!.id);
          if (updated) {
            this.selectedSession = updated;
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar sesiones:', error);
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Se suscribe a nuevas sesiones
   */
  private subscribeToNewSessions(): void {
    this.chatService.subscribeToNewSessions();
    
    const newSessionSub = this.chatService.newSession$.subscribe(session => {
      console.log('Nueva sesión recibida:', session);
      
      // Agregar a la lista si no existe
      const exists = this.activeSessions.find(s => s.id === session.id);
      if (!exists) {
        this.activeSessions.unshift(session);
      }
      
      // Mostrar notificación (podrías usar un servicio de notificaciones)
      this.showNotification(`Nueva solicitud de chat de ${session.customerName}`);
    });
    
    this.subscriptions.push(newSessionSub);
  }
  
  /**
   * Se suscribe a mensajes en tiempo real
   */
  private subscribeToMessages(): void {
    const messageSub = this.chatService.messages$.subscribe(message => {
      // Agregar mensaje si es de la sesión seleccionada
      if (this.selectedSession && message.sessionId === this.selectedSession.id) {
        this.messages.push(message);
        this.scrollToBottom();
        
        // Marcar como leído automáticamente
        if (message.senderType === SenderType.CUSTOMER) {
          setTimeout(() => {
            this.markAsRead();
          }, 1000);
        }
      }
      
      // Actualizar contador de no leídos en la lista
      const session = this.activeSessions.find(s => s.id === message.sessionId);
      if (session && message.senderType === SenderType.CUSTOMER) {
        session.unreadByAdvisor++;
        session.lastActivity = new Date().toISOString();
      }
    });
    
    const sessionClosedSub = this.chatService.sessionClosed$.subscribe(sessionId => {
      // Remover de la lista
      this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId);
      
      // Si era la sesión seleccionada, deseleccionar
      if (this.selectedSession && this.selectedSession.id === sessionId) {
        this.selectedSession = null;
        this.messages = [];
      }
    });
    
    this.subscriptions.push(messageSub, sessionClosedSub);
  }
  
  /**
   * Selecciona una sesión para ver/responder
   */
  selectSession(session: ChatSession): void {
    this.selectedSession = session;
    this.messages = [];
    
    // Si la sesión está en espera, asignarla automáticamente
    if (session.status === ChatStatus.WAITING) {
      this.assignToMe(session);
    }
    
    // Suscribirse a la sesión
    this.chatService.subscribeToSession(session.id);
    
    // Cargar historial de mensajes
    this.loadMessages(session.id);
  }
  
  /**
   * Asigna la sesión al asesor actual
   */
  private assignToMe(session: ChatSession): void {
    this.chatService.assignAdvisor(
      session.id,
      this.currentAdmin.id,
      this.currentAdmin.name
    ).subscribe({
      next: (updatedSession) => {
        // Actualizar sesión en la lista
        const index = this.activeSessions.findIndex(s => s.id === session.id);
        if (index !== -1) {
          this.activeSessions[index] = updatedSession;
        }
        
        if (this.selectedSession && this.selectedSession.id === session.id) {
          this.selectedSession = updatedSession;
        }
      },
      error: (error) => {
        console.error('Error al asignar asesor:', error);
      }
    });
  }
  
  /**
   * Carga los mensajes de una sesión
   */
  private loadMessages(sessionId: string): void {
    this.chatService.getSessionMessages(sessionId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.scrollToBottom();
        
        // Marcar como leído
        this.markAsRead();
      },
      error: (error) => {
        console.error('Error al cargar mensajes:', error);
      }
    });
  }
  
  /**
   * Envía un mensaje
   */
  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedSession) {
      return;
    }
    
    const messageRequest = {
      sessionId: this.selectedSession.id,
      senderId: this.currentAdmin.id,
      senderName: this.currentAdmin.name,
      senderType: SenderType.ADVISOR,
      content: this.newMessage,
      messageType: MessageType.TEXT
    };
    
    this.chatService.sendMessageViaWebSocket(messageRequest);
    this.newMessage = '';
  }
  
  /**
   * Marca los mensajes como leídos
   */
  private markAsRead(): void {
    if (!this.selectedSession) return;
    
    this.chatService.markAsReadViaWebSocket(this.selectedSession.id, this.currentAdmin.id);
    
    // Actualizar contador local
    const session = this.activeSessions.find(s => s.id === this.selectedSession!.id);
    if (session) {
      session.unreadByAdvisor = 0;
    }
  }
  
  /**
   * Cierra una sesión
   */
  closeSession(session: ChatSession): void {
    if (confirm('¿Estás seguro de cerrar esta conversación?')) {
      this.chatService.closeSession(session.id).subscribe({
        next: () => {
          // Remover de la lista
          this.activeSessions = this.activeSessions.filter(s => s.id !== session.id);
          
          // Si era la seleccionada, limpiar
          if (this.selectedSession && this.selectedSession.id === session.id) {
            this.selectedSession = null;
            this.messages = [];
          }
        },
        error: (error) => {
          console.error('Error al cerrar sesión:', error);
        }
      });
    }
  }
  
  /**
   * Scroll automático al final
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }
  
  /**
   * Determina si un mensaje es del asesor actual
   */
  isMyMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentAdmin.id;
  }
  
  /**
   * Obtiene el badge de estado
   */
  getStatusBadge(status: ChatStatus): string {
    switch (status) {
      case ChatStatus.WAITING:
        return 'Esperando';
      case ChatStatus.ACTIVE:
        return 'Activa';
      case ChatStatus.CLOSED:
        return 'Cerrada';
      default:
        return '';
    }
  }
  
  /**
   * Obtiene la clase del badge de estado
   */
  getStatusClass(status: ChatStatus): string {
    switch (status) {
      case ChatStatus.WAITING:
        return 'badge-warning';
      case ChatStatus.ACTIVE:
        return 'badge-success';
      case ChatStatus.CLOSED:
        return 'badge-secondary';
      default:
        return '';
    }
  }
  
  /**
   * Muestra una notificación
   */
  private showNotification(message: string): void {
    // Aquí podrías integrar con un servicio de notificaciones
    console.log('📬 Notificación:', message);
    
    // Notificación del navegador
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nova Commerce - Chat', {
        body: message,
        icon: '/assets/logo.png'
      });
    }
  }
  
  /**
   * Formatea la hora relativa
   */
  getRelativeTime(date: Date | string): string {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  }
}
