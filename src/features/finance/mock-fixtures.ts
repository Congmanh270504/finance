import { FinanceV1Fixtures } from "@/features/finance/type";

export const financeV1Fixtures: FinanceV1Fixtures = {
  createExpenseRequest: {
    groupId: "65f1a4101ecf2c4dc9c5d111",
    title: "Cafe + snacks",
    amount: 120000,
    paidByMemberId: "65f1a4101ecf2c4dc9c5d201",
    participantMemberIds: [
      "65f1a4101ecf2c4dc9c5d201",
      "65f1a4101ecf2c4dc9c5d202",
      "65f1a4101ecf2c4dc9c5d203",
    ],
    shareStrategy: "EQUAL",
    notes: "Team retro snacks",
    occurredAt: "2026-03-28T07:30:00.000Z",
  },
  expenseHistory: {
    items: [
      {
        expenseId: "65f1a4101ecf2c4dc9c5d311",
        groupId: "65f1a4101ecf2c4dc9c5d111",
        title: "Cafe + snacks",
        amount: 120000,
        paidByMemberId: "65f1a4101ecf2c4dc9c5d201",
        paidByMemberName: "An",
        shareStrategy: "EQUAL",
        shares: [
          { memberId: "65f1a4101ecf2c4dc9c5d201", memberName: "An", amount: 40000 },
          { memberId: "65f1a4101ecf2c4dc9c5d202", memberName: "Binh", amount: 40000 },
          { memberId: "65f1a4101ecf2c4dc9c5d203", memberName: "Chi", amount: 40000 },
        ],
        occurredAt: "2026-03-28T07:30:00.000Z",
        createdAt: "2026-03-28T07:30:05.000Z",
      },
    ],
    totalCount: 1,
    limit: 20,
    offset: 0,
    hasMore: false,
  },
  balancesSummary: {
    groupId: "65f1a4101ecf2c4dc9c5d111",
    generatedAt: "2026-03-28T07:35:00.000Z",
    totalOutstanding: 80000,
    ledger: [
      {
        ledgerId: "65f1a4101ecf2c4dc9c5d411",
        groupId: "65f1a4101ecf2c4dc9c5d111",
        fromMemberId: "65f1a4101ecf2c4dc9c5d202",
        fromMemberName: "Binh",
        toMemberId: "65f1a4101ecf2c4dc9c5d201",
        toMemberName: "An",
        amount: 40000,
        sourceExpenseId: "65f1a4101ecf2c4dc9c5d311",
        updatedAt: "2026-03-28T07:30:05.000Z",
      },
      {
        ledgerId: "65f1a4101ecf2c4dc9c5d412",
        groupId: "65f1a4101ecf2c4dc9c5d111",
        fromMemberId: "65f1a4101ecf2c4dc9c5d203",
        fromMemberName: "Chi",
        toMemberId: "65f1a4101ecf2c4dc9c5d201",
        toMemberName: "An",
        amount: 40000,
        sourceExpenseId: "65f1a4101ecf2c4dc9c5d311",
        updatedAt: "2026-03-28T07:30:05.000Z",
      },
    ],
    memberBalances: [
      { memberId: "65f1a4101ecf2c4dc9c5d201", memberName: "An", netAmount: 80000 },
      { memberId: "65f1a4101ecf2c4dc9c5d202", memberName: "Binh", netAmount: -40000 },
      { memberId: "65f1a4101ecf2c4dc9c5d203", memberName: "Chi", netAmount: -40000 },
    ],
  },
  insightsCharts: {
    groupId: "65f1a4101ecf2c4dc9c5d111",
    fromDate: "2026-02-27T00:00:00.000Z",
    toDate: "2026-03-28T23:59:59.000Z",
    bucket: "day",
    totalAmount: 120000,
    expenseCount: 1,
    trend: [
      {
        bucketStart: "2026-03-28T00:00:00.000Z",
        totalAmount: 120000,
        expenseCount: 1,
      },
    ],
    topPayers: [
      {
        memberId: "65f1a4101ecf2c4dc9c5d201",
        memberName: "An",
        totalAmount: 120000,
      },
    ],
  },
  vietQrRequest: {
    bankBin: "970422",
    accountNumber: "0123456789",
    accountName: "AN NGUYEN",
    amount: 40000,
    transferNote: "Tra no cafe",
  },
};
