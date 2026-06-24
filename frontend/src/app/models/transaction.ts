export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO format date string
}

export type TransactionPayload = Omit<Transaction, 'id'>;