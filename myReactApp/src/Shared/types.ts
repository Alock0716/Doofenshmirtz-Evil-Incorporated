export type DashboardSummary = {
  monthLabel: string;
  incomeTotal: number;
  spendingTotal: number;
  netTotal: number;
  dataAsOf: string; // ISO string or readable
};

export type TransactionRow = {
  transactionId: string;
  date: string; // yyyy-mm-dd
  name: string;
  category: string;
  amount: number; // positive = expense (recommended)
};
