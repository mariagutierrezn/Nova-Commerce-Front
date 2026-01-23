/**
 * Modelos para el sistema de chat en tiempo real
 */

export enum ChatStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED'
}

export enum SenderType {
  CUSTOMER = 'CUSTOMER',
  ADVISOR = 'ADVISOR',
  BOT = 'BOT'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE'
}

export interface ChatMessage {
  id?: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderType: SenderType;
  content: string;
  sentAt: Date | string;
  read: boolean;
  readAt?: Date | string;
  messageType: MessageType;
}

export interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  advisorId?: string;
  advisorName?: string;
  status: ChatStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  closedAt?: Date | string;
  unreadByCustomer: number;
  unreadByAdvisor: number;
  lastActivity: Date | string;
  lastMessage?: ChatMessage;
}

export interface CreateChatSessionRequest {
  customerId: string;
  customerName: string;
  customerEmail?: string;
}

export interface SendMessageRequest {
  sessionId: string;
  senderId: string;
  senderName: string;
  senderType: SenderType;
  content: string;
  messageType?: MessageType;
}

export interface ChatStats {
  waitingSessions: number;
  timestamp: number;
}
