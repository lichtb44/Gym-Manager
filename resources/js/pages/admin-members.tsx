import { Head, router } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardList,
    Mail,
    Phone,
    Trash2,
    UserCheck,
    Users,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface WebsiteUser {
    id: number;
    member_id?: number | null;
    name: string;
    email: string;
    role?: string | null;
    phone?: string | null;
    plan: string;
    pending_plan?: string | null;
    plan_status?: string | null;
    status: string;
    joined_at?: string | null;
    created_at?: string | null;
}

interface NonMemberVisit {
    id: number;
    name: string;
    phone?: string | null;
    purpose: string;
    logged_by?: string | null;
    notes?: string | null;
    entered_at: string;
}

const initials = (name = 'User') =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

const statusClass = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === 'active') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    }

    if (normalized === 'pending') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    return 'bg-slate-50 text-slate-700 ring-slate-100';
};

export default function AdminMembers({
    users = [],
    nonMemberVisits = [],
}: {
    users?: WebsiteUser[];
    nonMemberVisits?: NonMemberVisit[];
}) {
    const [visitForm, setVisitForm] = useState({
        name: '',
        phone: '',
        purpose: 'Walk-in workout',
        notes: '',
    });
    const activeUsers = users.filter(
        (user) => user.status.toLowerCase() === 'active',
    ).length;
    const noPlanUsers = users.filter(
        (user) => user.plan === 'No plan yet',
    ).length;
    const pendingPlanUsers = users.filter(
        (user) => user.plan_status === 'pending',
    ).length;
    const logVisit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post('/dashboard/non-member-visits', visitForm, {
            preserveScroll: true,
            onSuccess: () =>
                setVisitForm({
                    name: '',
                    phone: '',
                    purpose: 'Walk-in workout',
                    notes: '',
                }),
        });
    };

    const removeVisit = (id: number) => {
        router.delete(`/dashboard/non-member-visits/${id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Members" />

            <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="flex items-center gap-2 text-sm font-medium text-blue-600">
                            <Users className="size-4" />
                            Website Users
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                            Members
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Review all registered user accounts and their
                            membership status.
                        </p>
                    </div>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-4">
                    <Metric label="Total Users" value={users.length} />
                    <Metric label="Active Members" value={activeUsers} />
                    <Metric label="No Plan Yet" value={noPlanUsers} />
                    <Metric label="Plan Requests" value={pendingPlanUsers} />
                </section>

                <Card className="mt-6 rounded-lg border-slate-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ClipboardList className="size-5 text-blue-600" />
                            Non-Member Logbook
                        </CardTitle>
                        <span className="text-sm text-slate-500">
                            {nonMemberVisits.length} recent entries
                        </span>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={logVisit}
                            className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 lg:grid-cols-[1fr_160px_190px_1fr_auto]"
                        >
                            <Input
                                value={visitForm.name}
                                onChange={(event) =>
                                    setVisitForm((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))
                                }
                                placeholder="Visitor name"
                                required
                            />
                            <Input
                                value={visitForm.phone}
                                onChange={(event) =>
                                    setVisitForm((current) => ({
                                        ...current,
                                        phone: event.target.value,
                                    }))
                                }
                                placeholder="Phone"
                            />
                            <select
                                value={visitForm.purpose}
                                onChange={(event) =>
                                    setVisitForm((current) => ({
                                        ...current,
                                        purpose: event.target.value,
                                    }))
                                }
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950"
                            >
                                <option>Walk-in workout</option>
                                <option>Gym tour</option>
                                <option>Trial session</option>
                                <option>Guest pass</option>
                                <option>Other</option>
                            </select>
                            <Input
                                value={visitForm.notes}
                                onChange={(event) =>
                                    setVisitForm((current) => ({
                                        ...current,
                                        notes: event.target.value,
                                    }))
                                }
                                placeholder="Notes"
                            />
                            <Button
                                type="submit"
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Log Entry
                            </Button>
                        </form>

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[860px] text-left text-sm text-slate-600">
                                <thead>
                                    <tr className="border-y border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                                        <th className="px-4 py-3">Visitor</th>
                                        <th className="px-4 py-3">Phone</th>
                                        <th className="px-4 py-3">Purpose</th>
                                        <th className="px-4 py-3">Entered</th>
                                        <th className="px-4 py-3">Notes</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nonMemberVisits.length ? (
                                        nonMemberVisits.map((visit) => (
                                            <tr
                                                key={visit.id}
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >
                                                <td className="px-4 py-4 font-semibold text-slate-950">
                                                    {visit.name}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {visit.phone || 'No phone'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {visit.purpose}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p>{visit.entered_at}</p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        By{' '}
                                                        {visit.logged_by ??
                                                            'admin'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {visit.notes || 'None'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-rose-200 text-rose-700 hover:bg-rose-50"
                                                        onClick={() =>
                                                            removeVisit(
                                                                visit.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="mr-2 size-4" />
                                                        Remove
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-8 text-center text-sm text-slate-500"
                                            >
                                                No non-member entries yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6 rounded-lg border-slate-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserCheck className="size-5 text-blue-600" />
                            Members
                        </CardTitle>
                        <span className="text-sm text-slate-500">
                            {users.length} accounts
                        </span>
                    </CardHeader>
                    <CardContent className="overflow-x-auto px-0">
                        <table className="w-full min-w-[980px] text-left text-sm text-slate-600">
                            <thead>
                                <tr className="border-y border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                                    <th className="px-5 py-3">User</th>
                                    <th className="px-5 py-3">Contact</th>
                                    <th className="px-5 py-3">Plan</th>
                                    <th className="px-5 py-3">Plan Request</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length ? (
                                    users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-11 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
                                                        {initials(user.name)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-950">
                                                            {user.name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            User #{user.id}
                                                            {user.member_id
                                                                ? ` / Member #${user.member_id}`
                                                                : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="flex items-center gap-2 text-slate-700">
                                                    <Mail className="size-4 text-slate-400" />
                                                    {user.email}
                                                </p>
                                                <p className="mt-2 flex items-center gap-2 text-slate-500">
                                                    <Phone className="size-4 text-slate-400" />
                                                    {user.phone ?? 'No phone'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 font-medium text-slate-950">
                                                {user.plan}
                                            </td>
                                            <td className="px-5 py-4">
                                                {user.pending_plan ? (
                                                    <span className="font-medium text-amber-700">
                                                        {user.pending_plan}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">
                                                        None
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <Status status={user.status} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="flex items-center gap-2">
                                                    <CalendarDays className="size-4 text-slate-400" />
                                                    {user.joined_at ?? 'N/A'}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    Account:{' '}
                                                    {user.created_at ?? 'N/A'}
                                                </p>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-10 text-center text-sm text-slate-500"
                                        >
                                            No website users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

function Metric({ label, value }: { label: string; value: string | number }) {
    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="pt-6">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}

function Status({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass(status)}`}
        >
            {status}
        </span>
    );
}
