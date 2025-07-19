import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  createdAt: string;
  lastActivity: string;
  status: 'active' | 'inactive';
  totalInvoices: number;
  totalPaid: number;
  totalPending: number;
}

interface ClientsState {
  clients: Client[];
  loading: boolean;
  selectedClient: Client | null;
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '01 23 45 67 89',
    company: 'Tech Solutions SAS',
    address: '123 Rue de la République, 75001 Paris',
    createdAt: '2024-01-15',
    lastActivity: '2024-01-20',
    status: 'active',
    totalInvoices: 12,
    totalPaid: 45000,
    totalPending: 8500,
  },
  {
    id: '2',
    name: 'Marie Martin',
    email: 'marie.martin@email.com',
    phone: '01 34 56 78 90',
    company: 'Design Studio SARL',
    address: '456 Avenue des Champs, 69001 Lyon',
    createdAt: '2024-01-10',
    lastActivity: '2024-01-18',
    status: 'active',
    totalInvoices: 8,
    totalPaid: 32000,
    totalPending: 4200,
  },
];

const initialState: ClientsState = {
  clients: mockClients,
  loading: false,
  selectedClient: null,
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setClients: (state, action: PayloadAction<Client[]>) => {
      state.clients = action.payload;
    },
    addClient: (state, action: PayloadAction<Client>) => {
      state.clients.push(action.payload);
    },
    updateClient: (state, action: PayloadAction<Client>) => {
      const index = state.clients.findIndex(client => client.id === action.payload.id);
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
    },
    deleteClient: (state, action: PayloadAction<string>) => {
      state.clients = state.clients.filter(client => client.id !== action.payload);
    },
    selectClient: (state, action: PayloadAction<Client | null>) => {
      state.selectedClient = action.payload;
    },
  },
});

export const { setLoading, setClients, addClient, updateClient, deleteClient, selectClient } = clientsSlice.actions;
export default clientsSlice.reducer;