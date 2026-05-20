import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login, home, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="FitCore Gym - Premium Fitness Membership" />
            <div className="grid min-h-svh bg-white lg:grid-cols-[minmax(0,1.2fr)_minmax(460px,0.8fr)]">
                <div className="relative hidden min-h-svh overflow-hidden bg-slate-950 text-white lg:block">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_38%,rgba(255,255,255,0.18),transparent_10%),linear-gradient(115deg,rgba(2,6,23,0.25),rgba(2,6,23,0.92)),linear-gradient(140deg,#111827_0%,#020617_45%,#111827_100%)]" />
                    <div className="absolute inset-0 [background-image:linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:92px_92px] opacity-45" />
                    <div className="absolute top-20 left-20 h-2 w-28 -rotate-[24deg] rounded-full bg-white/75 blur-[1px]" />
                    <div className="absolute top-36 left-2 h-2 w-44 -rotate-[24deg] rounded-full bg-white/70 blur-[1px]" />
                    <div className="absolute right-24 bottom-56 h-60 w-20 rounded-full border-[18px] border-slate-600/60" />
                    <div className="absolute right-4 bottom-72 h-8 w-48 rounded-full bg-slate-700/70" />
                    <div className="absolute right-24 bottom-72 h-48 w-8 rounded-full bg-slate-800/80" />
                    <div className="absolute right-52 bottom-72 h-8 w-48 rounded-full bg-slate-700/70" />
                    <div className="absolute top-36 right-1/3 text-center text-5xl font-black tracking-wide text-white/25">
                        <AppLogoIcon className="mx-auto size-16 fill-current" />
                        <div className="mt-2">FITCORE</div>
                        <div>GYM</div>
                    </div>
                    <div className="absolute bottom-0 left-1/3 h-[520px] w-[360px] rounded-t-full bg-[radial-gradient(circle_at_50%_15%,#f3c9a8_0_10%,transparent_11%),linear-gradient(#111827_0_24%,#0f172a_25%_100%)] shadow-2xl" />
                    <div className="absolute bottom-20 left-[calc(33%+105px)] h-8 w-64 -rotate-12 rounded-full bg-slate-500" />
                    <div className="absolute bottom-16 left-[calc(33%+70px)] size-16 rounded-full border-[12px] border-slate-700" />
                    <div className="absolute bottom-28 left-[calc(33%+300px)] size-16 rounded-full border-[12px] border-slate-700" />
                    <Link
                        href={home()}
                        className="relative z-20 m-10 inline-flex items-center gap-3 text-lg font-semibold"
                    >
                        <AppLogoIcon className="size-11 fill-current text-violet-500" />
                        <span>
                            <span className="block leading-tight">
                                FitCore Gym
                            </span>
                            <span className="block text-sm font-normal text-white/80">
                                Membership Management
                            </span>
                        </span>
                    </Link>
                    <div className="absolute bottom-24 left-12 z-20 max-w-xl">
                        <p className="text-sm font-semibold tracking-[0.55em] text-white/90">
                            STRONGER EVERY DAY
                        </p>
                        <h1 className="mt-4 text-5xl leading-tight font-black tracking-tight">
                            WELCOME TO
                            <br />
                            FITCORE GYM
                        </h1>
                        <p className="mt-6 max-w-lg text-xl leading-8 text-white/90">
                            Manage memberships, plans, attendance, payments, and
                            more, all in one place.
                        </p>
                    </div>
                </div>
                <div className="flex min-h-svh items-center justify-center px-6 py-10 lg:px-16">
                    <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-10">
                        <Link
                            href={home()}
                            className="relative z-20 flex items-center justify-center gap-3 lg:justify-start"
                        >
                            <AppLogoIcon className="size-14 fill-current text-violet-600" />
                            <span>
                                <span className="block text-2xl leading-tight font-bold text-slate-950">
                                    FitCore Gym
                                </span>
                                <span className="block text-sm text-slate-600">
                                    Membership Management
                                </span>
                            </span>
                        </Link>
                        <div className="space-y-3 text-left">
                            <h1 className="text-2xl font-semibold text-slate-950">
                                Welcome to FitCore Gym
                            </h1>
                            <p className="text-base text-slate-500">
                                Your ultimate fitness membership management
                                platform
                            </p>
                        </div>
                        <div className="space-y-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-violet-500 to-violet-700 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-600 hover:to-violet-800"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-violet-500 to-violet-700 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-600 hover:to-violet-800"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={
                                            canRegister ? register() : login()
                                        }
                                        className="flex w-full items-center justify-center rounded-lg border-2 border-slate-200 px-6 py-2.5 text-base font-semibold text-slate-950 transition hover:bg-slate-50"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
