// Message Types
export interface Message {
  id: string;
  senderId: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: "admin" | "client";
  };
  receiverId: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: "admin" | "client";
  };
  content: string;
  messageType: "text" | "file" | "image";
  fileName?: string;
  fileUrl?: string;
  conversationId: string;
  read: boolean;
  readAt?: string;
  timestamp: string;
}

export interface Conversation {
  conversationId: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: "admin" | "client";
  };
  lastMessage?: Message;
  unreadCount: number;
  messages: Message[];
}

export interface MessageNotification {
  senderId: string;
  senderName: string;
  content: string;
  conversationId: string;
}

export interface TypingData {
  userId: string;
  userName: string;
  conversationId: string;
}

export interface UserOnlineStatus {
  userId: string;
  name: string;
  role: "admin" | "client";
}

export interface MessageReadReceipt {
  conversationId: string;
  readByUserId: string;
  readCount: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface SendMessageData {
  receiverId: string;
  content: string;
  messageType?: "text" | "file" | "image";
  fileName?: string;
  fileUrl?: string;
  tempId?: string;
}

export interface MarkAsReadData {
  conversationId?: string;
  messageIds?: string[];
}

export interface AvailableUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "client";
}

// Redux State Types
export interface MessagesState {
  messages: Message[];
  conversations: Conversation[];
  activeConversation: string | null;
  loading: boolean;
  error: string | null;
  unreadCount: number;
  onlineUsers: string[];
  typingUsers: Record<string, string[]>; // conversationId -> array of user names
}

// Socket Event Types
export interface SocketEvents {
  "message:new": (message: Message) => void;
  "message:sent": (data: { tempId?: string; message: Message }) => void;
  "message:error": (error: { error: string }) => void;
  "notification:new-message": (notification: MessageNotification) => void;
  "message:read-receipt": (data: MessageReadReceipt) => void;
  "message:marked-read": (data: {
    conversationId?: string;
    messageIds?: string[];
    count: number;
  }) => void;
  "typing:user-typing": (data: TypingData) => void;
  "typing:user-stopped": (data: TypingData) => void;
  "user:online": (user: UserOnlineStatus) => void;
  "user:offline": (user: UserOnlineStatus) => void;
  "users:online-list": (users: string[]) => void;
}
