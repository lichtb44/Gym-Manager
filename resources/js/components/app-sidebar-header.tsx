import { usePage } from '@inertiajs/react';
import { Bell, ChevronDown } from 'lucide-react';
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
    const { auth } = usePage().props;
    const title = auth.user?.role === 'admin' ? 'Admin Dashboard' : 'Member Portal';

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200/70 bg-white/90 px-6 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 text-slate-700" />
                <div>
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100">
                            <Bell className="h-5 w-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 rounded-3xl border border-slate-200 bg-white p-2 shadow-lg">
                        <DropdownMenuLabel className="px-4 py-3 text-sm font-semibold text-slate-900">
                            Notifications
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex flex-col gap-1 rounded-2xl px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50">
                            <span className="font-medium text-slate-900">New member joined</span>
                            <span className="text-xs text-slate-500">John Doe joined Premium.</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex flex-col gap-1 rounded-2xl px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50">
                            <span className="font-medium text-slate-900">Payment completed</span>
                            <span className="text-xs text-slate-500">Emily Davis paid for her plan.</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a href="/settings/profile" className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
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
