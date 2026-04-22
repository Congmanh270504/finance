type GroupOrderLike = {
    id: string;
    name: string;
    order?: number | null;
    createdAt?: Date | string;
};

function resolveCreatedAt(value?: Date | string) {
    if (!value) return 0;
    if (value instanceof Date) return value.getTime();

    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
}

function resolveOrderValue(order?: number | null) {
    return order ?? Number.MAX_SAFE_INTEGER;
}

export function sortGroupsByOrder<T extends GroupOrderLike>(groups: T[]) {
    return [...groups].sort((left, right) => {
        const orderDifference =
            resolveOrderValue(left.order) - resolveOrderValue(right.order);

        if (orderDifference !== 0) {
            return orderDifference;
        }

        const createdAtDifference =
            resolveCreatedAt(left.createdAt) - resolveCreatedAt(right.createdAt);

        if (createdAtDifference !== 0) {
            return createdAtDifference;
        }

        return left.name.localeCompare(right.name, "vi");
    });
}

export function reorderGroupsByIds<T extends GroupOrderLike>(
    groups: T[],
    activeId: string,
    overId: string,
) {
    const currentIndex = groups.findIndex((group) => group.id === activeId);
    const nextIndex = groups.findIndex((group) => group.id === overId);

    if (currentIndex === -1 || nextIndex === -1 || currentIndex === nextIndex) {
        return groups;
    }

    const nextGroups = [...groups];
    const [movedGroup] = nextGroups.splice(currentIndex, 1);
    nextGroups.splice(nextIndex, 0, movedGroup);

    return nextGroups.map((group, index) => ({
        ...group,
        order: index,
    }));
}
