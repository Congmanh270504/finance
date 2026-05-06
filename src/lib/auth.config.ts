import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
    session: {
        strategy: "jwt",
    },
    trustHost: true,
    pages: {
        signIn: "/login",
    },
    providers: [],
    callbacks: {
        authorized({ auth }) {
            return !!auth;
        },
    },
};
