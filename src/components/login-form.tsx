"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginAction, type LoginActionState } from "@/app/login/actions";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const initialState: LoginActionState = {};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Đang đăng nhập..." : "Login"}
        </Button>
    );
}

export function LoginForm({
    className,
    redirectTo = "/",
    ...props
}: React.ComponentProps<"div"> & {
    redirectTo?: string;
}) {
    const [state, formAction] = React.useActionState(loginAction, initialState);

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Nhập email và mật khẩu để đăng nhập vào ứng dụng.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction}>
                        <input
                            type="hidden"
                            name="redirectTo"
                            value={redirectTo}
                        />
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center justify-between">
                                    <FieldLabel htmlFor="password">
                                        Password
                                    </FieldLabel>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <p className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                                                Forgot your password?
                                            </p>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Liên hệ quản trị để cấp lại mật khẩu.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                />
                            </Field>
                            {state.error ? (
                                <p className="text-sm text-destructive">
                                    {state.error}
                                </p>
                            ) : null}
                            <Field>
                                <SubmitButton />
                                <FieldDescription className="text-center">
                                    User cũ chưa có mật khẩu riêng có thể dùng
                                    mật khẩu bootstrap mà quản trị cấu hình.
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
