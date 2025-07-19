import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  userId: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nouvelle facture',
    message: 'Une nouvelle facture a été créée pour Jean Dupont',
    type: 'info',
    timestamp: '2024-01-20T09:00:00Z',
    read: false,
    userId: 'admin',
  },
  {
    id: '2',
    title: 'Paiement reçu',
    message: 'Paiement de 38 400 € reçu de Jean Dupont',
    type: 'success',
    timestamp: '2024-01-20T14:30:00Z',
    read: false,
    userId: 'admin',
  },
];

const initialState: NotificationsState = {
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter(n => !n.read).length,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount++;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount--;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;