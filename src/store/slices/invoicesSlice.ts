import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

interface InvoicesState {
  invoices: Invoice[];
  loading: boolean;
  selectedInvoice: Invoice | null;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'FAC-2024-001',
    clientId: '1',
    clientName: 'Jean Dupont',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    status: 'paid',
    items: [
      {
        id: '1',
        description: 'Développement application web',
        quantity: 40,
        unitPrice: 800,
        total: 32000,
      },
    ],
    subtotal: 32000,
    tax: 6400,
    total: 38400,
    notes: 'Merci pour votre confiance',
  },
  {
    id: '2',
    number: 'FAC-2024-002',
    clientId: '2',
    clientName: 'Marie Martin',
    date: '2024-01-18',
    dueDate: '2024-02-18',
    status: 'sent',
    items: [
      {
        id: '2',
        description: 'Design UI/UX',
        quantity: 20,
        unitPrice: 600,
        total: 12000,
      },
    ],
    subtotal: 12000,
    tax: 2400,
    total: 14400,
  },
];

const initialState: InvoicesState = {
  invoices: mockInvoices,
  loading: false,
  selectedInvoice: null,
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setInvoices: (state, action: PayloadAction<Invoice[]>) => {
      state.invoices = action.payload;
    },
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.invoices.push(action.payload);
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
    },
    deleteInvoice: (state, action: PayloadAction<string>) => {
      state.invoices = state.invoices.filter(invoice => invoice.id !== action.payload);
    },
    selectInvoice: (state, action: PayloadAction<Invoice | null>) => {
      state.selectedInvoice = action.payload;
    },
  },
});

export const { setLoading, setInvoices, addInvoice, updateInvoice, deleteInvoice, selectInvoice } = invoicesSlice.actions;
export default invoicesSlice.reducer;