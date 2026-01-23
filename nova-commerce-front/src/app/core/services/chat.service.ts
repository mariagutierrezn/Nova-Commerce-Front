import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChatSession,
  ChatMessage,
  CreateChatSessionRequest,
  SendMessageRequest,
  ChatStats,
  SenderType,
  MessageType
} from '../models/chat.model';
import SockJS from 'sockjs-client';
import { Stomp, CompatClient } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/api/chat`;
  private wsUrl = environment.wsUrl || `${environment.apiUrl}/ws`;
  
  private stompClient: CompatClient | null = null;
  private connected$ = new BehaviorSubject<boolean>(false);
  
  // Observables para mensajes en tiempo real
  private messagesSubject = new Subject<ChatMessage>();
  public messages$ = this.messagesSubject.asObservable();
  
  private newSessionSubject = new Subject<ChatSession>();
  public newSession$ = this.newSessionSubject.asObservable();
  
  private sessionClosedSubject = new Subject<string>();
  public sessionClosed$ = this.sessionClosedSubject.asObservable();
  
  constructor(private http: HttpClient) {}
  
  /**
   * Conecta al WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.stompClient && this.connected$.value) {
        resolve();
        return;
      }
      
      const socket = new SockJS(this.wsUrl);
      this.stompClient = Stomp.over(socket);
      
      // Desactivar logs de debug en producción
      this.stompClient.debug = (msg: string) => {
        if (!environment.production) {
          console.log(msg);
        }
      };
      
      this.stompClient.connect(
        {},
        () => {
          console.log('✅ WebSocket conectado');
          this.connected$.next(true);
          resolve();
        },
        (error: any) => {
          console.error('❌ Error al conectar WebSocket:', error);
          this.connected$.next(false);
          reject(error);
        }
      );
    });
  }
  
  /**
   * Desconecta del WebSocket
   */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('WebSocket desconectado');
        this.connected$.next(false);
      });
    }
  }
  
  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.connected$.value;
  }
  
  /**
   * Se suscribe a los mensajes de una sesión específica
   */
  subscribeToSession(sessionId: string): void {
    if (!this.stompClient || !this.connected$.value) {
      console.error('WebSocket no conectado');
      return;
    }
    
    // Suscribirse al topic de la sesión
    this.stompClient.subscribe(`/topic/chat/${sessionId}`, (message) => {
      const chatMessage: ChatMessage = JSON.parse(message.body);
      this.messagesSubject.next(chatMessage);
    });
    
    // Suscribirse a notificación de cierre de sesión
    this.stompClient.subscribe(`/topic/chat/${sessionId}/closed`, (message) => {
      const session: ChatSession = JSON.parse(message.body);
      this.sessionClosedSubject.next(session.id);
    });
  }
  
  /**
   * Se suscribe a nuevas sesiones (solo para asesores/admin)
   */
  subscribeToNewSessions(): void {
    if (!this.stompClient || !this.connected$.value) {
      console.error('WebSocket no conectado');
      return;
    }
    
    this.stompClient.subscribe('/topic/advisor/new-session', (message) => {
      const session: ChatSession = JSON.parse(message.body);
      this.newSessionSubject.next(session);
    });
  }
  
  /**
   * Envía un mensaje a través de WebSocket
   */
  sendMessageViaWebSocket(request: SendMessageRequest): void {
    if (!this.stompClient || !this.connected$.value) {
      console.error('WebSocket no conectado');
      return;
    }
    
    this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(request));
  }
  
  /**
   * Marca mensajes como leídos vía WebSocket
   */
  markAsReadViaWebSocket(sessionId: string, userId: string): void {
    if (!this.stompClient || !this.connected$.value) {
      console.error('WebSocket no conectado');
      return;
    }
    
    this.stompClient.send(`/app/chat.markAsRead/${sessionId}`, {}, userId);
  }
  
  /**
   * Cierra una sesión vía WebSocket
   */
  closeSessionViaWebSocket(sessionId: string): void {
    if (!this.stompClient || !this.connected$.value) {
      console.error('WebSocket no conectado');
      return;
    }
    
    this.stompClient.send(`/app/chat.close/${sessionId}`, {}, '');
  }
  
  // ============ MÉTODOS REST ============
  
  /**
   * Crea una nueva sesión de chat
   */
  createSession(request: CreateChatSessionRequest): Observable<ChatSession> {
    return this.http.post<ChatSession>(`${this.apiUrl}/sessions`, request);
  }
  
  /**
   * Obtiene todas las sesiones activas
   */
  getActiveSessions(): Observable<ChatSession[]> {
    return this.http.get<ChatSession[]>(`${this.apiUrl}/sessions/active`);
  }
  
  /**
   * Obtiene las sesiones de un cliente
   */
  getCustomerSessions(customerId: string): Observable<ChatSession[]> {
    return this.http.get<ChatSession[]>(`${this.apiUrl}/sessions/customer/${customerId}`);
  }
  
  /**
   * Obtiene los mensajes de una sesión
   */
  getSessionMessages(sessionId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/sessions/${sessionId}/messages`);
  }
  
  /**
   * Envía un mensaje (alternativa REST)
   */
  sendMessage(request: SendMessageRequest): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/messages`, request);
  }
  
  /**
   * Asigna un asesor a una sesión
   */
  assignAdvisor(sessionId: string, advisorId: string, advisorName: string): Observable<ChatSession> {
    return this.http.put<ChatSession>(`${this.apiUrl}/sessions/${sessionId}/assign`, {
      advisorId,
      advisorName
    });
  }
  
  /**
   * Marca mensajes como leídos
   */
  markAsRead(sessionId: string, userId: string, isAdvisor: boolean): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/sessions/${sessionId}/read`,
      null,
      { params: { userId, isAdvisor: isAdvisor.toString() } }
    );
  }
  
  /**
   * Cierra una sesión
   */
  closeSession(sessionId: string): Observable<ChatSession> {
    return this.http.put<ChatSession>(`${this.apiUrl}/sessions/${sessionId}/close`, {});
  }
  
  /**
   * Obtiene estadísticas del chat
   */
  getChatStats(): Observable<ChatStats> {
    return this.http.get<ChatStats>(`${this.apiUrl}/stats`);
  }
}
