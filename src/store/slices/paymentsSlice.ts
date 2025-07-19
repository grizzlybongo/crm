import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Payment {
  id: string;
  invoiceId: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  method: 'bank_transfer' | 'check' | 'cash' | 'card';
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
  notes?: string;
}

interface PaymentsState {
  payments: Payment[];
  loading: boolean;
}

const mockPayments: Payment[] = [
  {
    id: '1',
    invoiceId: '1',
    clientId: '1',
    clientName: 'Jean Dupont',
    amount: 38400,
    date: '2024-01-20',
    method: 'bank_transfer',
    status: 'completed',
    reference: 'VIR-20240120-001',
  },
];

const initialState: PaymentsState = {
  payments: mockPayments,
  loading: false,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.payments = action.payload;
    },
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.push(action.payload);
    },
    updatePayment: (state, action: PayloadAction<Payment>) => {
      const index = state.payments.findIndex(payment => payment.id === action.payload.id);
      if (index !== -1) {
        state.payments[index] = action.payload;
      }
    },
  },
});

export const { setLoading, setPayments, addPayment, updatePayment } = paymentsSlice.actions;
export default paymentsSlice.reducer;