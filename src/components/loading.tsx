import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col flex-1 min-h-screen items-center justify-center bg-slate-50/20">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-slate-200" />
                    <Loader2 className="h-12 w-12 text-blue-800 animate-spin absolute top-0 left-0" />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-slate-700 uppercase tracking-widest animate-pulse">
                        Đang tải dữ liệu
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-1">
                        Vui lòng chờ trong giây lát...
                    </span>
                </div>
            </div>
        </div>
    );
}
