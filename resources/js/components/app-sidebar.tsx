import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    CalendarCheck,
    CreditCard,
    Home,
    LayoutGrid,
    Layers,
    LogOut,
    Settings,
    UserRound,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
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
        title: 'Reports',
        href: '/dashboard#reports',
        icon: BarChart3,
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

export function AppSidebar() {
    const { auth } = usePage().props;
    const { isCurrentUrl } = useCurrentUrl();
    const mainNavItems =
        auth.user?.role === 'admin' ? adminNavItems : memberNavItems;

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="bg-transparent text-white [&_[data-sidebar=sidebar]]:bg-transparent [&_[data-sidebar=sidebar]]:shadow-none"
        >
            <SidebarHeader>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                    <AppLogo />
                </div>
            </SidebarHeader>

            <SidebarContent>
                <div className="flex h-full flex-col justify-between rounded-[2rem] bg-gradient-to-br from-[#08101F] via-[#1D0F3D] to-[#1E174F] px-4 py-6 text-slate-200 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.75)]">
                    <nav className="flex flex-col gap-2">
                        {mainNavItems.map((item) => {
                            const active = isCurrentUrl(item.href);
                            const className = `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                                active
                                    ? 'bg-violet-500 text-white shadow-[0_10px_30px_-20px_rgba(139,92,246,0.75)]'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`;

                            if (item.title === 'Logout') {
                                return (
                                    <LogoutConfirmationDialog key={item.title}>
                                        <button
                                            type="button"
                                            className={className}
                                        >
                                            {item.icon && (
                                                <item.icon className="h-4 w-4" />
                                            )}
                                            <span>{item.title}</span>
                                        </button>
                                    </LogoutConfirmationDialog>
                                );
                            }

                            if (item.title === 'Settings') {
                                return (
                                    <a
                                        key={item.title}
                                        href={toUrl(item.href)}
                                        className={className}
                                    >
                                        {item.icon && (
                                            <item.icon className="h-4 w-4" />
                                        )}
                                        <span>{item.title}</span>
                                    </a>
                                );
                            }

                            if (toUrl(item.href).includes('#')) {
                                return (
                                    <a
                                        key={item.title}
                                        href={toUrl(item.href)}
                                        className={className}
                                    >
                                        {item.icon && (
                                            <item.icon className="h-4 w-4" />
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
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </SidebarContent>

            <SidebarFooter className="px-4 pt-4 pb-6">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm shadow-sm">
                    <div className="font-semibold text-slate-950">
                        FitCore Gym
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                        Membership Management
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
