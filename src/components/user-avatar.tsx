import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface UserAvatarProps {
    src?: string;
    alt?: string;
    fallback?: string;
}

const UserAvatar = ({ src, alt, fallback }: UserAvatarProps) => {
    return (
        <Avatar>
            <AvatarImage src={src} alt={alt} />
            <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
    );
};

export default UserAvatar;
