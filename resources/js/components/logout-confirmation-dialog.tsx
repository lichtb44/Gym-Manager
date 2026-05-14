import { router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { logout } from '@/routes';

type LogoutConfirmationDialogProps = {
    children: ReactNode;
    onConfirm?: () => void;
};

export function LogoutConfirmationDialog({
    children,
    onConfirm,
}: LogoutConfirmationDialogProps) {
    const confirmLogout = () => {
        onConfirm?.();
        router.post(logout());
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="w-[260px] max-w-[calc(100vw-2rem)] gap-3 rounded-lg border-0 bg-white px-5 py-5 text-center shadow-[0_20px_60px_-20px_rgba(15,23,42,0.45)] sm:max-w-[260px] [&>button]:hidden">
                <DialogHeader className="items-center gap-2 text-center">
                    <div className="flex size-11 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                        <LogOut className="size-5" />
                    </div>
                    <DialogTitle className="text-base font-semibold text-slate-950">
                        Logout
                    </DialogTitle>
                    <DialogDescription className="max-w-[170px] text-center text-xs leading-5 text-slate-600">
                        Are you sure you want to logout?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:justify-stretch">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 rounded-md border-slate-200 text-xs font-semibold text-violet-700 shadow-none hover:bg-violet-50 hover:text-violet-800"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        className="h-9 rounded-md bg-rose-600 text-xs font-semibold text-white shadow-none hover:bg-rose-700"
                        onClick={confirmLogout}
                    >
                        Logout
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
