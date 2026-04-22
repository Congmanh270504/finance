"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "./ui/spinner";

type DeleteDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    loading?: boolean;
    title?: string;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
};

export default function DeleteDialog({
    open,
    onOpenChange,
    onConfirm,
    loading = false,
    title = "Xóa dữ liệu",
    description = "Bạn có chắc muốn xóa? Thao tác này không thể hoàn tác.",
    confirmText = "Xóa",
    cancelText = "Hủy",
}: DeleteDialogProps) {
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && loading) return;
        onOpenChange(nextOpen);
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="max-w-md z-70">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-bold text-rose-600">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel disabled={loading}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-rose-600 hover:bg-rose-700 text-white"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? <Spinner /> : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
