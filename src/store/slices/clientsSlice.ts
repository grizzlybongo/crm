import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
  avatar?: string;
  role?: string;
}

interface ClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  selectedClient: Client | null;
}

// Async thunks
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { rejectWithValue, getState }: any) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      // Get client users from auth API
      const response = await axios.get(`${API_URL}/auth/client-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Get invoices to calculate totals
      const invoicesResponse = await axios.get(`${API_URL}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const invoices = invoicesResponse.data.data || [];
      const clients = response.data.data || [];

      // Calculate invoice totals for each client
      return clients.map((client: Client) => {
        const clientInvoices = invoices.filter((invoice: any) => 
          invoice.clientId === client.id || 
          (invoice.clientName && invoice.clientName.includes(client.name))
        );
        
        const totalInvoices = clientInvoices.length;
        const totalPaid = clientInvoices
          .filter((invoice: any) => invoice.status === 'paid')
          .reduce((sum: number, invoice: any) => sum + invoice.total, 0);
        
        const totalPending = clientInvoices
          .filter((invoice: any) => invoice.status !== 'paid')
          .reduce((sum: number, invoice: any) => sum + invoice.total, 0);

        return {
          ...client,
          totalInvoices,
          totalPaid,
          totalPending
        };
      });
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch client users'
      );
    }
  }
);

export const createClientThunk = createAsyncThunk(
  'clients/createClient',
  async (clientData: Omit<Client, 'id'>, { rejectWithValue, getState }: any) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.post(API_URL, clientData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create client'
      );
    }
  }
);

export const updateClientThunk = createAsyncThunk(
  'clients/updateClient',
  async ({ id, ...clientData }: Client, { rejectWithValue, getState }: any) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.patch(`${API_URL}/${id}`, clientData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update client'
      );
    }
  }
);

export const deleteClientThunk = createAsyncThunk(
  'clients/deleteClient',
  async (id: string, { rejectWithValue, getState }: any) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete client'
      );
    }
  }
);

const initialState: ClientsState = {
  clients: [],
  loading: false,
  error: null,
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
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch clients
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create client
    builder
      .addCase(createClientThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClientThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.clients.push(action.payload);
      })
      .addCase(createClientThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update client
    builder
      .addCase(updateClientThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClientThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clients.findIndex(client => client.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
      })
      .addCase(updateClientThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete client
    builder
      .addCase(deleteClientThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClientThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = state.clients.filter(client => client.id !== action.payload);
      })
      .addCase(deleteClientThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setLoading, 
  setClients, 
  addClient, 
  updateClient, 
  deleteClient, 
  selectClient,
  clearError
} = clientsSlice.actions;
export default clientsSlice.reducer;