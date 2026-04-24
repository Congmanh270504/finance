import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import prisma from "@/lib/prisma";

const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().trim().min(1),
});

async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: {
            email,
        },
        include: {
            User_Groups: {
                select: {
                    groupId: true,
                    Group: {
                        select: {
                            name: true,
                            currency: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "asc",
                },
            },
        },
    });
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: {
        strategy: "jwt",
    },
    trustHost: true,
    pages: {
        signIn: "/login",
    },
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsed = loginSchema.safeParse(credentials);

                if (!parsed.success) {
                    return null;
                }

                const user = await findUserByEmail(parsed.data.email);

                if (!user || !user.isActive) {
                    return null;
                }

                const bootstrapPassword =
                    process.env.AUTH_BOOTSTRAP_PASSWORD?.trim() ?? "";
                const passwordMatches = user.passwordHash
                    ? await compare(parsed.data.password, user.passwordHash)
                    : bootstrapPassword.length > 0 &&
                      parsed.data.password === bootstrapPassword;

                if (!passwordMatches) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.imgUrl ?? undefined,
                };
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.picture = user.image;
            }

            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = String(token.id ?? "");
                session.user.image =
                    typeof token.picture === "string" ? token.picture : null;
            }

            return session;
        },
    },
});

export async function getCurrentUser() {
    const session = await auth();

    if (!session?.user?.email) {
        return null;
    }

    return findUserByEmail(session.user.email);
}

export async function getCurrentUserContext() {
    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    const primaryGroup = user.User_Groups[0]?.Group;
    const primaryGroupId = user.User_Groups[0]?.groupId ?? null;
    const primaryGroupMemberCount = primaryGroupId
        ? await prisma.user_Groups.count({
              where: {
                  groupId: primaryGroupId,
              },
          })
        : 0;

    return {
        user,
        memberships: user.User_Groups.map((membership) => ({
            groupId: membership.groupId,
            name: membership.Group.name,
            currency: membership.Group.currency,
        })),
        primaryGroupId,
        primaryGroupName: primaryGroup?.name ?? "Finance",
        primaryGroupMemberCount,
    };
}
