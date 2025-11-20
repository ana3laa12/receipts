
export interface InvoiceData {
  id: string;
  patientName: string;
  procedure: string;
  price: string;
  date: string;
  dayName: string;
  status: 'processing' | 'completed' | 'failed';
  originalImage?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type ViewState = 'dashboard' | 'chat';

export interface User {
  id: string;
  name: string;
  email: string;
}
