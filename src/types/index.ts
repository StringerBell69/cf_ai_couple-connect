export type User = 'Wendy' | 'Daniel';

export interface Note {
  id: string;
  author: User;
  content: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
