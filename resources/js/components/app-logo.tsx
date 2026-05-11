import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm shadow-violet-500/20">
                <AppLogoIcon className="size-5 fill-current" />
            </div>
            <div className="ml-3 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-white">
                    FitCore Gym
                </span>
                <span className="text-xs text-slate-200/80">Admin Dashboard</span>
            </div>
        </>
    );
}
