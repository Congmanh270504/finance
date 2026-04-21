export type ApiVersionV1 = "v1";
export type ShareStrategyV1 = "EQUAL" | "CUSTOM";
export type InsightBucketV1 = "day" | "week" | "month";

export type ExpenseShareInputV1 = { memberId: string; amount: number };

export type CreateExpenseV1Request = {
  groupId: string;
  title: string;
  amount: number;
  paidByMemberId: string;
  participantMemberIds: string[];
  shareStrategy?: ShareStrategyV1;
  shares?: ExpenseShareInputV1[];
  notes?: string;
  occurredAt?: string;
};

export type ExpenseShareV1 = {
  memberId: string;
  memberName: string;
  amount: number;
};

export type ExpenseHistoryItemV1 = {
  expenseId: string;
  groupId: string;
  title: string;
  amount: number;
  paidByMemberId: string;
  paidByMemberName: string;
  shareStrategy: ShareStrategyV1;
  shares: ExpenseShareV1[];
  notes?: string | null;
  occurredAt: string;
  createdAt: string;
};

export type BalanceLedgerEntryV1 = {
  ledgerId: string;
  groupId: string;
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
  sourceExpenseId?: string | null;
  updatedAt: string;
};

export type CreateExpenseV1Response = {
  expense: ExpenseHistoryItemV1;
  ledgerUpdates: BalanceLedgerEntryV1[];
};

export type ExpenseHistoryResponseV1 = {
  items: ExpenseHistoryItemV1[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type MemberBalanceV1 = {
  memberId: string;
  memberName: string;
  netAmount: number;
};

export type BalancesSummaryResponseV1 = {
  groupId: string;
  generatedAt: string;
  totalOutstanding: number;
  ledger: BalanceLedgerEntryV1[];
  memberBalances: MemberBalanceV1[];
};

export type InsightPointV1 = {
  bucketStart: string;
  totalAmount: number;
  expenseCount: number;
};

export type TopPayerInsightV1 = {
  memberId: string;
  memberName: string;
  totalAmount: number;
};

export type InsightsChartsResponseV1 = {
  groupId: string;
  fromDate: string;
  toDate: string;
  bucket: InsightBucketV1;
  totalAmount: number;
  expenseCount: number;
  trend: InsightPointV1[];
  topPayers: TopPayerInsightV1[];
};

export type GenerateVietQrRequestV1 = {
  bankBin: string;
  accountNumber: string;
  accountName?: string;
  amount: number;
  transferNote: string;
};

export type GenerateVietQrResponseV1 = {
  payload: string;
  qrImageUrl: string;
  amount: number;
  transferNote: string;
  bankBin: string;
  accountNumber: string;
};

export type FinanceV1Fixtures = {
  createExpenseRequest: CreateExpenseV1Request;
  expenseHistory: ExpenseHistoryResponseV1;
  balancesSummary: BalancesSummaryResponseV1;
  insightsCharts: InsightsChartsResponseV1;
  vietQrRequest: GenerateVietQrRequestV1;
};

export type ApiSuccessV1<T> = { version: ApiVersionV1; data: T };
export type ApiErrorV1 = {
  version: ApiVersionV1;
  error: { code: string; message: string; details?: unknown };
};
