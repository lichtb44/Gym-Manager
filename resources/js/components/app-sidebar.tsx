import { Link, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    ClipboardList,
    CreditCard,
    Dumbbell,
    Home,
    LayoutGrid,
    Layers,
    LogOut,
    Settings,
    UserRound,
    Users,
} from 'lucide-react';
import { LogoutConfirmationDialog } from '@/components/logout-confirmation-dialog';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import { dashboard, logout } from '@/routes';
import type { NavItem } from '@/types';

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Members',
        href: '/members',
        icon: Users,
    },
    {
        title: 'Plans',
        href: '/plans',
        icon: Layers,
    },
    {
        title: 'Trainers',
        href: '/trainers',
        icon: Dumbbell,
    },
    {
        title: 'Attendance',
        href: '/dashboard#attendance',
        icon: CalendarCheck,
    },
    {
        title: 'Payments',
        href: '/payments',
        icon: CreditCard,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
    {
        title: 'Logout',
        href: logout(),
        icon: LogOut,
    },
];

const memberNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: Home,
    },
    {
        title: 'My Plan',
        href: '/my-plan',
        icon: Layers,
    },
    {
        title: "Today's Workout",
        href: '/todays-workout',
        icon: ClipboardList,
    },
    {
        title: 'Trainers',
        href: '/trainers',
        icon: Dumbbell,
    },
    {
        title: 'Attendance',
        href: '/attendance',
        icon: CalendarCheck,
    },
    {
        title: 'Payments',
        href: '/payments',
        icon: CreditCard,
    },
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: UserRound,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
    {
        title: 'Logout',
        href: logout(),
        icon: LogOut,
    },
];

function SidebarGroupLabel({ label }: { label: string }) {
    return (
        <p className="px-4 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            {label}
        </p>
    );
}

export function AppSidebar() {
    const { auth } = usePage().props;
    const { isCurrentUrl } = useCurrentUrl();
    const isAdmin = auth.user?.role === 'admin';
    const mainNavItems = isAdmin ? adminNavItems : memberNavItems;

    if (isAdmin) {
        return (
            <Sidebar
                collapsible="icon"
                variant="inset"
                className="bg-[#0d1624] text-white [&_[data-sidebar=sidebar]]:bg-[#0d1624] [&_[data-sidebar=sidebar]]:shadow-none"
            >
                <SidebarHeader className="px-5 py-6">
                    <div className="flex items-center gap-3">
                        <div className="grid size-11 place-items-center rounded-xl bg-red-500 text-white">
                            <Dumbbell className="size-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold tracking-wide text-white uppercase">
                                Gym Manager
                            </p>
                            <p className="text-xs font-semibold text-slate-400 uppercase">
                                Fitness System
                            </p>
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <div className="flex h-full flex-col justify-between px-4 pb-6 text-slate-300">
                        <nav className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                {mainNavItems.slice(0, 1).map((item) => {
                                    const active = isCurrentUrl(item.href);

                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            prefetch
                                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                                                active
                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-950/20'
                                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            {item.icon && (
                                                <item.icon className="size-4" />
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <SidebarGroupLabel label="Management" />
                            <div className="grid gap-1">
                                {mainNavItems.slice(1, 6).map((item) => {
                                    const active = isCurrentUrl(item.href);
                                    const className = `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                        active
                                            ? 'bg-red-500 text-white shadow-lg shadow-red-950/20'
                                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                    }`;

                                    if (toUrl(item.href).includes('#')) {
                                        return (
                                            <a
                                                key={item.title}
                                                href={toUrl(item.href)}
                                                className={className}
                                            >
                                                {item.icon && (
                                                    <item.icon className="size-4" />
                                                )}
                                                <span>{item.title}</span>
                                            </a>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            prefetch
                                            className={className}
                                        >
                                            {item.icon && (
                                                <item.icon className="size-4" />
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <SidebarGroupLabel label="Settings" />
                            <div className="grid gap-1">
                                {mainNavItems.slice(6).map((item) => {
                                    const active = isCurrentUrl(item.href);
                                    const className = `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                        active
                                            ? 'bg-red-500 text-white shadow-lg shadow-red-950/20'
                                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                    }`;

                                    if (item.title === 'Logout') {
                                        return (
                                            <LogoutConfirmationDialog
                                                key={item.title}
                                            >
                                                <button
                                                    type="button"
                                                    className={className}
                                                >
                                                    {item.icon && (
                                                        <item.icon className="size-4" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </button>
                                            </LogoutConfirmationDialog>
                                        );
                                    }

                                    return (
                                        <a
                                            key={item.title}
                                            href={toUrl(item.href)}
                                            className={className}
                                        >
                                            {item.icon && (
                                                <item.icon className="size-4" />
                                            )}
                                            <span>{item.title}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        </nav>
                    </div>
                </SidebarContent>

                <SidebarFooter className="px-5 pt-4 pb-6">
                    <div className="rounded-lg bg-white/8 px-4 py-4 text-center">
                        <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-500/15 text-red-300">
                            <Dumbbell className="size-6" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-white">
                            FitCore Gym
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            Membership Management
                        </p>
                    </div>
                </SidebarFooter>
            </Sidebar>
        );
    }

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="bg-[#0d1624] text-white [&_[data-sidebar=sidebar]]:bg-[#0d1624] [&_[data-sidebar=sidebar]]:shadow-none"
        >
            <SidebarHeader className="px-5 py-6">
                <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-xl bg-red-500 text-white">
                        <Dumbbell className="size-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold tracking-wide text-white uppercase">
                            Gym Manager
                        </p>
                        <p className="text-xs font-semibold text-slate-400 uppercase">
                            Fitness System
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <div className="flex h-full flex-col justify-between px-4 pb-6 text-slate-300">
                    <nav className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            {mainNavItems.slice(0, 1).map((item) => {
                                const active = isCurrentUrl(item.href);

                                return (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        prefetch
                                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                                            active
                                                ? 'bg-red-500 text-white shadow-lg shadow-red-950/20'
                                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {item.icon && (
                                            <item.icon className="size-4" />
                                        )}
                                        <span>{item.title}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <SidebarGroupLabel label="Management" />
                        <div className="grid gap-1">
                            {mainNavItems.slice(1, 6).map((item) => {
                                const active = isCurrentUrl(item.href);
                                const className = `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                    active
                                        ? 'bg-red-500 text-white shadow-lg shadow-red-950/20'
                                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                }`;

                                if (toUrl(item.href).includes('#')) {
                                    return (
                                        <a
                                            key={item.title}
                                            href={toUrl(item.href)}
                                            className={className}
                                        >
                                            {item.icon && (
                                                <item.icon className="size-4" />
                                            )}
                                            <span>{item.title}</span>
                                        </a>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        prefetch
                                        className={className}
                                    >
                                        {item.icon && (
                                            <item.icon className="size-4" />
                                        )}
                                        <span>{item.title}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <SidebarGroupLabel label="Settings" />
                        <div className="grid gap-1">
                            {mainNavItems.slice(6).map((item) => {
                                const active = isCurrentUrl(item.href);
                                const className = `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                    active
                                        ? 'bg-red-500 text-white shadow-lg shadow-red-950/20'
                                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                }`;

                                if (item.title === 'Logout') {
                                    return (
                                        <LogoutConfirmationDialog
                                            key={item.title}
                                        >
                                            <button
                                                type="button"
                                                className={className}
                                            >
                                                {item.icon && (
                                                    <item.icon className="size-4" />
                                                )}
                                                <span>{item.title}</span>
                                            </button>
                                        </LogoutConfirmationDialog>
                                    );
                                }

                                return (
                                    <a
                                        key={item.title}
                                        href={toUrl(item.href)}
                                        className={className}
                                    >
                                        {item.icon && (
                                            <item.icon className="size-4" />
                                        )}
                                        <span>{item.title}</span>
                                    </a>
                                );
                            })}
                        </div>
                    </nav>
                </div>
            </SidebarContent>

            <SidebarFooter className="px-5 pt-4 pb-6">
                <div className="rounded-lg bg-white/8 px-4 py-4 text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-500/15 text-red-300">
                        <Dumbbell className="size-6" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">
                        FitCore Gym
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        Membership Management
                    </p>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
