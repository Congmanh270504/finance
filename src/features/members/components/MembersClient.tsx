"use client";

import * as React from "react";
import { FolderCog, Layers3, UserCheck, UserMinus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OverviewCard, type OverviewCardData } from "@/components/ui/card";
import { GroupCrudDialog } from "@/features/groups/components/GroupCrudDialog";
import type { GroupCrudItem } from "@/features/groups/types";
import { sortGroupsByOrder } from "@/features/groups/utils";
import { MembersManagementPanel } from "@/features/members/components/MembersManagementPanel";
import type {
    MemberManagementItem,
    MembersManagementData,
} from "@/features/members/types";

function syncGroupCounts(
    groups: GroupCrudItem[],
    members: MemberManagementItem[],
) {
    return sortGroupsByOrder(
        groups.map((group) => {
            const relatedMembers = members.filter((member) =>
                member.linkedGroupIds.includes(group.id),
            );
            return {
                ...group,
                memberCount: relatedMembers.length,
                activeMemberCount: relatedMembers.filter(
                    (member) => member.isActive,
                ).length,
            };
        }),
    );
}

export function MembersClient({
    managementData,
    isDemo,
}: {
    managementData: MembersManagementData;
    isDemo?: boolean;
}) {
    const [data, setData] =
        React.useState<MembersManagementData>(managementData);
    const [groupDialogOpen, setGroupDialogOpen] = React.useState(false);

    React.useEffect(() => {
        setData(managementData);
    }, [managementData]);

    function updateMembers(nextMembers: MemberManagementItem[]) {
        setData((current) => ({
            groups: syncGroupCounts(current.groups, nextMembers),
            members: nextMembers,
        }));
    }

    function updateGroups(nextGroups: GroupCrudItem[]) {
        setData((current) => ({
            groups: syncGroupCounts(nextGroups, current.members),
            members: current.members.map((member) => {
                const nextLinkedGroupIds = member.linkedGroupIds.filter(
                    (groupId) =>
                        nextGroups.some((group) => group.id === groupId),
                );
                const nextLinkedGroupNames = nextGroups
                    .filter((group) => nextLinkedGroupIds.includes(group.id))
                    .map((group) => group.name);

                return {
                    ...member,
                    linkedGroupIds: nextLinkedGroupIds,
                    linkedGroupNames: nextLinkedGroupNames,
                    linkedGroupLabel:
                        nextLinkedGroupNames.length > 0
                            ? nextLinkedGroupNames.join(", ")
                            : "No groups assigned",
                };
            }),
        }));
    }

    const overviewCards = React.useMemo<OverviewCardData[]>(() => {
        const totalMembers = data.members.length;
        const activeMembers = data.members.filter(
            (member) => member.isActive,
        ).length;
        const inactiveMembers = totalMembers - activeMembers;
        const totalGroups = data.groups.length;
        const averageMembersPerGroup =
            totalGroups > 0 ? (totalMembers / totalGroups).toFixed(1) : "0.0";

        return [
            {
                title: "Total Members",
                value: totalMembers,
                icon: Users,
            },
            {
                title: "Active Members",
                value: activeMembers,
                icon: UserCheck,
            },
            {
                title: "Inactive Members",
                value: inactiveMembers,
                icon: UserMinus,
            },
            {
                title: "Managed Groups",
                value: totalGroups,
                icon: Layers3,
            },
        ];
    }, [data.groups, data.members]);

    return (
        <div className="px-4 pb-4 pt-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-lg font-bold">Members</h1>
                    <p className="text-xs text-muted-foreground">
                        Manage members by group with a grouped table and inline
                        CRUD actions.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="gap-2 self-start"
                    onClick={() => setGroupDialogOpen(true)}
                >
                    <FolderCog className="size-4" />
                    Groups
                </Button>
            </div>

            <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {overviewCards.map((card) => (
                    <OverviewCard key={card.title} data={card} />
                ))}
            </div>

            <MembersManagementPanel
                data={data}
                isDemo={isDemo}
                onMembersChange={updateMembers}
            />

            <GroupCrudDialog
                open={groupDialogOpen}
                onOpenChange={setGroupDialogOpen}
                groups={data.groups}
                isDemo={isDemo}
                onCreated={(group) => updateGroups([...data.groups, group])}
                onReordered={updateGroups}
                onUpdated={(group) =>
                    updateGroups(
                        data.groups.map((item) =>
                            item.id === group.id ? group : item,
                        ),
                    )
                }
                onDeleted={(groupId) =>
                    updateGroups(
                        data.groups.filter((group) => group.id !== groupId),
                    )
                }
            />
        </div>
    );
}
