import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { auth } = usePage().props;
    const label = auth.user?.role === 'admin' ? 'Admin Dashboard' : 'Member Portal';

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm shadow-violet-500/20">
                <AppLogoIcon className="size-5 fill-current" />
            </div>
            <div className="ml-3 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-slate-950">
                    FitCore Gym
                </span>
                <span className="text-xs text-slate-500">{label}</span>
            </div>
        </>
    );
}
