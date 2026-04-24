"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export type LoginActionState = {
    error?: string;
};

export async function loginAction(
    _previousState: LoginActionState,
    formData: FormData,
): Promise<LoginActionState> {
    const email = String(formData.get("email") ?? "")
        .trim()
        .toLowerCase();
    const password = String(formData.get("password") ?? "").trim();
    const redirectTo = String(formData.get("redirectTo") ?? "/").trim() || "/";

    if (!email || !password) {
        return {
            error: "Vui lòng nhập đầy đủ email và mật khẩu.",
        };
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return {
                error:
                    error.type === "CredentialsSignin"
                        ? "Email hoặc mật khẩu không đúng."
                        : "Không thể đăng nhập lúc này.",
            };
        }

        throw error;
    }

    return {};
}
