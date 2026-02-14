
export enum AccountType {
  BANK = 'BANK',
  WALLET = 'WALLET',
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  PAY_LATER = 'PAY_LATER'
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  REFUND_EXPECTED = 'REFUND_EXPECTED'
}

export enum DebtType {
  TO_PAY = 'TO_PAY',
  TO_COLLECT = 'TO_COLLECT'
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string; // Only for local mock auth
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  isLiability: boolean;
  lastFourDigits?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  category: 'Personal' | 'Home (Refundable)' | 'Work (Refundable)' | 'Faltu' | 'Income' | 'Others';
  date: string;
  description: string;
}

export interface Debt {
  id: string;
  person: string;
  amount: number;
  type: DebtType;
  description: string;
}

export interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  debts: Debt[];
}
