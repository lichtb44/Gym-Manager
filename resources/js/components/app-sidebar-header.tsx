import { usePage } from '@inertiajs/react';
import {
    Bell,
    CalendarCheck,
    ChevronDown,
    CreditCard,
    Layers,
    UserRound,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage();
    const { auth } = page.props;
    const title = auth.user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard';
    const pageProps = page.props as {
        member?: {
            plan?: string;
            pending_plan?: string | null;
            plan_status?: string | null;
            status?: string;
        };
        payments?: Array<{
            amount?: string | number;
            payment_date?: string | null;
            status?: string;
        }>;
        attendance?: Array<{ date?: string; status?: string }>;
        pendingApprovals?: Array<unknown>;
        pendingPaymentConfirmations?: Array<{
            member?: string;
            amount?: string | number;
            method?: string;
            status?: string;
        }>;
        recentPayments?: Array<{
            member?: string;
            amount?: string | number;
            method?: string;
            status?: string;
            created_at?: string | null;
        }>;
    };
    const latestPayment = pageProps.payments?.[0];
    const latestAttendance = pageProps.attendance?.[0];
    const pendingPlan = pageProps.member?.pending_plan;
    const hasPendingPlan =
        pageProps.member?.plan_status === 'pending' && pendingPlan;
    const latestAdminPayment = pageProps.recentPayments?.[0];
    const pendingPaymentConfirmation =
        pageProps.pendingPaymentConfirmations?.[0];
    const notifications =
        auth.user?.role === 'admin'
            ? [
                  {
                      title: 'Plan approvals',
                      detail: `${pageProps.pendingApprovals?.length ?? 0} pending member requests`,
                      href: '/dashboard#pending-plan-approvals',
                      icon: Layers,
                  },
                  {
                      title: pendingPaymentConfirmation
                          ? 'Payment needs confirmation'
                          : latestAdminPayment
                            ? 'Payment sent'
                            : 'Payment records',
                      detail: pendingPaymentConfirmation
                          ? `${pendingPaymentConfirmation.member ?? 'Member'} has paid ${pendingPaymentConfirmation.amount ?? ''} through ${pendingPaymentConfirmation.method ?? 'payment'}. Confirm it in payments.`
                          : latestAdminPayment
                            ? `${latestAdminPayment.member ?? 'Member'} sent ${latestAdminPayment.amount ?? ''} through ${latestAdminPayment.method ?? 'payment'}.`
                            : 'Review member payments and billing status.',
                      href: '/dashboard#payments',
                      icon: CreditCard,
                  },
                  {
                      title: 'Attendance records',
                      detail: 'Check today attendance and recent activity.',
                      href: '/dashboard#attendance',
                      icon: CalendarCheck,
                  },
              ]
            : [
                  hasPendingPlan
                      ? {
                            title: 'Plan request pending',
                            detail: `${pendingPlan} is waiting for admin approval.`,
                            href: '/my-plan',
                            icon: Layers,
                        }
                      : {
                            title: 'Membership plan',
                            detail: pageProps.member?.plan
                                ? `${pageProps.member.plan} - ${pageProps.member.status ?? 'Active'}`
                                : 'Choose a plan to start your membership.',
                            href: '/my-plan',
                            icon: Layers,
                        },
                  {
                      title: 'Payment update',
                      detail: latestPayment
                          ? `${latestPayment.status ?? 'Payment'} - ${latestPayment.amount ?? ''} ${latestPayment.payment_date ?? ''}`.trim()
                          : 'No payment history yet.',
                      href: '/payments',
                      icon: CreditCard,
                  },
                  {
                      title: 'Attendance update',
                      detail: latestAttendance
                          ? `${latestAttendance.status ?? 'Attendance'} on ${latestAttendance.date ?? 'recent date'}`
                          : 'Attendance starts when your plan is active.',
                      href: '/attendance',
                      icon: CalendarCheck,
                  },
                  {
                      title: 'Profile',
                      detail: 'Keep your profile details up to date.',
                      href: '/settings/profile',
                      icon: UserRound,
                  },
              ];

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200/70 bg-white/90 px-6 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 text-slate-700" />
                <div>
                    <p className="text-sm font-semibold text-slate-900">
                        {title}
                    </p>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            aria-label="Notifications"
                            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                        >
                            <Bell className="h-5 w-5" />
                            {(auth.user?.role === 'admin'
                                ? (pageProps.pendingApprovals?.length ?? 0) >
                                      0 ||
                                  (pageProps.pendingPaymentConfirmations
                                      ?.length ?? 0) > 0
                                : hasPendingPlan) && (
                                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 rounded-3xl border border-slate-200 bg-white p-2 shadow-lg">
                        <DropdownMenuLabel className="px-4 py-3 text-sm font-semibold text-slate-900">
                            Notifications
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {notifications.map((notification) => (
                            <DropdownMenuItem asChild key={notification.title}>
                                <a
                                    href={notification.href}
                                    className="flex gap-3 rounded-2xl px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                        <notification.icon className="size-4" />
                                    </span>
                                    <span>
                                        <span className="block font-medium text-slate-900">
                                            {notification.title}
                                        </span>
                                        <span className="mt-1 block text-xs text-slate-500">
                                            {notification.detail}
                                        </span>
                                    </span>
                                </a>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a
                                href="/settings/profile"
                                className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                View profile settings
                            </a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100">
                    <span>{auth.user?.name ?? 'Admin'}</span>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
            </div>
        </header>
    );
}
