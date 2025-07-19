import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'file';
  fileName?: string;
}

interface MessagesState {
  messages: Message[];
  loading: boolean;
  activeConversation: string | null;
}

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '1',
    receiverId: 'admin',
    content: 'Bonjour, j\'ai une question concernant ma facture.',
    timestamp: '2024-01-20T10:30:00Z',
    read: true,
    type: 'text',
  },
  {
    id: '2',
    senderId: 'admin',
    receiverId: '1',
    content: 'Bonjour Jean, je suis là pour vous aider. Quelle est votre question ?',
    timestamp: '2024-01-20T10:32:00Z',
    read: true,
    type: 'text',
  },
];

const initialState: MessagesState = {
  messages: mockMessages,
  loading: false,
  activeConversation: null,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const message = state.messages.find(msg => msg.id === action.payload);
      if (message) {
        message.read = true;
      }
    },
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversation = action.payload;
    },
  },
});

export const { setLoading, setMessages, addMessage, markAsRead, setActiveConversation } = messagesSlice.actions;
export default messagesSlice.reducer;