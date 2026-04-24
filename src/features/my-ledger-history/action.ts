"use server";

import type { Prisma } from "@prisma/client";
import { getCurrentUserContext } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { myLedgerHistoryQuerySchema } from "@/features/my-ledger-history/schema";
import type {
    MyLedgerHistoryItem,
    MyLedgerHistoryResult,
} from "@/features/my-ledger-history/types";

function buildSourceLabel(entry: {
    sourceExpenseTitle?: string | null;
    note?: string | null;
    type: string;
}) {
    if (entry.sourceExpenseTitle?.trim()) {
        return entry.sourceExpenseTitle.trim();
    }

    if (entry.note?.trim()) {
        return entry.note.trim();
    }

    return entry.type
        .toLowerCase()
        .split("_")
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(" ");
}

export async function getMyLedgerHistory(
    rawParams: unknown,
): Promise<MyLedgerHistoryResult> {
    const context = await getCurrentUserContext();

    if (!context) {
        return {
            items: [],
            groups: [],
            pagination: {
                total: 0,
                page: 1,
                limit: 20,
            },
            filters: {
                query: "",
                groupId: "",
            },
            summary: {
                increaseAmount: 0,
                decreaseAmount: 0,
                netAmount: 0,
            },
        };
    }

    const parsed = myLedgerHistoryQuerySchema.parse(rawParams);
    const query = parsed.query?.trim() ?? "";
    const groupId = parsed.groupId?.trim() ?? "";
    const skip = (parsed.page - 1) * parsed.limit;
    const userId = context.user.id;

    const where: Prisma.BalanceLedgerHistoryWhereInput = {
        OR: [{ fromMemberId: userId }, { toMemberId: userId }],
        ...(groupId ? { groupId } : {}),
        ...(query
            ? {
                  AND: [
                      {
                          OR: [
                              {
                                  sourceExpenseTitle: {
                                      contains: query,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  note: {
                                      contains: query,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  fromMemberNameSnapshot: {
                                      contains: query,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  toMemberNameSnapshot: {
                                      contains: query,
                                      mode: "insensitive",
                                  },
                              },
                          ],
                      },
                  ],
              }
            : {}),
    };

    const [rawItems, total, rawSummary] = await Promise.all([
        prisma.balanceLedgerHistory.findMany({
            where,
            include: {
                group: {
                    select: {
                        name: true,
                        currency: true,
                    },
                },
            },
            orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
            skip,
            take: parsed.limit,
        }),
        prisma.balanceLedgerHistory.count({ where }),
        prisma.balanceLedgerHistory.findMany({
            where,
            select: {
                fromMemberId: true,
                toMemberId: true,
                deltaAmount: true,
            },
        }),
    ]);

    const items: MyLedgerHistoryItem[] = rawItems.map((item) => {
        const direction =
            item.toMemberId === userId ? "increase" : "decrease";
        const counterpartyName =
            direction === "increase"
                ? item.fromMemberNameSnapshot
                : item.toMemberNameSnapshot;

        return {
            ...item,
            groupName: item.group.name,
            groupCurrency: item.group.currency,
            counterpartyName,
            direction,
            signedAmount:
                direction === "increase"
                    ? item.deltaAmount
                    : -Math.abs(item.deltaAmount),
            sourceLabel: buildSourceLabel(item),
        };
    });

    const summary = rawSummary.reduce(
        (accumulator, item) => {
            if (item.toMemberId === userId) {
                accumulator.increaseAmount += item.deltaAmount;
                accumulator.netAmount += item.deltaAmount;
            } else {
                accumulator.decreaseAmount += item.deltaAmount;
                accumulator.netAmount -= item.deltaAmount;
            }

            return accumulator;
        },
        {
            increaseAmount: 0,
            decreaseAmount: 0,
            netAmount: 0,
        },
    );

    return {
        items,
        groups: context.memberships.map((membership) => ({
            id: membership.groupId,
            name: membership.name,
            currency: membership.currency,
        })),
        pagination: {
            total,
            page: parsed.page,
            limit: parsed.limit,
        },
        filters: {
            query,
            groupId,
        },
        summary,
    };
}
