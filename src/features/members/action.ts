"use server";

import { hash } from "bcryptjs";
import type { BalanceLedger, Group, User, User_Groups } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { DEMO_GROUP_NAME } from "@/features/finance/constants";
import { financeV1Fixtures } from "@/features/finance/mock-fixtures";
import { sortGroupsByOrder } from "@/features/groups/utils";
import {
    assignExistingMembersSchema,
    createMemberSchema,
    updateMemberSchema,
} from "@/features/members/schema";
import type {
    MemberGroupItem,
    MemberManagementItem,
    MembersActionResponse,
    MembersManagementData,
} from "@/features/members/types";
import prisma from "@/lib/prisma";

type LedgerLite = Pick<BalanceLedger, "fromMemberId" | "toMemberId" | "amount">;
type UserGroupLinkLite = Pick<User_Groups, "userId" | "groupId" | "createdAt">;

function normalizeOptionalText(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}

function normalizeLinkedGroupIds(linkedGroupIds?: string[]) {
    return Array.from(
        new Set((linkedGroupIds ?? []).map((value) => value.trim()).filter(Boolean)),
    );
}

function computeMemberStats(ledgers: LedgerLite[]) {
    const stats = new Map<
        string,
        { oweAmount: number; receiveAmount: number; ledgerCount: number }
    >();

    for (const ledger of ledgers) {
        const debtor = stats.get(ledger.fromMemberId) ?? {
            oweAmount: 0,
            receiveAmount: 0,
            ledgerCount: 0,
        };
        debtor.oweAmount += ledger.amount;
        debtor.ledgerCount += 1;
        stats.set(ledger.fromMemberId, debtor);

        const creditor = stats.get(ledger.toMemberId) ?? {
            oweAmount: 0,
            receiveAmount: 0,
            ledgerCount: 0,
        };
        creditor.receiveAmount += ledger.amount;
        creditor.ledgerCount += 1;
        stats.set(ledger.toMemberId, creditor);
    }

    return stats;
}

function buildLinkedGroupMap(userGroups: UserGroupLinkLite[]) {
    return userGroups.reduce<Map<string, string[]>>((accumulator, link) => {
        const current = accumulator.get(link.userId) ?? [];
        current.push(link.groupId);
        accumulator.set(link.userId, current);
        return accumulator;
    }, new Map());
}

function attachGroupCounts(
    groups: Group[],
    users: User[],
    linkedGroupMap: Map<string, string[]>,
): MemberGroupItem[] {
    return sortGroupsByOrder(
        groups.map((group) => {
            const groupMembers = users.filter((member) =>
                (linkedGroupMap.get(member.id) ?? []).includes(group.id),
            );

            return {
                ...group,
                memberCount: groupMembers.length,
                activeMemberCount: groupMembers.filter((member) => member.isActive)
                    .length,
            };
        }),
    );
}

function buildManagementData(
    groups: Group[],
    users: User[],
    ledgers: LedgerLite[],
    userGroups: UserGroupLinkLite[],
): MembersManagementData {
    const groupMap = new Map(groups.map((group) => [group.id, group]));
    const linkedGroupMap = buildLinkedGroupMap(userGroups);
    const stats = computeMemberStats(ledgers);

    const members: MemberManagementItem[] = users
        .map((member) => {
            const linkedGroupIds = normalizeLinkedGroupIds(
                linkedGroupMap.get(member.id),
            );
            const linkedGroupNames = linkedGroupIds
                .map((groupId) => groupMap.get(groupId)?.name)
                .filter((groupName): groupName is string => Boolean(groupName));
            const memberStats = stats.get(member.id);
            const oweAmount = memberStats?.oweAmount ?? 0;
            const receiveAmount = memberStats?.receiveAmount ?? 0;

            return {
                ...member,
                linkedGroupIds,
                linkedGroupNames,
                linkedGroupLabel:
                    linkedGroupNames.length > 0
                        ? linkedGroupNames.join(", ")
                        : "No groups assigned",
                oweAmount,
                receiveAmount,
                netAmount: receiveAmount - oweAmount,
                ledgerCount: memberStats?.ledgerCount ?? 0,
            };
        })
        .sort((left, right) => left.name.localeCompare(right.name, "vi"));

    return {
        groups: attachGroupCounts(groups, users, linkedGroupMap),
        members,
    };
}

function buildDemoManagementData(): MembersManagementData {
    const createdAt = new Date(financeV1Fixtures.balancesSummary.generatedAt);
    const demoGroup = {
        id: financeV1Fixtures.balancesSummary.groupId,
        name: DEMO_GROUP_NAME,
        currency: "VND",
        order: 0,
        imgUrl: null,
        createdAt,
        updatedAt: createdAt,
    } satisfies Group;

    const balanceByMemberId = new Map(
        financeV1Fixtures.balancesSummary.memberBalances.map((member) => [
            member.memberId,
            member.netAmount,
        ]),
    );

    const users: User[] = financeV1Fixtures.balancesSummary.memberBalances.map(
        (member) => ({
            id: member.memberId,
            name: member.memberName,
            email: `${member.memberName
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, ".")
                .toLowerCase()}@demo.local`,
            nickname: null,
            passwordHash: null,
            phone: null,
            address: null,
            imgUrl: null,
            username: null,
            bio: null,
            pronouns: null,
            profileUrl: null,
            company: null,
            location: null,
            avatarTone: null,
            isActive: true,
            createdAt,
            updatedAt: createdAt,
        }),
    );

    const userGroups: UserGroupLinkLite[] = users.map((user) => ({
        userId: user.id,
        groupId: demoGroup.id,
        createdAt,
    }));

    const ledgers: LedgerLite[] = financeV1Fixtures.balancesSummary.ledger.map(
        (ledger) => ({
            fromMemberId: ledger.fromMemberId,
            toMemberId: ledger.toMemberId,
            amount: ledger.amount,
        }),
    );

    const data = buildManagementData([demoGroup], users, ledgers, userGroups);
    return {
        ...data,
        members: data.members.map((member) => ({
            ...member,
            netAmount: balanceByMemberId.get(member.id) ?? member.netAmount,
        })),
    };
}

function memberErrorMessage(error: unknown, fallback: string) {
    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
    ) {
        return "Email already exists";
    }

    return error instanceof Error ? error.message : fallback;
}

async function syncMemberGroups(memberId: string, linkedGroupIds: string[]) {
    await prisma.user_Groups.deleteMany({
        where: { userId: memberId },
    });

    if (linkedGroupIds.length === 0) {
        return;
    }

    await prisma.user_Groups.createMany({
        data: linkedGroupIds.map((groupId) => ({
            userId: memberId,
            groupId,
        })),
    });
}

async function buildMemberItemById(
    memberId: string,
): Promise<MemberManagementItem | null> {
    const [member, groups, userGroups, ledgers] = await Promise.all([
        prisma.user.findUnique({ where: { id: memberId } }),
        prisma.group.findMany({
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        }),
        prisma.user_Groups.findMany({
            where: { userId: memberId },
            select: { userId: true, groupId: true, createdAt: true },
            orderBy: { createdAt: "asc" },
        }),
        prisma.balanceLedger.findMany({
            where: {
                OR: [{ fromMemberId: memberId }, { toMemberId: memberId }],
            },
            select: {
                fromMemberId: true,
                toMemberId: true,
                amount: true,
            },
        }),
    ]);

    if (!member) return null;

    return (
        buildManagementData(groups, [member], ledgers, userGroups).members[0] ?? null
    );
}

async function buildMemberItemsByIds(
    memberIds: string[],
): Promise<MemberManagementItem[]> {
    const normalizedIds = Array.from(new Set(memberIds.filter(Boolean)));

    if (normalizedIds.length === 0) {
        return [];
    }

    const [members, groups, userGroups, ledgers] = await Promise.all([
        prisma.user.findMany({
            where: {
                id: {
                    in: normalizedIds,
                },
            },
        }),
        prisma.group.findMany({
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        }),
        prisma.user_Groups.findMany({
            where: {
                userId: {
                    in: normalizedIds,
                },
            },
            select: {
                userId: true,
                groupId: true,
                createdAt: true,
            },
            orderBy: { createdAt: "asc" },
        }),
        prisma.balanceLedger.findMany({
            where: {
                OR: [
                    { fromMemberId: { in: normalizedIds } },
                    { toMemberId: { in: normalizedIds } },
                ],
            },
            select: {
                fromMemberId: true,
                toMemberId: true,
                amount: true,
            },
        }),
    ]);

    return buildManagementData(groups, members, ledgers, userGroups).members.filter(
        (member) => normalizedIds.includes(member.id),
    );
}

export async function getMembersManagementData(): Promise<{
    data: MembersManagementData;
    isDemo: boolean;
}> {
    try {
        const [groups, members, userGroups, ledgers] = await Promise.all([
            prisma.group.findMany({
                orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            }),
            prisma.user.findMany({
                orderBy: { createdAt: "desc" },
            }),
            prisma.user_Groups.findMany({
                select: {
                    userId: true,
                    groupId: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "asc" },
            }),
            prisma.balanceLedger.findMany({
                select: {
                    fromMemberId: true,
                    toMemberId: true,
                    amount: true,
                },
            }),
        ]);

        return {
            data: buildManagementData(groups, members, ledgers, userGroups),
            isDemo: false,
        };
    } catch {
        return {
            data: buildDemoManagementData(),
            isDemo: true,
        };
    }
}

export async function createMemberAction(
    input: unknown,
): Promise<MembersActionResponse<MemberManagementItem>> {
    const parsed = createMemberSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error:
                parsed.error.issues[0]?.message ??
                "Invalid member data",
        };
    }

    try {
        const linkedGroupIds = normalizeLinkedGroupIds(parsed.data.linkedGroupIds);

        const created = await prisma.user.create({
            data: {
                name: parsed.data.name,
                email: parsed.data.email.toLowerCase(),
                passwordHash: await hash(parsed.data.password, 10),
                imgUrl: normalizeOptionalText(parsed.data.imgUrl),
                isActive: parsed.data.isActive,
            },
        });

        await syncMemberGroups(created.id, linkedGroupIds);

        const item = await buildMemberItemById(created.id);

        revalidatePath("/members");

        return item
            ? { success: true, data: item }
            : { success: false, error: "Unable to normalize member data" };
    } catch (error) {
        return {
            success: false,
            error: memberErrorMessage(error, "Unable to create member"),
        };
    }
}

export async function updateMemberAction(
    input: unknown,
): Promise<MembersActionResponse<MemberManagementItem>> {
    const parsed = updateMemberSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error:
                parsed.error.issues[0]?.message ??
                "Invalid member update data",
        };
    }

    try {
        const linkedGroupIds = normalizeLinkedGroupIds(parsed.data.linkedGroupIds);

        await prisma.user.update({
            where: { id: parsed.data.id },
            data: {
                name: parsed.data.name,
                email: parsed.data.email.toLowerCase(),
                imgUrl: normalizeOptionalText(parsed.data.imgUrl),
                isActive: parsed.data.isActive,
                ...(parsed.data.password?.trim()
                    ? {
                          passwordHash: await hash(parsed.data.password.trim(), 10),
                      }
                    : {}),
            },
        });

        await syncMemberGroups(parsed.data.id, linkedGroupIds);

        const item = await buildMemberItemById(parsed.data.id);

        revalidatePath("/members");

        return item
            ? { success: true, data: item }
            : {
                  success: false,
                  error: "Unable to load member data after update",
              };
    } catch (error) {
        return {
            success: false,
            error: memberErrorMessage(error, "Unable to update member"),
        };
    }
}

export async function assignExistingMembersToGroupsAction(
    input: unknown,
): Promise<MembersActionResponse<MemberManagementItem[]>> {
    const parsed = assignExistingMembersSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error:
                parsed.error.issues[0]?.message ??
                "Invalid user assignment data",
        };
    }

    try {
        const userIds = Array.from(new Set(parsed.data.userIds));
        const linkedGroupIds = normalizeLinkedGroupIds(parsed.data.linkedGroupIds);
        const existingLinks = await prisma.user_Groups.findMany({
            where: {
                userId: { in: userIds },
                groupId: { in: linkedGroupIds },
            },
            select: {
                userId: true,
                groupId: true,
            },
        });

        const existingKeySet = new Set(
            existingLinks.map((item) => `${item.userId}:${item.groupId}`),
        );
        const nextLinks = userIds.flatMap((userId) =>
            linkedGroupIds
                .filter((groupId) => !existingKeySet.has(`${userId}:${groupId}`))
                .map((groupId) => ({
                    userId,
                    groupId,
                })),
        );

        if (nextLinks.length > 0) {
            await prisma.user_Groups.createMany({
                data: nextLinks,
            });
        }

        const items = await buildMemberItemsByIds(userIds);

        revalidatePath("/members");

        return {
            success: true,
            data: items,
        };
    } catch (error) {
        return {
            success: false,
            error: memberErrorMessage(error, "Unable to assign users to groups"),
        };
    }
}

export async function deleteMemberAction(
    memberId: string,
): Promise<MembersActionResponse<{ id: string }>> {
    if (!memberId) {
        return { success: false, error: "Member ID is required" };
    }

    try {
        const [
            paidExpenseCount,
            splitShareCount,
            outgoingSettlementCount,
            incomingSettlementCount,
            debtCount,
            creditCount,
        ] = await prisma.$transaction([
            prisma.expense.count({ where: { paidByMemberId: memberId } }),
            prisma.splitShare.count({ where: { memberId } }),
            prisma.settlement.count({ where: { fromMemberId: memberId } }),
            prisma.settlement.count({ where: { toMemberId: memberId } }),
            prisma.balanceLedger.count({ where: { fromMemberId: memberId } }),
            prisma.balanceLedger.count({ where: { toMemberId: memberId } }),
        ]);

        const referencedCount =
            paidExpenseCount +
            splitShareCount +
            outgoingSettlementCount +
            incomingSettlementCount +
            debtCount +
            creditCount;

        if (referencedCount > 0) {
            return {
                success: false,
                error: "This member is linked to transaction data and cannot be deleted yet.",
            };
        }

        await prisma.user_Groups.deleteMany({
            where: { userId: memberId },
        });

        await prisma.user.delete({
            where: { id: memberId },
        });

        revalidatePath("/members");

        return {
            success: true,
            data: { id: memberId },
        };
    } catch (error) {
        return {
            success: false,
            error: memberErrorMessage(error, "Unable to delete member"),
        };
    }
}
