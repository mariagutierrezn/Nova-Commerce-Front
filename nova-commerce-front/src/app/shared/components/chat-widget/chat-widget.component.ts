import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { TokenService } from '../../../features/auth/services/token.service';
import { CustomerService, Customer } from '../../../features/admin/customers/customer.service';
import {
  ChatSession,
  ChatMessage,
  SenderType,
  MessageType,
  ChatStatus
} from '../../../core/models/chat.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss']
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  isOpen = false;
  isMinimized = false;
  isConnecting = false;
  
  // Estado del chat
  currentSession: ChatSession | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  
  // Estado del bot Q&A
  inBotMode = true;
  botQuestions = [
    { id: 1, text: '¿Cuáles son los métodos de pago?', answer: 'Aceptamos tarjetas de crédito, débito, PayPal y transferencias bancarias.' },
    { id: 2, text: '¿Cuánto tarda el envío?', answer: 'El envío estándar tarda entre 3-5 días hábiles. El envío express llega en 24-48 horas.' },
    { id: 3, text: '¿Cómo puedo rastrear mi pedido?', answer: 'Puedes rastrear tu pedido desde la sección "Mis Pedidos" con el número de tracking que te enviamos por email.' },
    { id: 4, text: '¿Cuál es la política de devoluciones?', answer: 'Tienes 30 días para devolver productos sin usar. Procesamos reembolsos en 5-7 días hábiles.' },
    { id: 5, text: '¿Quiero hablar con un asesor?', answer: '', isAdvisor: true }
  ];
  
  // Usuario actual (se obtiene del servicio de autenticación)
  currentUser = {
    id: '',
    name: 'Cliente',
    email: 'cliente@example.com'
  };
  
  private subscriptions: Subscription[] = [];
  private isSending = false; // Prevenir envíos duplicados
  
  constructor(
    private chatService: ChatService,
    private tokenService: TokenService,
    private customerService: CustomerService
  ) {}
  
  ngOnInit(): void {
    // Obtener datos reales del usuario
    this.loadCurrentUser();
    // Conectar al WebSocket cuando se inicializa el componente
    this.connectWebSocket();
  }
  
  /**
   * Carga los datos del usuario actual desde el token y customer service
   */
  private loadCurrentUser(): void {
    const customerId = this.tokenService.getCustomerId();
    const username = this.tokenService.getUsername();
    
    if (customerId) {
      // Intentar obtener datos completos del customer
      this.customerService.getCustomerById(customerId.toString()).subscribe({
        next: (customer: Customer) => {
          this.currentUser = {
            id: customer.id || 'customer_' + Date.now(),
            name: `${customer.firstName} ${customer.lastName}`.trim() || username || 'Cliente',
            email: customer.email || 'cliente@example.com'
          };
          console.log('✅ Usuario cargado:', this.currentUser);
        },
        error: (error) => {
          console.warn('⚠️ No se pudo cargar el customer, usando datos básicos:', error);
          // Fallback: usar datos del token
          this.currentUser = {
            id: customerId.toString(),
            name: username || 'Cliente',
            email: username ? `${username}@example.com` : 'cliente@example.com'
          };
        }
      });
    } else {
      // Usuario no autenticado o sin customerId
      console.warn('⚠️ Usuario no autenticado, usando datos por defecto');
      this.currentUser = {
        id: 'guest_' + Date.now(),
        name: username || 'Cliente',
        email: 'invitado@example.com'
      };
    }
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnect();
  }
  
  /**
   * Conecta al WebSocket
   */
  private async connectWebSocket(): Promise<void> {
    try {
      this.isConnecting = true;
      await this.chatService.connect();
      this.subscribeToMessages();
      console.log('✅ Chat conectado al WebSocket');
    } catch (error) {
      console.error('❌ Error al conectar chat:', error);
    } finally {
      this.isConnecting = false;
    }
  }
  
  /**
   * Se suscribe a mensajes en tiempo real
   */
  private subscribeToMessages(): void {
    const messageSub = this.chatService.messages$.subscribe(message => {
      this.messages.push(message);
      this.scrollToBottom();
      
      // Marcar como leído si la ventana está abierta
      if (this.isOpen && this.currentSession) {
        setTimeout(() => {
          this.chatService.markAsReadViaWebSocket(this.currentSession!.id, this.currentUser.id);
        }, 1000);
      }
    });
    
    const sessionClosedSub = this.chatService.sessionClosed$.subscribe(sessionId => {
      if (this.currentSession && this.currentSession.id === sessionId) {
        this.addSystemMessage('La sesión ha sido cerrada.');
        this.currentSession = null;
      }
    });
    
    this.subscriptions.push(messageSub, sessionClosedSub);
  }
  
  /**
   * Toggle de apertura/cierre del widget
   */
  toggleChat(): void {
    this.isOpen = !this.isOpen;
    
    if (this.isOpen && !this.currentSession && !this.inBotMode) {
      // Intentar recuperar sesión existente o crear una nueva
      this.initializeChat();
    }
    
    if (this.isOpen) {
      this.scrollToBottom();
    }
  }
  
  /**
   * Minimiza/maximiza el chat
   */
  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }
  
  /**
   * Inicializa el chat (carga sesión o crea una nueva)
   */
  private initializeChat(): void {
    // Intentar obtener sesión activa del cliente
    this.chatService.getCustomerSessions(this.currentUser.id).subscribe({
      next: (sessions) => {
        // Buscar sesión activa o en espera
        const activeSession = sessions.find(s => 
          s.status === ChatStatus.WAITING || s.status === ChatStatus.ACTIVE
        );
        
        if (activeSession) {
          this.loadExistingSession(activeSession);
        }
      },
      error: (error) => {
        console.error('Error al obtener sesiones:', error);
      }
    });
  }
  
  /**
   * Carga una sesión existente
   */
  private loadExistingSession(session: ChatSession): void {
    this.currentSession = session;
    
    // Cargar historial de mensajes
    this.chatService.getSessionMessages(session.id).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.scrollToBottom();
        
        // Suscribirse a la sesión
        this.chatService.subscribeToSession(session.id);
      },
      error: (error) => {
        console.error('Error al cargar mensajes:', error);
      }
    });
  }
  
  /**
   * Maneja la respuesta a una pregunta del bot
   */
  handleBotQuestion(question: any): void {
    // Si es la pregunta de asesor, iniciar chat con asesor
    if (question.isAdvisor) {
      this.addBotMessage(question.text, SenderType.CUSTOMER);
      setTimeout(() => {
        this.talkToAdvisorWithMessage('Hola, necesito hablar con un asesor. ¿Pueden ayudarme?');
      }, 300);
      return;
    }
    
    // Agregar pregunta del usuario
    this.addBotMessage(question.text, SenderType.CUSTOMER);
    
    // Agregar respuesta del bot después de un delay
    setTimeout(() => {
      this.addBotMessage(question.answer, SenderType.BOT);
    }, 500);
  }
  
  /**
   * Inicia el chat con un asesor humano
   */
  talkToAdvisor(): void {
    this.talkToAdvisorWithMessage(null);
  }

  /**
   * Inicia el chat con un asesor y opcionalmente envía un mensaje inicial
   */
  private talkToAdvisorWithMessage(initialMessage: string | null): void {
    console.log('🔄 Iniciando conexión con asesor...');
    this.inBotMode = false;
    
    // Crear sesión de chat
    this.chatService.createSession({
      customerId: this.currentUser.id,
      customerName: this.currentUser.name,
      customerEmail: this.currentUser.email
    }).subscribe({
      next: (session) => {
        console.log('✅ Sesión creada:', session);
        this.currentSession = session;
        this.messages = [];
        
        // Suscribirse a la sesión para recibir mensajes en tiempo real
        this.chatService.subscribeToSession(session.id);
        console.log('✅ Suscrito a la sesión:', session.id);
        
        // Cargar mensajes iniciales (incluyendo mensaje de bienvenida del bot)
        this.chatService.getSessionMessages(session.id).subscribe({
          next: (messages) => {
            console.log('✅ Mensajes cargados:', messages.length);
            this.messages = messages;
            this.scrollToBottom();
            
            // Si hay un mensaje inicial, enviarlo
            if (initialMessage) {
              setTimeout(() => {
                console.log('📤 Enviando mensaje inicial al asesor:', initialMessage);
                this.sendMessageToAdvisor(initialMessage);
              }, 500);
            } else if (messages.length === 0) {
              this.addSystemMessage('¡Conectado! Escribe tu mensaje y un asesor te responderá pronto.');
            }
          },
          error: (error) => {
            console.error('❌ Error al cargar mensajes:', error);
          }
        });
      },
      error: (error) => {
        console.error('❌ Error al crear sesión:', error);
        this.addSystemMessage('Error al conectar con un asesor. Por favor intenta nuevamente.');
        this.inBotMode = true;
      }
    });
  }
  
  /**
   * Envía un mensaje
   */
  sendMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }
    
    const messageContent = this.newMessage.trim();
    this.newMessage = ''; // Limpiar inmediatamente para mejor UX
    
    if (this.inBotMode) {
      // Modo bot - solo mostrar mensaje localmente
      this.addBotMessage(messageContent, SenderType.CUSTOMER);
      
      // Respuesta automática
      setTimeout(() => {
        this.addBotMessage(
          'Para obtener ayuda personalizada, por favor selecciona "¿Quiero hablar con un asesor?".',
          SenderType.BOT
        );
      }, 300);
    } else {
      this.sendMessageToAdvisor(messageContent);
    }
  }

  /**
   * Envía un mensaje al asesor por WebSocket
   */
  private sendMessageToAdvisor(messageContent: string): void {
    // Prevenir envíos duplicados
    if (this.isSending) {
      console.warn('⚠️ Ya hay un envío en proceso, esperando...');
      return;
    }
    
    // Modo asesor - enviar por WebSocket
    if (!this.currentSession) {
      console.error('❌ No hay sesión activa');
      this.addSystemMessage('Por favor inicia una conversación con un asesor primero.');
      return;
    }
    
    this.isSending = true;
    console.log('📤 Enviando mensaje al asesor...', messageContent);
    
    const messageRequest = {
      sessionId: this.currentSession.id,
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderType: SenderType.CUSTOMER,
      content: messageContent,
      messageType: MessageType.TEXT
    };
    
    // Agregar mensaje optimista (se mostrará antes de confirmación del servidor)
    const optimisticMessage: ChatMessage = {
      sessionId: this.currentSession.id,
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderType: SenderType.CUSTOMER,
      content: messageContent,
      sentAt: new Date(),
      read: false,
      messageType: MessageType.TEXT
    };
    
    this.messages.push(optimisticMessage);
    this.scrollToBottom();
    
    // Enviar por WebSocket
    this.chatService.sendMessageViaWebSocket(messageRequest);
    console.log('✅ Mensaje enviado por WebSocket al asesor');
    
    // Liberar flag después de 500ms para permitir el siguiente envío
    setTimeout(() => {
      this.isSending = false;
    }, 500);
  }
  
  /**
   * Agrega un mensaje del bot (solo visual, no persiste)
   */
  private addBotMessage(content: string, senderType: SenderType): void {
    const message: ChatMessage = {
      sessionId: 'bot-session',
      senderId: senderType === SenderType.BOT ? 'bot' : this.currentUser.id,
      senderName: senderType === SenderType.BOT ? 'Nova Assistant' : this.currentUser.name,
      senderType: senderType,
      content: content,
      sentAt: new Date(),
      read: true,
      messageType: MessageType.TEXT
    };
    
    this.messages.push(message);
    this.scrollToBottom();
  }
  
  /**
   * Agrega un mensaje del sistema
   */
  private addSystemMessage(content: string): void {
    this.addBotMessage(content, SenderType.BOT);
  }
  
  /**
   * Scroll automático al final de los mensajes
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
   * Determina si un mensaje es del usuario actual
   */
  isMyMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUser.id;
  }
  
  /**
   * Cierra el chat actual
   */
  closeCurrentChat(): void {
    if (this.currentSession) {
      this.chatService.closeSession(this.currentSession.id).subscribe({
        next: () => {
          this.currentSession = null;
          this.messages = [];
          this.inBotMode = true;
        },
        error: (error) => {
          console.error('Error al cerrar sesión:', error);
        }
      });
    } else {
      this.isOpen = false;
      this.messages = [];
      this.inBotMode = true;
    }
  }
}
