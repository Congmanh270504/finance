import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps extends React.ComponentProps<typeof Avatar> {
    src?: string;
    alt?: string;
    fallback?: string;
}

const UserAvatar = ({ src, alt, fallback, className, ...props }: UserAvatarProps) => {
    return (
        <Avatar className={cn("size-8", className)} {...props}>
            <AvatarImage src={src} alt={alt} />
            <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
    );
};

export default UserAvatar;
