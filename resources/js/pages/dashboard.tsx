import { Head, router } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    Bell,
    CalendarCheck,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock as ClockIcon,
    ClipboardList,
    CreditCard,
    DollarSign,
    Dumbbell,
    Flame,
    Menu,
    MoreHorizontal,
    Play,
    Plus,
    ReceiptText,
    Ruler,
    Search,
    Settings,
    ShieldCheck,
    Trophy,
    UserRound,
    WalletCards,
    Users,
    Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, ComponentType, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';

interface Member {
    id: number;
    name: string;
    email: string;
    phone?: string;
    plan: string;
    plan_started_at?: string | null;
    status: string;
    join_date?: string;
}

interface Plan {
    id: number;
    name: string;
    duration: string;
    price: string | number;
    description?: string;
    status: string;
}

interface Payment {
    id: number;
    member?: string;
    member_id: number;
    plan: string;
    amount: string | number;
    payment_date?: string;
    date?: string;
    method: string;
    status: string;
}

interface AttendanceRecord {
    id: number | string;
    member: string;
    checkIn?: string;
    checkOut?: string;
    date: string;
    status: string;
}

interface PendingPlanApproval {
    id: number;
    name: string;
    current_plan: string;
    requested_plan: string | null;
    status: string;
}

interface TrainerRequest {
    id: number;
    user: string;
    member_id?: number;
    requested_trainer_id: number;
    requested_trainer: string;
    assigned_trainer_id?: number | null;
    assigned_trainer?: string | null;
    date: string;
    status: string;
    requested_trainer_full?: boolean;
}

interface TrainerOption {
    id: number;
    name: string;
    filledSlots: number;
    capacity: number;
}

interface DashboardProps {
    members?: Member[];
    plans?: Plan[];
    payments?: Payment[];
    attendance?: AttendanceRecord[];
    pendingApprovals?: PendingPlanApproval[];
    trainerRequests?: TrainerRequest[];
    trainers?: TrainerOption[];
    userRole: 'admin' | 'member';
    member?: Member;
}

type FormType = 'member' | 'plan' | 'attendance' | 'payment';
type FormDataState = Record<string, string>;

const emptyMembers: Member[] = [];
const emptyAttendance: AttendanceRecord[] = [];

const defaultFormData: Record<FormType, FormDataState> = {
    member: {
        name: '',
        email: '',
        phone: '',
        plan: 'Premium',
        status: 'Active',
    },
    plan: {
        planName: '',
        duration: '1 Month',
        price: '49.99',
        description: '',
        status: 'Active',
    },
    attendance: {
        member: '',
        date: '',
        checkIn: '08:00 AM',
        checkOut: '09:00 AM',
        status: 'Present',
    },
    payment: {
        member: '',
        plan: 'Premium',
        amount: '79.99',
        date: '',
        method: 'Credit Card',
        status: 'Paid',
    },
};

const formLabels: Record<FormType, string> = {
    member: 'Member',
    plan: 'Plan',
    attendance: 'Attendance',
    payment: 'Payment',
};

const statusClass = (status: string) => {
    const normalized = status.toLowerCase();

    if (['active', 'present', 'paid'].includes(normalized)) {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    }

    if (['inactive', 'absent', 'overdue', 'failed'].includes(normalized)) {
        return 'bg-rose-50 text-rose-700 ring-rose-100';
    }

    if (normalized === 'pending confirmation') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    return 'bg-sky-50 text-sky-700 ring-sky-100';
};

const currency = (value: string | number) => {
    const amount = Number(value);

    if (Number.isNaN(amount)) {
        return value;
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

const initials = (name = 'Member') =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

const submitPath = (form: FormType, editId: number | string | null) =>
    editId ? `/dashboard/${form}s/${editId}` : `/dashboard/${form}s`;

const deletePath = (form: FormType, id: number | string) =>
    `/dashboard/${form}s/${id}`;

const parseDate = (value?: string | null) => {
    if (!value) {
        return null;
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
};

const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

const shortDate = (value?: string | null) => {
    const parsed = parseDate(value);

    return parsed
        ? new Intl.DateTimeFormat(undefined, {
              month: 'short',
              day: 'numeric',
          }).format(parsed)
        : (value ?? 'N/A');
};

const readableDate = (value?: string | null) => {
    const parsed = parseDate(value);

    return parsed
        ? new Intl.DateTimeFormat(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          }).format(parsed)
        : (value ?? 'N/A');
};

const sameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

const monthCalendarDays = (date: Date) => {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startOffset = monthStart.getDay();
    const endOffset = 6 - monthEnd.getDay();
    const firstDay = new Date(monthStart);
    firstDay.setDate(monthStart.getDate() - startOffset);

    return Array.from(
        { length: monthEnd.getDate() + startOffset + endOffset },
        (_, index) => {
            const day = new Date(firstDay);
            day.setDate(firstDay.getDate() + index);

            return day;
        },
    );
};

const countTrackableDays = (start: Date | null, end: Date) => {
    if (!start || start > end) {
        return 0;
    }

    const cursor = startOfDay(start);
    const lastDay = startOfDay(end);
    let count = 0;

    while (cursor <= lastDay) {
        if (cursor.getDay() !== 0) {
            count += 1;
        }

        cursor.setDate(cursor.getDate() + 1);
    }

    return count;
};

export default function Dashboard({
    members = [],
    plans = [],
    payments = [],
    attendance = [],
    pendingApprovals = [],
    trainerRequests = [],
    trainers = [],
    userRole = 'member',
    member,
}: DashboardProps) {
    const isAdmin = userRole === 'admin';
    const memberRows = isAdmin ? members : emptyMembers;
    const planRows = plans;
    const paymentRows = payments;
    const attendanceRows = isAdmin ? attendance : emptyAttendance;
    const currentMember = member;

    const [activeForm, setActiveForm] = useState<FormType | null>(null);
    const [formData, setFormData] = useState<FormDataState>(
        defaultFormData.member,
    );
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{
        type: FormType;
        id: number | string;
    } | null>(null);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [trainerRequestRows] = useState<TrainerRequest[]>(trainerRequests);

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            router.post('/logout');
        }
    };

    const attendanceByMember = useMemo(() => {
        const memberAttendance = new Map<
            string,
            { present: number; total: number }
        >();

        attendanceRows.forEach((row) => {
            const current = memberAttendance.get(row.member) ?? {
                present: 0,
                total: 0,
            };

            current.total += 1;
            if (row.status.toLowerCase() === 'present') {
                current.present += 1;
            }

            memberAttendance.set(row.member, current);
        });

        return Array.from(memberAttendance.entries())
            .map(([member, counts]) => ({
                member,
                present: counts.present,
                total: counts.total,
                rate: counts.total
                    ? Math.round((counts.present / counts.total) * 100)
                    : 0,
            }))
            .sort((first, second) => second.present - first.present)
            .slice(0, 6);
    }, [attendanceRows]);

    const revenueByDate = useMemo(() => {
        const revenue = new Map<string, number>();

        paymentRows.forEach((payment) => {
            const key = payment.payment_date ?? payment.date ?? 'Unscheduled';
            revenue.set(
                key,
                (revenue.get(key) ?? 0) + (Number(payment.amount) || 0),
            );
        });

        return Array.from(revenue.entries())
            .map(([date, amount]) => ({ date, amount }))
            .slice(0, 6)
            .reverse();
    }, [paymentRows]);

    const memberPayments = paymentRows.filter(
        (payment) => payment.member_id === currentMember?.id,
    );
    const currentPlan =
        planRows.find((plan) => plan.name === currentMember?.plan) ??
        planRows[0];
    const latestPayment = memberPayments[0];
    const outstandingBalance = memberPayments.some(
        (payment) => payment.status.toLowerCase() !== 'paid',
    )
        ? memberPayments.reduce(
              (sum, payment) =>
                  payment.status.toLowerCase() === 'paid'
                      ? sum
                      : sum + (Number(payment.amount) || 0),
              0,
          )
        : 0;
    const memberFirstName =
        currentMember?.name?.split(' ')[0] || currentMember?.name || 'Member';
    const attendanceStartDate = parseDate(
        currentMember?.plan_started_at ?? currentMember?.join_date,
    );
    const attendanceHasStarted =
        Boolean(currentMember) &&
        Boolean(attendanceStartDate) &&
        currentMember?.plan !== 'No plan yet' &&
        currentMember?.status !== 'Pending';
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const attendanceStartDay =
        attendanceHasStarted && attendanceStartDate
            ? startOfDay(attendanceStartDate)
            : null;
    const plannedVisits = countTrackableDays(
        attendanceStartDay && attendanceStartDay > monthStart
            ? attendanceStartDay
            : monthStart,
        new Date(today.getFullYear(), today.getMonth() + 1, 0),
    );
    const completedVisits = countTrackableDays(
        attendanceStartDay && attendanceStartDay > monthStart
            ? attendanceStartDay
            : monthStart,
        today,
    );
    const attendancePercent = Math.round(
        plannedVisits > 0 ? (completedVisits / plannedVisits) * 100 : 0,
    );
    const activeMembers = memberRows.filter(
        (row) => row.status.toLowerCase() === 'active',
    ).length;
    const paidRevenue = paymentRows
        .filter((row) => row.status.toLowerCase() === 'paid')
        .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const presentToday = attendanceRows.filter(
        (row) => row.status.toLowerCase() === 'present',
    ).length;
    const pendingPaymentCount = paymentRows.filter(
        (row) => row.status.toLowerCase() === 'pending confirmation',
    ).length;
    const recentCheckIns = attendanceRows.slice(0, 5);
    const recentActivity = paymentRows.slice(0, 5);
    const activePercent = memberRows.length
        ? Math.round((activeMembers / memberRows.length) * 100)
        : 0;
    const pendingPlanCount = pendingApprovals?.length ?? 0;
    const pendingTrainerCount = trainerRequestRows.filter(
        (request) => request.status.toLowerCase() === 'pending',
    ).length;
    const notificationItems = [
        ...pendingApprovals.map((approval) => ({
            id: `plan-${approval.id}`,
            title: `${approval.name} requested ${approval.requested_plan ?? 'a new plan'}`,
            detail: 'Plan change approval',
            href: '/dashboard#pending-plan-approvals',
        })),
        ...trainerRequestRows
            .filter((request) => request.status.toLowerCase() === 'pending')
            .map((request) => ({
                id: `trainer-${request.id}`,
                title: `${request.user} requested ${request.requested_trainer}`,
                detail: request.requested_trainer_full
                    ? 'Requested trainer is full'
                    : 'Trainer approval',
                href: '/trainers',
            })),
        ...(pendingPaymentCount
            ? [
                  {
                      id: 'payments',
                      title: `${pendingPaymentCount} payment confirmation${pendingPaymentCount === 1 ? '' : 's'}`,
                      detail: 'Payment approval',
                      href: '/payments',
                  },
              ]
            : []),
    ];
    const notificationCount = notificationItems.length;

    const handleInputChange =
        (field: string) => (event: ChangeEvent<HTMLInputElement>) => {
            setFormData((current) => ({
                ...current,
                [field]: event.target.value,
            }));
        };

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!activeForm) {
            return;
        }

        router.post(
            submitPath(activeForm, editingId),
            {
                ...formData,
                ...(editingId ? { _method: 'PUT' } : {}),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setActiveForm(null);
                    setEditingId(null);
                },
            },
        );
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.post(
            deletePath(deleteTarget.type, deleteTarget.id),
            { _method: 'DELETE' },
            {
                preserveScroll: true,
                onFinish: () => setDeleteTarget(null),
            },
        );
    };

    const renderFormFields = () => {
        if (activeForm === 'member') {
            return (
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        id="name"
                        label="Name"
                        value={formData.name}
                        onChange={handleInputChange('name')}
                    />
                    <Field
                        id="email"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                    />
                    <Field
                        id="phone"
                        label="Phone"
                        value={formData.phone}
                        onChange={handleInputChange('phone')}
                    />
                    <Field
                        id="plan"
                        label="Membership Plan"
                        value={formData.plan}
                        onChange={handleInputChange('plan')}
                    />
                    <Field
                        id="status"
                        label="Status"
                        value={formData.status}
                        onChange={handleInputChange('status')}
                    />
                </div>
            );
        }

        if (activeForm === 'plan') {
            return (
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        id="planName"
                        label="Plan Name"
                        value={formData.planName}
                        onChange={handleInputChange('planName')}
                    />
                    <Field
                        id="duration"
                        label="Duration"
                        value={formData.duration}
                        onChange={handleInputChange('duration')}
                    />
                    <Field
                        id="price"
                        label="Price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange('price')}
                    />
                    <Field
                        id="description"
                        label="Description"
                        value={formData.description}
                        onChange={handleInputChange('description')}
                        className="sm:col-span-2"
                    />
                    <Field
                        id="status"
                        label="Status"
                        value={formData.status}
                        onChange={handleInputChange('status')}
                    />
                </div>
            );
        }

        if (activeForm === 'attendance') {
            return (
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        id="member"
                        label="Member"
                        value={formData.member}
                        onChange={handleInputChange('member')}
                    />
                    <Field
                        id="date"
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange('date')}
                    />
                    <Field
                        id="checkIn"
                        label="Check In"
                        value={formData.checkIn}
                        onChange={handleInputChange('checkIn')}
                    />
                    <Field
                        id="checkOut"
                        label="Check Out"
                        value={formData.checkOut}
                        onChange={handleInputChange('checkOut')}
                    />
                    <Field
                        id="status"
                        label="Status"
                        value={formData.status}
                        onChange={handleInputChange('status')}
                    />
                </div>
            );
        }

        if (activeForm === 'payment') {
            return (
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        id="member"
                        label="Member ID"
                        value={formData.member}
                        onChange={handleInputChange('member')}
                    />
                    <Field
                        id="plan"
                        label="Plan"
                        value={formData.plan}
                        onChange={handleInputChange('plan')}
                    />
                    <Field
                        id="amount"
                        label="Amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleInputChange('amount')}
                    />
                    <Field
                        id="date"
                        label="Payment Date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange('date')}
                    />
                    <Field
                        id="method"
                        label="Method"
                        value={formData.method}
                        onChange={handleInputChange('method')}
                    />
                    <Field
                        id="status"
                        label="Status"
                        value={formData.status}
                        onChange={handleInputChange('status')}
                    />
                </div>
            );
        }
    };

    return (
        <>
            <Head title="Dashboard" />

            <Dialog
                open={activeForm !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setActiveForm(null);
                        setEditingId(null);
                    }
                }}
            >
                <DialogContent className="max-w-3xl rounded-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? 'Edit' : 'Add'}{' '}
                            {activeForm ? formLabels[activeForm] : 'Record'}
                        </DialogTitle>
                        <DialogDescription>
                            Keep member, plan, attendance, and payment records
                            aligned with the front desk workflow.
                        </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-6" onSubmit={handleFormSubmit}>
                        {renderFormFields()}
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button className="bg-blue-600 text-white hover:bg-blue-700">
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent className="max-w-sm rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Delete record</DialogTitle>
                        <DialogDescription>
                            This removes the selected record from the dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="bg-rose-600 text-white hover:bg-rose-700"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isAdmin ? (
                <main className="min-h-screen bg-[#f7f8fb] px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
                    <AdminTopBar
                        name="Admin"
                        notificationCount={notificationCount}
                        notificationItems={notificationItems}
                        profileMenuOpen={profileMenuOpen}
                        onProfileMenuToggle={() =>
                            setProfileMenuOpen(!profileMenuOpen)
                        }
                        onLogout={handleLogout}
                    />

                    <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <AdminMetricCard
                            icon={Users}
                            label="Total Members"
                            value={memberRows.length.toString()}
                            detail={`${activeMembers} active profiles`}
                            tone="rose"
                        />
                        <AdminMetricCard
                            icon={DollarSign}
                            label="Revenue"
                            value={String(currency(paidRevenue))}
                            detail={`${paymentRows.length} payment records`}
                            tone="emerald"
                        />
                        <AdminMetricCard
                            icon={CalendarDays}
                            label="Pending Plans"
                            value={pendingPlanCount.toString()}
                            detail="Awaiting approval"
                            tone="amber"
                        />
                        <AdminMetricCard
                            icon={ArrowUpRight}
                            label="Check-Ins Today"
                            value={presentToday.toString()}
                            detail={`${attendanceRows.length} records logged`}
                            tone="blue"
                        />
                        <AdminMetricCard
                            icon={Dumbbell}
                            label="Plan Catalog"
                            value={planRows.length.toString()}
                            detail="Active membership offers"
                            tone="violet"
                        />
                    </section>

                    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.78fr)_minmax(300px,0.72fr)]">
                        <AdminLineChart
                            items={attendanceByMember}
                            total={attendanceRows.length}
                        />
                        <MembershipStatusCard
                            total={memberRows.length}
                            active={activeMembers}
                            pending={pendingPlanCount}
                            paid={
                                paymentRows.filter(
                                    (payment) =>
                                        payment.status.toLowerCase() === 'paid',
                                ).length
                            }
                            activePercent={activePercent}
                        />
                        <div className="grid content-start gap-5">
                            <ReminderCard
                                pendingPlans={pendingPlanCount}
                                pendingPayments={pendingPaymentCount}
                                overduePayments={
                                    paymentRows.filter(
                                        (payment) =>
                                            payment.status.toLowerCase() !==
                                            'paid',
                                    ).length
                                }
                            />
                        </div>
                    </section>

                    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(300px,0.7fr)]">
                        <CompactListCard
                            title="Recent Check-Ins"
                            emptyText="No check-ins yet."
                            items={recentCheckIns.map((row) => ({
                                id: row.id,
                                title: row.member,
                                detail: row.date,
                                meta: row.checkIn ?? 'No time',
                                status: row.status,
                            }))}
                        />
                        <RecentActivityCard payments={recentActivity} />
                        <div className="grid content-start gap-5">
                            {pendingApprovals?.length ? (
                                <Card
                                    id="pending-plan-approvals"
                                    className="rounded-lg border-slate-200 bg-white shadow-sm"
                                >
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <ShieldCheck className="size-5 text-blue-600" />
                                            Plan Approvals
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-3">
                                        {pendingApprovals.map((row) => (
                                            <div
                                                key={row.id}
                                                className="rounded-lg border border-slate-100 p-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-slate-950">
                                                            {row.name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {row.current_plan}{' '}
                                                            to{' '}
                                                            {row.requested_plan ??
                                                                'N/A'}
                                                        </p>
                                                    </div>
                                                    <StatusBadge
                                                        status={row.status}
                                                    />
                                                </div>
                                                <div className="mt-3 flex gap-2">
                                                    <ApprovePlanButton
                                                        memberId={row.id}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                                                        type="button"
                                                        onClick={() =>
                                                            router.post(
                                                                `/dashboard/members/${row.id}/approve-plan`,
                                                                {
                                                                    action: 'reject',
                                                                },
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <ShieldCheck className="size-5 text-blue-600" />
                                            Plan Approvals
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-500">
                                            No pending plan changes.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                            <TrainerRequestsCard
                                requests={trainerRequestRows}
                                trainers={trainers}
                            />
                            <ScheduleCard />
                        </div>
                    </section>
                </main>
            ) : (
                <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
                    <div className="min-w-0 px-4 py-5 sm:px-6 xl:px-8">
                            <MemberDashboardHeader
                                name={memberFirstName}
                                profileMenuOpen={profileMenuOpen}
                                onProfileMenuToggle={() =>
                                    setProfileMenuOpen(!profileMenuOpen)
                                }
                                onLogout={handleLogout}
                            />

                            <section className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                                <FitnessStatCard
                                    icon={Dumbbell}
                                    title="Workouts This Week"
                                    value="0 / 6"
                                    detail="Start your first workout"
                                    tone="red"
                                    progress={0}
                                />
                                <FitnessStatCard
                                    icon={Flame}
                                    title="Calories Burned"
                                    value="0"
                                    detail="0 from last week"
                                    tone="emerald"
                                    sparkline
                                />
                                <FitnessStatCard
                                    icon={ClockIcon}
                                    title="Time Trained"
                                    value="0h 0m"
                                    detail="0h 0m from last week"
                                    tone="blue"
                                    bars
                                />
                                <FitnessStatCard
                                    icon={Trophy}
                                    title="Current Streak"
                                    value="0 Days"
                                    detail="Start your streak"
                                    tone="amber"
                                    progress={0}
                                />
                            </section>

                            <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(320px,0.95fr)_minmax(420px,1.1fr)_minmax(300px,0.82fr)]">
                                <TodayWorkoutCard member={currentMember} />
                                <WeeklyProgressCard
                                    attendancePercent={0}
                                />
                                <div className="grid content-start gap-5">
                                    <UpcomingClassesCard />
                                    <NutritionSummaryCard />
                                </div>
                            </section>

                            <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(320px,0.95fr)_minmax(420px,1.1fr)_minmax(300px,0.82fr)]">
                                <RecentAchievementsCard />
                                <MemberQuickActions />
                                <MemberPlanMiniCard
                                    currentMember={currentMember}
                                    currentPlan={currentPlan}
                                    latestPayment={latestPayment}
                                    outstandingBalance={outstandingBalance}
                                />
                            </section>
                    </div>
                </main>
            )}
        </>
    );
}

type IconComponent = ComponentType<{ className?: string }>;

function MemberDashboardHeader({
    name,
    profileMenuOpen,
    onProfileMenuToggle,
    onLogout,
}: {
    name: string;
    profileMenuOpen: boolean;
    onProfileMenuToggle: () => void;
    onLogout: () => void;
}) {
    const dateLabel = new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date());
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notifications = [
        {
            title: "Today's workout is ready",
            detail: 'Open your workout card to start or edit your exercises.',
            href: '/todays-workout',
        },
        {
            title: 'Workout stats start at zero',
            detail: 'Your dashboard updates after you finish logged workouts.',
            href: '/dashboard',
        },
    ];

    return (
        <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-950">
                    Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Welcome back, {name}!
                </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative hidden min-w-0 sm:block sm:w-72 lg:w-80">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        className="h-10 rounded-lg border-slate-200 bg-white pl-9 text-sm"
                        placeholder="Search members, invoices..."
                    />
                </label>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-lg border-slate-200 bg-white sm:hidden"
                    aria-label="Search"
                >
                    <Search className="size-5" />
                </Button>
                <div className="relative">
                    <Button
                        variant="outline"
                        size="icon"
                        className="relative rounded-lg border-slate-200 bg-white"
                        aria-label="Notifications"
                        type="button"
                        onClick={() =>
                            setNotificationsOpen((current) => !current)
                        }
                    >
                        <Bell className="size-5" />
                        <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                            {notifications.length}
                        </span>
                    </Button>
                    {notificationsOpen && (
                        <div className="absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-950">
                                    Notifications
                                </p>
                                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                                    {notifications.length} new
                                </span>
                            </div>
                            <div className="mt-3 grid gap-2">
                                {notifications.map((notification) => (
                                    <a
                                        key={notification.title}
                                        href={notification.href}
                                        className="block rounded-lg border border-slate-100 px-3 py-2 text-left transition hover:bg-slate-50"
                                    >
                                        <span className="block text-sm font-semibold text-slate-950">
                                            {notification.title}
                                        </span>
                                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                                            {notification.detail}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 sm:flex">
                    <CalendarDays className="size-4 text-slate-500" />
                    {dateLabel}
                </div>
                <div className="relative">
                    <button
                        type="button"
                        onClick={onProfileMenuToggle}
                        className="grid size-10 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white"
                    >
                        {initials(name)}
                    </button>
                    {profileMenuOpen && (
                        <div className="absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                            <Button
                                asChild
                                variant="ghost"
                                className="w-full justify-start rounded-none border-b"
                            >
                                <a href="/settings/profile">Edit Profile</a>
                            </Button>
                            <button
                                onClick={onLogout}
                                className="flex w-full items-center gap-2 rounded-b-lg px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-rose-600"
                                type="button"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function FitnessStatCard({
    icon: Icon,
    title,
    value,
    detail,
    tone,
    progress,
    sparkline = false,
    bars = false,
}: {
    icon: IconComponent;
    title: string;
    value: string;
    detail: string;
    tone: 'red' | 'emerald' | 'blue' | 'amber';
    progress?: number;
    sparkline?: boolean;
    bars?: boolean;
}) {
    const tones = {
        red: 'bg-red-100 text-red-600',
        emerald: 'bg-emerald-100 text-emerald-700',
        blue: 'bg-blue-100 text-blue-700',
        amber: 'bg-amber-100 text-amber-700',
    };
    const barsList = [6, 6, 6, 6, 6, 6, 6, 6, 6];

    return (
        <Card className="rounded-lg border-0 bg-white/75 shadow-sm">
            <CardContent className="p-5">
                <div className="flex items-start gap-4">
                    <div
                        className={`grid size-12 shrink-0 place-items-center rounded-lg ${tones[tone]}`}
                    >
                        <Icon className="size-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-500">
                            {title}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-950">
                            {value}
                        </p>
                        <p
                            className={`mt-2 text-xs ${
                                tone === 'amber'
                                    ? 'text-slate-500'
                                    : tone === 'red'
                                      ? 'text-red-600'
                                      : 'text-emerald-600'
                            }`}
                        >
                            {detail}
                        </p>
                    </div>
                </div>
                {typeof progress === 'number' && (
                    <div className="mt-5 h-2 rounded-full bg-slate-100">
                        <div
                            className={
                                tone === 'amber'
                                    ? 'h-2 rounded-full bg-amber-400'
                                    : 'h-2 rounded-full bg-red-500'
                            }
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                )}
                {sparkline && (
                    <svg
                        viewBox="0 0 220 44"
                        className="mt-4 h-11 w-full text-emerald-400"
                        aria-hidden="true"
                    >
                        <path
                            d="M2 32 H218"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                )}
                {bars && (
                    <div className="mt-4 flex h-12 items-end gap-2">
                        {barsList.map((height, index) => (
                            <span
                                key={`${height}-${index}`}
                                className="w-2 rounded-full bg-blue-200"
                                style={{ height }}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

type WorkoutLevel = 'beginner' | 'pro';
type WorkoutGoal = 'bulking' | 'cutting';

interface WorkoutExercise {
    name: string;
    detail: string;
}

interface WorkoutDay {
    title: string;
    focus: string;
    exercises: WorkoutExercise[];
    rest?: boolean;
}

interface ActiveWorkoutSet {
    exerciseIndex: number;
    setNumber: number;
    weight: number;
}

interface DailyWorkoutExercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weightKg: number;
    restSec: number;
    notes: string;
}

interface DailyWorkout {
    title: string;
    focus: string;
    durationMin: number;
    exercises: DailyWorkoutExercise[];
    savedAt: string;
}

const weekdayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

const beginnerBulkingPlan: WorkoutDay[] = [
    {
        title: 'Rest Day',
        focus: 'Recovery and mobility',
        rest: true,
        exercises: [
            { name: 'Light Walk', detail: '20 to 30 minutes' },
            { name: 'Stretching', detail: '10 minutes' },
        ],
    },
    {
        title: 'Push Strength',
        focus: 'Chest, shoulders, triceps',
        exercises: [
            { name: 'Bench Press', detail: '3 sets - 8 to 10 reps' },
            { name: 'Incline Dumbbell Press', detail: '3 sets - 10 reps' },
            { name: 'Shoulder Press', detail: '3 sets - 10 reps' },
            { name: 'Tricep Pushdown', detail: '3 sets - 12 reps' },
        ],
    },
    {
        title: 'Pull Strength',
        focus: 'Back and biceps',
        exercises: [
            { name: 'Lat Pulldown', detail: '3 sets - 10 reps' },
            { name: 'Seated Row', detail: '3 sets - 10 reps' },
            { name: 'Face Pulls', detail: '3 sets - 12 reps' },
            { name: 'Bicep Curls', detail: '3 sets - 12 reps' },
        ],
    },
    {
        title: 'Leg Builder',
        focus: 'Quads, glutes, calves',
        exercises: [
            { name: 'Goblet Squat', detail: '3 sets - 10 reps' },
            { name: 'Leg Press', detail: '3 sets - 10 reps' },
            { name: 'Romanian Deadlift', detail: '3 sets - 10 reps' },
            { name: 'Calf Raises', detail: '3 sets - 15 reps' },
        ],
    },
    {
        title: 'Upper Volume',
        focus: 'Full upper body',
        exercises: [
            { name: 'Dumbbell Press', detail: '3 sets - 10 reps' },
            { name: 'Assisted Pull Ups', detail: '3 sets - 8 reps' },
            { name: 'Lateral Raises', detail: '3 sets - 12 reps' },
            { name: 'Cable Curls', detail: '3 sets - 12 reps' },
        ],
    },
    {
        title: 'Lower Volume',
        focus: 'Legs and core',
        exercises: [
            { name: 'Split Squat', detail: '3 sets - 10 each side' },
            { name: 'Hamstring Curl', detail: '3 sets - 12 reps' },
            { name: 'Hip Thrust', detail: '3 sets - 10 reps' },
            { name: 'Plank', detail: '3 rounds - 30 seconds' },
        ],
    },
    {
        title: 'Rest Day',
        focus: 'Sleep, food, and recovery',
        rest: true,
        exercises: [
            { name: 'Mobility Flow', detail: '15 minutes' },
            { name: 'Easy Walk', detail: '20 minutes' },
        ],
    },
];

const beginnerCuttingPlan: WorkoutDay[] = [
    {
        title: 'Rest Day',
        focus: 'Recovery and steps',
        rest: true,
        exercises: [
            { name: 'Easy Walk', detail: '25 minutes' },
            { name: 'Stretching', detail: '10 minutes' },
        ],
    },
    {
        title: 'Full Body Burn',
        focus: 'Strength plus cardio',
        exercises: [
            { name: 'Goblet Squat', detail: '3 sets - 12 reps' },
            { name: 'Push Ups', detail: '3 sets - 10 reps' },
            { name: 'Seated Row', detail: '3 sets - 12 reps' },
            { name: 'Bike Intervals', detail: '8 rounds - 30 seconds' },
        ],
    },
    {
        title: 'Upper Conditioning',
        focus: 'Upper body and core',
        exercises: [
            { name: 'Dumbbell Press', detail: '3 sets - 12 reps' },
            { name: 'Lat Pulldown', detail: '3 sets - 12 reps' },
            { name: 'Battle Ropes', detail: '6 rounds - 20 seconds' },
            { name: 'Mountain Climbers', detail: '3 sets - 30 seconds' },
        ],
    },
    {
        title: 'Leg Conditioning',
        focus: 'Lower body and stamina',
        exercises: [
            { name: 'Leg Press', detail: '3 sets - 12 reps' },
            { name: 'Walking Lunges', detail: '3 sets - 12 each side' },
            { name: 'Kettlebell Swings', detail: '3 sets - 15 reps' },
            { name: 'Incline Walk', detail: '12 minutes' },
        ],
    },
    {
        title: 'Cardio Core',
        focus: 'Core and calorie burn',
        exercises: [
            { name: 'Plank', detail: '3 rounds - 40 seconds' },
            { name: 'Cable Woodchop', detail: '3 sets - 12 each side' },
            { name: 'Rowing Machine', detail: '10 minutes' },
            { name: 'Step Ups', detail: '3 sets - 12 reps' },
        ],
    },
    {
        title: 'Full Body Circuit',
        focus: 'Metabolic training',
        exercises: [
            { name: 'Dumbbell Squat', detail: '3 sets - 12 reps' },
            { name: 'Chest Press', detail: '3 sets - 12 reps' },
            { name: 'Cable Row', detail: '3 sets - 12 reps' },
            { name: 'Jump Rope', detail: '6 rounds - 45 seconds' },
        ],
    },
    {
        title: 'Rest Day',
        focus: 'Recovery and hydration',
        rest: true,
        exercises: [
            { name: 'Walk', detail: '20 minutes' },
            { name: 'Breathing Work', detail: '5 minutes' },
        ],
    },
];

const proBulkingPlan: WorkoutDay[] = [
    {
        title: 'Rest Day',
        focus: 'Recovery',
        rest: true,
        exercises: [
            { name: 'Mobility', detail: '20 minutes' },
            { name: 'Meal Prep', detail: 'Hit protein target' },
        ],
    },
    {
        title: 'Heavy Push',
        focus: 'Chest and shoulders',
        exercises: [
            { name: 'Barbell Bench Press', detail: '5 sets - 5 reps' },
            { name: 'Incline Press', detail: '4 sets - 8 reps' },
            { name: 'Overhead Press', detail: '4 sets - 6 reps' },
            { name: 'Weighted Dips', detail: '3 sets - 8 reps' },
        ],
    },
    {
        title: 'Heavy Pull',
        focus: 'Back thickness',
        exercises: [
            { name: 'Deadlift', detail: '4 sets - 5 reps' },
            { name: 'Weighted Pull Ups', detail: '4 sets - 6 reps' },
            { name: 'Barbell Row', detail: '4 sets - 8 reps' },
            { name: 'Hammer Curls', detail: '3 sets - 10 reps' },
        ],
    },
    {
        title: 'Heavy Legs',
        focus: 'Squat strength',
        exercises: [
            { name: 'Back Squat', detail: '5 sets - 5 reps' },
            { name: 'Romanian Deadlift', detail: '4 sets - 8 reps' },
            { name: 'Leg Press', detail: '4 sets - 10 reps' },
            { name: 'Standing Calf Raise', detail: '4 sets - 12 reps' },
        ],
    },
    {
        title: 'Push Hypertrophy',
        focus: 'Volume work',
        exercises: [
            { name: 'Dumbbell Bench Press', detail: '4 sets - 10 reps' },
            { name: 'Cable Fly', detail: '4 sets - 12 reps' },
            { name: 'Lateral Raises', detail: '4 sets - 15 reps' },
            { name: 'Skull Crushers', detail: '3 sets - 12 reps' },
        ],
    },
    {
        title: 'Pull Hypertrophy',
        focus: 'Back and arms',
        exercises: [
            { name: 'Chest Supported Row', detail: '4 sets - 10 reps' },
            { name: 'Lat Pulldown', detail: '4 sets - 12 reps' },
            { name: 'Rear Delt Fly', detail: '4 sets - 15 reps' },
            { name: 'Preacher Curl', detail: '3 sets - 12 reps' },
        ],
    },
    {
        title: 'Leg Hypertrophy',
        focus: 'Leg volume',
        exercises: [
            { name: 'Front Squat', detail: '4 sets - 8 reps' },
            { name: 'Bulgarian Split Squat', detail: '4 sets - 10 each side' },
            { name: 'Leg Extension', detail: '4 sets - 15 reps' },
            { name: 'Seated Calf Raise', detail: '4 sets - 15 reps' },
        ],
    },
];

const proCuttingPlan: WorkoutDay[] = [
    {
        title: 'Rest Day',
        focus: 'Recovery',
        rest: true,
        exercises: [
            { name: 'Zone 2 Walk', detail: '30 minutes' },
            { name: 'Mobility', detail: '15 minutes' },
        ],
    },
    {
        title: 'Push Cut',
        focus: 'Strength retention',
        exercises: [
            { name: 'Bench Press', detail: '4 sets - 6 reps' },
            { name: 'Incline Dumbbell Press', detail: '3 sets - 10 reps' },
            { name: 'Shoulder Press', detail: '3 sets - 10 reps' },
            { name: 'Sled Push', detail: '6 rounds - 20 meters' },
        ],
    },
    {
        title: 'Pull Cut',
        focus: 'Back and conditioning',
        exercises: [
            { name: 'Pull Ups', detail: '4 sets - 8 reps' },
            { name: 'Cable Row', detail: '4 sets - 10 reps' },
            { name: 'Face Pulls', detail: '3 sets - 15 reps' },
            { name: 'Rower Sprint', detail: '8 rounds - 30 seconds' },
        ],
    },
    {
        title: 'Leg Cut',
        focus: 'Legs and intervals',
        exercises: [
            { name: 'Back Squat', detail: '4 sets - 6 reps' },
            { name: 'Walking Lunges', detail: '4 sets - 12 each side' },
            { name: 'Hamstring Curl', detail: '3 sets - 12 reps' },
            { name: 'Bike Sprint', detail: '10 rounds - 20 seconds' },
        ],
    },
    {
        title: 'Upper Circuit',
        focus: 'Volume and burn',
        exercises: [
            { name: 'Chest Press', detail: '4 sets - 12 reps' },
            { name: 'Lat Pulldown', detail: '4 sets - 12 reps' },
            { name: 'Lateral Raises', detail: '3 sets - 15 reps' },
            { name: 'Battle Ropes', detail: '8 rounds - 20 seconds' },
        ],
    },
    {
        title: 'Lower Circuit',
        focus: 'Athletic conditioning',
        exercises: [
            { name: 'Trap Bar Deadlift', detail: '4 sets - 6 reps' },
            { name: 'Step Ups', detail: '4 sets - 12 each side' },
            { name: 'Kettlebell Swings', detail: '4 sets - 15 reps' },
            { name: 'Incline Walk', detail: '15 minutes' },
        ],
    },
    {
        title: 'Full Body HIIT',
        focus: 'Calorie burn',
        exercises: [
            { name: 'Thrusters', detail: '4 sets - 10 reps' },
            { name: 'Renegade Row', detail: '4 sets - 10 reps' },
            { name: 'Burpees', detail: '5 rounds - 10 reps' },
            { name: 'Core Finisher', detail: '8 minutes' },
        ],
    },
];

const workoutPlans: Record<WorkoutLevel, Record<WorkoutGoal, WorkoutDay[]>> = {
    beginner: {
        bulking: beginnerBulkingPlan,
        cutting: beginnerCuttingPlan,
    },
    pro: {
        bulking: proBulkingPlan,
        cutting: proCuttingPlan,
    },
};

function TodayWorkoutCard({ member }: { member?: Member }) {
    const memberPlan = member?.plan ?? 'No plan yet';
    const isBasicPlan = memberPlan.toLowerCase() === 'basic';
    const storageKey = `gymfit-workout-plan-${member?.id ?? 'guest'}`;
    const customStorageKey = `gymfit-custom-workout-${member?.id ?? 'guest'}`;
    const dailyWorkoutKey = `gymfit-daily-workout-${member?.id ?? 'guest'}`;
    const [level, setLevel] = useState<WorkoutLevel | null>(null);
    const [goal, setGoal] = useState<WorkoutGoal | null>(null);
    const [customTitle, setCustomTitle] = useState('My Workout');
    const [customFocus, setCustomFocus] = useState('Custom plan');
    const [customExercises, setCustomExercises] = useState('');
    const [draftExercise, setDraftExercise] = useState('');
    const [draftExerciseDetail, setDraftExerciseDetail] = useState('');
    const [dailyWorkout, setDailyWorkout] = useState<DailyWorkout | null>(null);
    const [activeWorkout, setActiveWorkout] = useState(false);
    const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
    const [activeSet, setActiveSet] = useState(1);
    const [activeWeight, setActiveWeight] = useState(0);
    const [loggedSets, setLoggedSets] = useState<ActiveWorkoutSet[]>([]);
    const [restSeconds, setRestSeconds] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [today, setToday] = useState(() => new Date());

    useEffect(() => {
        const savedPlan = window.localStorage.getItem(storageKey);
        const savedCustom = window.localStorage.getItem(customStorageKey);
        const savedDailyWorkout = window.localStorage.getItem(dailyWorkoutKey);

        if (savedPlan) {
            const parsed = JSON.parse(savedPlan) as {
                level?: WorkoutLevel;
                goal?: WorkoutGoal;
            };

            if (parsed.level && parsed.goal) {
                setLevel(parsed.level);
                setGoal(parsed.goal);
            }
        }

        if (savedCustom) {
            const parsed = JSON.parse(savedCustom) as {
                title?: string;
                focus?: string;
                exercises?: string;
            };

            setCustomTitle(parsed.title ?? 'My Workout');
            setCustomFocus(parsed.focus ?? 'Custom plan');
            setCustomExercises(parsed.exercises ?? '');
        }

        if (savedDailyWorkout) {
            setDailyWorkout(JSON.parse(savedDailyWorkout) as DailyWorkout);
        }
    }, [customStorageKey, dailyWorkoutKey, storageKey]);

    useEffect(() => {
        const timer = window.setInterval(() => setToday(new Date()), 60000);

        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!activeWorkout) {
            return undefined;
        }

        const timer = window.setInterval(
            () => setElapsedSeconds((current) => current + 1),
            1000,
        );

        return () => window.clearInterval(timer);
    }, [activeWorkout]);

    useEffect(() => {
        if (restSeconds <= 0) {
            return undefined;
        }

        const timer = window.setInterval(
            () => setRestSeconds((current) => Math.max(current - 1, 0)),
            1000,
        );

        return () => window.clearInterval(timer);
    }, [restSeconds]);

    const savePlan = (nextLevel: WorkoutLevel, nextGoal: WorkoutGoal) => {
        setLevel(nextLevel);
        setGoal(nextGoal);
        window.localStorage.setItem(
            storageKey,
            JSON.stringify({ level: nextLevel, goal: nextGoal }),
        );
    };

    const saveCustomWorkout = () => {
        window.localStorage.setItem(
            customStorageKey,
            JSON.stringify({
                title: customTitle,
                focus: customFocus,
                exercises: customExercises,
            }),
        );
    };

    const addCustomExercise = () => {
        const exerciseName = draftExercise.trim();
        const exerciseDetail = draftExerciseDetail.trim();

        if (!exerciseName) {
            return;
        }

        setCustomExercises((current) =>
            [
                current.trim(),
                `${exerciseName} - ${exerciseDetail || 'Custom sets and reps'}`,
            ]
                .filter(Boolean)
                .join('\n'),
        );
        setDraftExercise('');
        setDraftExerciseDetail('');
    };

    const todayIndex = today.getDay();
    const selectedPlan = level && goal ? workoutPlans[level][goal] : null;
    const workout = selectedPlan?.[todayIndex];
    const savedWorkout: WorkoutDay | null =
        dailyWorkout && dailyWorkout.exercises.length
            ? {
                  title: dailyWorkout.title || "Today's Workout",
                  focus: `${dailyWorkout.focus || 'Custom'} - ${dailyWorkout.durationMin || 0} min`,
                  exercises: dailyWorkout.exercises.map((exercise) => ({
                      name: exercise.name,
                      detail: `${exercise.sets} sets - ${exercise.reps} reps - ${exercise.weightKg} kg`,
                  })),
              }
            : null;
    const customWorkout: WorkoutDay = {
        title: customTitle || 'My Workout',
        focus: customFocus || 'Custom plan',
        exercises: customExercises
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .slice(0, 6)
            .map((line) => {
                const [name, detail] = line.split('-').map((part) => part.trim());

                return {
                    name: name || 'Exercise',
                    detail: detail || 'Custom sets and reps',
                };
            }),
    };
    const displayedWorkout = savedWorkout ?? (isBasicPlan ? customWorkout : workout);
    const activeExercise = displayedWorkout?.exercises[activeExerciseIndex];
    const activeExerciseSets = activeExercise
        ? parseExerciseSets(activeExercise.detail)
        : 1;
    const activeExerciseWeight = activeExercise
        ? parseExerciseWeight(activeExercise.detail)
        : 0;
    const completedWorkoutSets = loggedSets.length;
    const totalWorkoutSets =
        displayedWorkout?.exercises.reduce(
            (sum, exercise) => sum + parseExerciseSets(exercise.detail),
            0,
        ) ?? 0;

    const startWorkout = () => {
        if (!displayedWorkout || displayedWorkout.rest) {
            return;
        }

        setActiveExerciseIndex(0);
        setActiveSet(1);
        setActiveWeight(parseExerciseWeight(displayedWorkout.exercises[0].detail));
        setLoggedSets([]);
        setRestSeconds(0);
        setElapsedSeconds(0);
        setActiveWorkout(true);
    };

    const logCurrentSet = () => {
        if (!activeExercise || !displayedWorkout) {
            return;
        }

        setLoggedSets((current) => [
            ...current,
            {
                exerciseIndex: activeExerciseIndex,
                setNumber: activeSet,
                weight: activeWeight,
            },
        ]);

        if (activeSet < activeExerciseSets) {
            setActiveSet((current) => current + 1);
            setRestSeconds(90);
            return;
        }

        if (activeExerciseIndex < displayedWorkout.exercises.length - 1) {
            const nextExerciseIndex = activeExerciseIndex + 1;
            setActiveExerciseIndex(nextExerciseIndex);
            setActiveSet(1);
            setActiveWeight(
                parseExerciseWeight(
                    displayedWorkout.exercises[nextExerciseIndex].detail,
                ),
            );
            setRestSeconds(90);
            return;
        }

        setRestSeconds(0);
    };

    const finishWorkout = () => {
        window.localStorage.setItem(
            `gymfit-last-workout-session-${member?.id ?? 'guest'}`,
            JSON.stringify({
                finishedAt: new Date().toISOString(),
                elapsedSeconds,
                sets: loggedSets,
            }),
        );
        setActiveWorkout(false);
    };

    if (isBasicPlan) {
        return (
            <Card className="rounded-lg border-0 bg-white/75 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                    <div>
                        <CardTitle className="text-lg">
                            Today&apos;s Workout
                        </CardTitle>
                        <p className="mt-1 text-sm text-slate-600">
                            Basic members can edit workout details on the
                            Today's Workout page.
                        </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        Custom
                    </span>
                </CardHeader>
                <CardContent>
                    {displayedWorkout?.exercises.length ? (
                        <WorkoutExerciseList workout={displayedWorkout} />
                    ) : (
                        <p className="text-sm text-slate-500">
                            No workout saved yet.
                        </p>
                    )}
                    <Button
                        asChild
                        className="mt-5 w-full bg-red-500 text-white hover:bg-red-600"
                    >
                        <a href="/todays-workout">
                            <Plus className="mr-2 size-4" />
                            Edit Today's Workout
                        </a>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!level) {
        return (
            <Card className="rounded-lg border-0 bg-white/75 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                        Build Your Workout Plan
                    </CardTitle>
                    <p className="mt-1 text-sm text-slate-600">
                        First, choose your training level.
                    </p>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                    <Button
                        type="button"
                        className="h-14 bg-red-500 text-white hover:bg-red-600"
                        onClick={() => setLevel('beginner')}
                    >
                        Beginner
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-14 border-slate-200"
                        onClick={() => setLevel('pro')}
                    >
                        Pro
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!goal) {
        return (
            <Card className="rounded-lg border-0 bg-white/75 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                        Choose Your Goal
                    </CardTitle>
                    <p className="mt-1 text-sm text-slate-600">
                        {level === 'beginner'
                            ? 'Beginner plans run 5 workout days and 2 rest days.'
                            : 'Pro plans run 6 workout days and 1 rest day.'}
                    </p>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                    <Button
                        type="button"
                        className="h-14 bg-red-500 text-white hover:bg-red-600"
                        onClick={() => savePlan(level, 'bulking')}
                    >
                        Bulking
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-14 border-slate-200"
                        onClick={() => savePlan(level, 'cutting')}
                    >
                        Cutting
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="sm:col-span-2"
                        onClick={() => setLevel(null)}
                    >
                        Back
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-lg border-0 bg-white/75 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                    <CardTitle className="text-lg">Today&apos;s Workout</CardTitle>
                    <p className="mt-1 text-sm text-slate-600">
                        {displayedWorkout?.focus ?? 'Workout plan'} -{' '}
                        {weekdayNames[todayIndex]}
                    </p>
                </div>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                    {displayedWorkout?.rest ? 'Rest Day' : 'Scheduled'}
                </span>
            </CardHeader>
            <CardContent>
                {displayedWorkout && (
                    <>
                        <p className="mb-4 text-sm font-semibold text-slate-950">
                            {displayedWorkout.title}
                        </p>
                        <WorkoutExerciseList workout={displayedWorkout} />
                        <ActiveWorkoutOverlay
                            open={activeWorkout}
                            workout={displayedWorkout}
                            activeExerciseIndex={activeExerciseIndex}
                            activeSet={activeSet}
                            activeWeight={activeWeight}
                            elapsedSeconds={elapsedSeconds}
                            restSeconds={restSeconds}
                            completedSets={completedWorkoutSets}
                            totalSets={totalWorkoutSets}
                            onWeightChange={setActiveWeight}
                            onLogSet={logCurrentSet}
                            onSkipRest={() => setRestSeconds(0)}
                            onFinish={finishWorkout}
                            onClose={() => setActiveWorkout(false)}
                        />
                    </>
                )}
                <div className="mt-5 flex gap-3">
                    <Button
                        className="flex-1 bg-red-500 text-white hover:bg-red-600"
                        disabled={displayedWorkout?.rest}
                        onClick={startWorkout}
                    >
                        <Play className="mr-2 size-4 fill-current" />
                        {displayedWorkout?.rest ? 'Rest Today' : 'Start Workout'}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => {
                            setLevel(null);
                            setGoal(null);
                            window.localStorage.removeItem(storageKey);
                        }}
                    >
                        <MoreHorizontal className="size-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function WorkoutExerciseList({ workout }: { workout: WorkoutDay }) {
    return (
        <div className="grid gap-3">
            {workout.exercises.map((exercise, index) => (
                <div key={exercise.name} className="flex items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-lg bg-slate-100 text-slate-500">
                        <Dumbbell className="size-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-950">
                            {exercise.name}
                        </p>
                        <p className="text-xs text-slate-500">
                            {exercise.detail}
                        </p>
                    </div>
                    <span className="ml-auto text-xs font-semibold text-slate-300">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                </div>
            ))}
        </div>
    );
}

function parseExerciseSets(detail: string) {
    const match = detail.match(/(\d+)\s*sets?/i);

    return match ? Number(match[1]) : 1;
}

function parseExerciseWeight(detail: string) {
    const match = detail.match(/(\d+(?:\.\d+)?)\s*kg/i);

    return match ? Number(match[1]) : 0;
}

function formatSessionTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function ActiveWorkoutOverlay({
    open,
    workout,
    activeExerciseIndex,
    activeSet,
    activeWeight,
    elapsedSeconds,
    restSeconds,
    completedSets,
    totalSets,
    onWeightChange,
    onLogSet,
    onSkipRest,
    onFinish,
    onClose,
}: {
    open: boolean;
    workout: WorkoutDay;
    activeExerciseIndex: number;
    activeSet: number;
    activeWeight: number;
    elapsedSeconds: number;
    restSeconds: number;
    completedSets: number;
    totalSets: number;
    onWeightChange: (value: number) => void;
    onLogSet: () => void;
    onSkipRest: () => void;
    onFinish: () => void;
    onClose: () => void;
}) {
    if (!open) {
        return null;
    }

    const exercise = workout.exercises[activeExerciseIndex];
    const exerciseSets = parseExerciseSets(exercise.detail);
    const finishedAllSets = totalSets > 0 && completedSets >= totalSets;
    const progress = totalSets
        ? Math.round((completedSets / totalSets) * 100)
        : 0;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-lg bg-white shadow-2xl">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-red-600">
                            Active Workout
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-950">
                            {exercise.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {workout.title} - {formatSessionTime(elapsedSeconds)}
                        </p>
                    </div>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Pause
                    </Button>
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_220px]">
                    <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-500">
                                    Current Set
                                </p>
                                <p className="mt-2 text-4xl font-bold text-slate-950">
                                    {finishedAllSets
                                        ? 'Done'
                                        : `${activeSet} / ${exerciseSets}`}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-500">
                                    Progress
                                </p>
                                <p className="mt-2 text-3xl font-bold text-red-500">
                                    {progress}%
                                </p>
                            </div>
                        </div>

                        <div className="mt-5">
                            <label className="text-sm font-semibold text-slate-600">
                                Weight for this set (kg)
                            </label>
                            <Input
                                type="number"
                                min={0}
                                value={activeWeight}
                                onChange={(event) =>
                                    onWeightChange(
                                        Number(event.target.value) || 0,
                                    )
                                }
                                className="mt-2 h-12 text-lg font-semibold"
                            />
                        </div>

                        {restSeconds > 0 && (
                            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                                <p className="text-sm font-semibold text-amber-900">
                                    Rest Timer
                                </p>
                                <p className="mt-1 text-3xl font-bold text-amber-700">
                                    {formatSessionTime(restSeconds)}
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 border-amber-200 text-amber-800"
                                    onClick={onSkipRest}
                                >
                                    Skip Rest
                                </Button>
                            </div>
                        )}

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <Button
                                type="button"
                                className="h-12 bg-red-500 text-white hover:bg-red-600"
                                onClick={onLogSet}
                                disabled={finishedAllSets}
                            >
                                Log Set
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-12"
                                onClick={onFinish}
                            >
                                Finish Workout
                            </Button>
                        </div>
                    </section>

                    <aside className="grid content-start gap-3">
                        <div className="rounded-lg border border-slate-200 p-4 text-center">
                            <p className="text-sm text-slate-500">
                                Sets Logged
                            </p>
                            <p className="mt-1 text-3xl font-bold text-slate-950">
                                {completedSets}/{totalSets}
                            </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 p-4">
                            <p className="text-sm font-semibold text-slate-950">
                                Exercise Queue
                            </p>
                            <div className="mt-3 grid gap-2">
                                {workout.exercises.map((item, index) => (
                                    <div
                                        key={`${item.name}-${index}`}
                                        className={`rounded-lg px-3 py-2 text-sm ${
                                            index === activeExerciseIndex
                                                ? 'bg-red-50 font-semibold text-red-700'
                                                : 'bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        {index + 1}. {item.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function WeeklyProgressCard({
    attendancePercent,
}: {
    attendancePercent: number;
}) {
    const points = [
        [8, 126],
        [52, 126],
        [96, 126],
        [140, 126],
        [184, 126],
        [228, 126],
        [272, 126],
        [316, 126],
    ];
    const path = points
        .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`)
        .join(' ');

    return (
        <Card className="rounded-lg border-0 bg-white/75 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Weekly Progress</CardTitle>
                <Button variant="ghost" size="sm" className="text-slate-500">
                    This Week
                </Button>
            </CardHeader>
            <CardContent>
                <svg
                    viewBox="0 0 330 150"
                    className="h-48 w-full text-red-500"
                    aria-hidden="true"
                >
                    <path
                        d={`${path} L 316 145 L 8 145 Z`}
                        fill="currentColor"
                        opacity="0.08"
                    />
                    <path
                        d={path}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {points.map(([x, y]) => (
                        <circle
                            key={`${x}-${y}`}
                            cx={x}
                            cy={y}
                            r="5"
                            fill="white"
                            stroke="currentColor"
                            strokeWidth="3"
                        />
                    ))}
                </svg>
                <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                    <MiniMetric label="Volume" value="0 kg" detail="0%" />
                    <MiniMetric label="Reps" value="0" detail="0%" />
                    <MiniMetric
                        label="Plan"
                        value={`${attendancePercent}%`}
                        detail="0%"
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function UpcomingClassesCard() {
    const classes = [
        ['HIIT Blast', 'Today, 6:00 PM', Activity, 'emerald'],
        ['Yoga Flow', 'Tomorrow, 7:00 AM', Users, 'red'],
        ['Strength Training', 'Tomorrow, 6:00 PM', Dumbbell, 'amber'],
        ['Boxing Fundamentals', 'May 14, 5:30 PM', Trophy, 'rose'],
    ] as const;

    return (
        <Card className="rounded-lg border-0 bg-white/75 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Upcoming Classes</CardTitle>
                <a
                    href="/attendance"
                    className="text-xs font-semibold text-red-700"
                >
                    View all
                </a>
            </CardHeader>
            <CardContent className="grid gap-4">
                {classes.map(([title, time, Icon, tone]) => (
                    <div key={title} className="flex items-center gap-3">
                        <span
                            className={`grid size-10 place-items-center rounded-lg ${
                                tone === 'emerald'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : tone === 'red'
                                      ? 'bg-red-50 text-red-600'
                                      : tone === 'amber'
                                        ? 'bg-amber-50 text-amber-600'
                                        : 'bg-rose-50 text-rose-600'
                            }`}
                        >
                            <Icon className="size-5" />
                        </span>
                        <span>
                            <span className="block text-sm font-semibold text-slate-950">
                                {title}
                            </span>
                            <span className="block text-xs text-slate-500">
                                {time}
                            </span>
                        </span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function NutritionSummaryCard() {
    return (
        <Card className="rounded-lg border-0 bg-white/75 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Nutrition Summary</CardTitle>
                <a
                    href="/my-plan"
                    className="text-xs font-semibold text-red-700"
                >
                    View details
                </a>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-[130px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[130px_minmax(0,1fr)]">
                    <div className="relative grid size-32 place-items-center rounded-full bg-slate-100">
                        <div className="grid size-24 place-items-center rounded-full bg-white text-center">
                            <span>
                                <span className="block text-2xl font-bold text-slate-950">
                                    0
                                </span>
                                <span className="text-xs text-slate-500">
                                    / 2,400 cal
                                </span>
                            </span>
                        </div>
                    </div>
                    <div className="grid content-center gap-3 text-sm">
                        <MacroDot color="bg-red-500" label="Protein" value="0g / 150g" />
                        <MacroDot color="bg-emerald-500" label="Carbs" value="0g / 250g" />
                        <MacroDot color="bg-amber-500" label="Fats" value="0g / 80g" />
                    </div>
                </div>
                <div className="mt-5">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Water Intake</span>
                        <span className="font-semibold text-slate-950">
                            0 / 8 glasses
                        </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div className="h-2 w-0 rounded-full bg-red-500" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function RecentAchievementsCard() {
    const achievements = [
        ['Strong Foundation', 'Complete 10 workouts', 'May 10', Trophy],
        ['Early Riser', 'Workout 3 days in a row', 'May 8', CalendarCheck],
        ['Heavy Lifter', 'Lift 1000kg total volume', 'May 5', Flame],
    ] as const;

    return (
        <Card className="rounded-lg border-0 bg-white/75 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Recent Achievements</CardTitle>
                <a
                    href="/dashboard"
                    className="text-xs font-semibold text-red-700"
                >
                    View all
                </a>
            </CardHeader>
            <CardContent className="grid gap-3">
                {achievements.map(([title, detail, date, Icon]) => (
                    <div key={title} className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-lg bg-red-50 text-red-600">
                            <Icon className="size-4" />
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-950">
                                {title}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                                {detail}
                            </span>
                        </span>
                        <span className="ml-auto text-xs text-slate-400">
                            {date}
                        </span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function MemberQuickActions() {
    const actions = [
        ['Log Workout', Dumbbell, '/attendance', 'red'],
        ['Body Stats', UserRound, '/settings/profile', 'emerald'],
        ['Measurements', Ruler, '/settings/profile', 'amber'],
        ['Progress Photos', CameraIcon, '/settings/profile', 'blue'],
    ] as const;

    return (
        <Card className="rounded-lg border-0 bg-white/75 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
                {actions.map(([label, Icon, href, tone]) => (
                    <a
                        key={label}
                        href={href}
                        className="grid gap-2 rounded-lg p-3 text-center transition hover:bg-white"
                    >
                        <span
                            className={`mx-auto grid size-12 place-items-center rounded-lg ${
                                tone === 'red'
                                    ? 'bg-red-50 text-red-600'
                                    : tone === 'emerald'
                                      ? 'bg-emerald-50 text-emerald-600'
                                      : tone === 'amber'
                                        ? 'bg-amber-50 text-amber-600'
                                        : 'bg-blue-50 text-blue-600'
                            }`}
                        >
                            <Icon className="size-5" />
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                            {label}
                        </span>
                    </a>
                ))}
            </CardContent>
        </Card>
    );
}

function MemberPlanMiniCard({
    currentMember,
    currentPlan,
    latestPayment,
    outstandingBalance,
}: {
    currentMember?: Member;
    currentPlan?: Plan;
    latestPayment?: Payment;
    outstandingBalance: number;
}) {
    return (
        <Card className="rounded-lg border-0 bg-white/75 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Membership</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-700">
                        Current Plan
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">
                        {currentMember?.plan ?? 'No plan yet'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        {currentPlan?.duration ?? 'Choose a plan to start'}
                    </p>
                </div>
                <div className="mt-4 grid gap-3 text-sm">
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Latest Payment</span>
                        <span className="font-semibold text-slate-950">
                            {latestPayment
                                ? currency(latestPayment.amount)
                                : 'None'}
                        </span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Balance</span>
                        <span className="font-semibold text-slate-950">
                            {currency(outstandingBalance)}
                        </span>
                    </div>
                </div>
                <Button
                    asChild
                    className="mt-5 w-full bg-red-500 text-white hover:bg-red-600"
                >
                    <a href="/my-plan">Manage Plan</a>
                </Button>
            </CardContent>
        </Card>
    );
}

function MiniMetric({
    label,
    value,
    detail,
}: {
    label: string;
    value: string;
    detail: string;
}) {
    return (
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-600">
                {detail}
            </p>
        </div>
    );
}

function MacroDot({
    color,
    label,
    value,
}: {
    color: string;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${color}`} />
            <span>
                <span className="block font-semibold text-slate-700">
                    {label}
                </span>
                <span className="text-xs text-slate-500">{value}</span>
            </span>
        </div>
    );
}

function CameraIcon({ className }: { className?: string }) {
    return <ReceiptText className={className} />;
}

function HeroIllustration() {
    return (
        <div className="relative hidden h-44 lg:block">
            <div className="absolute bottom-8 left-16 h-3 w-72 rounded-full bg-slate-300" />
            <div className="absolute bottom-11 left-20 h-5 w-64 rounded-lg bg-slate-900" />
            <div className="absolute bottom-16 left-32 h-20 w-3 -rotate-12 rounded-full bg-slate-700" />
            <div className="absolute bottom-24 left-40 h-16 w-20 rounded-lg bg-slate-800" />
            <div className="absolute bottom-24 left-60 h-2 w-28 -rotate-12 rounded-full bg-slate-700" />
            <div className="absolute bottom-29 left-68 size-9 rounded-full bg-amber-200" />
            <div className="absolute bottom-18 left-70 h-16 w-9 rounded-full bg-violet-600" />
            <div className="absolute bottom-12 left-64 h-10 w-3 rotate-12 rounded-full bg-slate-900" />
            <div className="absolute bottom-12 left-78 h-12 w-3 -rotate-12 rounded-full bg-slate-900" />
            <div className="absolute bottom-7 left-61 h-3 w-10 rounded-full bg-slate-900" />
            <div className="absolute bottom-7 left-78 h-3 w-10 rounded-full bg-slate-900" />
            <div className="absolute right-6 bottom-12 grid h-24 w-20 place-items-center rounded border-4 border-violet-100 text-center text-xs font-bold text-violet-200">
                STAY
                <br />
                STRONG
            </div>
            <div className="absolute right-32 bottom-10 flex items-end gap-2">
                {[24, 34, 44].map((height) => (
                    <span
                        key={height}
                        className="w-2 rounded-full bg-violet-200"
                        style={{ height }}
                    />
                ))}
            </div>
        </div>
    );
}

function AccountMetricCard({
    icon: Icon,
    title,
    value,
    detail,
    badge,
    progress,
    tone,
}: {
    icon: IconComponent;
    title: string;
    value: string;
    detail?: string;
    badge?: string;
    progress?: number;
    tone: 'violet' | 'blue' | 'emerald' | 'amber';
}) {
    const tones = {
        violet: 'bg-violet-50 text-violet-600',
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
    };

    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="flex gap-4 pt-6">
                <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}
                >
                    <Icon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-600">
                        {title}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {value}
                    </p>
                    {badge && <StatusBadge status={badge} />}
                    {detail && (
                        <p className="mt-3 text-sm text-slate-500">{detail}</p>
                    )}
                    {typeof progress === 'number' && (
                        <div className="mt-3 h-2 rounded-full bg-slate-100">
                            <div
                                className="h-2 rounded-full bg-emerald-500"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function MemberPlanDetails({
    currentMember,
    currentPlan,
    latestPayment,
}: {
    currentMember?: Member;
    currentPlan?: Plan;
    latestPayment?: Payment;
}) {
    return (
        <Card
            id="plan-details"
            className="rounded-lg border-slate-200 bg-white shadow-sm"
        >
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="size-5 text-violet-600" />
                    My Plan Details
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[minmax(220px,0.85fr)_minmax(260px,1.15fr)]">
                <div className="rounded-lg bg-violet-50 p-5">
                    <p className="font-semibold text-slate-950">
                        {currentMember?.plan ?? 'No plan yet'}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">
                        {currentPlan ? currency(currentPlan.price) : '$0.00'}
                        <span className="text-sm font-normal text-slate-500">
                            {' '}
                            / month
                        </span>
                    </p>
                    <ul className="mt-5 space-y-3 text-sm text-slate-600">
                        {[
                            'Full access to gym facilities',
                            'Group classes',
                            'Progress tracking',
                            'Member support',
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-2">
                                <CheckCircle2 className="size-4 text-emerald-600" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <Button
                        asChild
                        className="mt-6 w-full bg-violet-600 text-white hover:bg-violet-700"
                    >
                        <a href="/my-plan">Manage Plan</a>
                    </Button>
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-slate-950">
                        Plan Information
                    </p>
                    <div className="mt-4 divide-y divide-slate-100 text-sm">
                        <InfoRow
                            label="Plan Name"
                            value={currentMember?.plan ?? 'N/A'}
                        />
                        <InfoRow
                            label="Start Date"
                            value={readableDate(
                                currentMember?.plan_started_at ??
                                    currentMember?.join_date,
                            )}
                        />
                        <InfoRow
                            label="Renew Date"
                            value={readableDate(latestPayment?.payment_date)}
                        />
                        <InfoRow
                            label="Billing Cycle"
                            value={currentPlan?.duration ?? 'Monthly'}
                        />
                        <InfoRow
                            label="Payment Method"
                            value={latestPayment?.method ?? 'N/A'}
                        />
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="mt-5 w-full border-violet-200 text-violet-700 hover:bg-violet-50"
                    >
                        <a href="/my-plan">View Plan Details</a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function AttendanceOverview({ member }: { member?: Member }) {
    const [now, setNow] = useState(() => new Date());
    const planStart = parseDate(member?.plan_started_at ?? member?.join_date);
    const attendanceStarted =
        Boolean(member) &&
        Boolean(planStart) &&
        member?.plan !== 'No plan yet' &&
        member?.status !== 'Pending';
    const monthDays = monthCalendarDays(now);
    const today = startOfDay(now);
    const planStartDay = planStart ? startOfDay(planStart) : null;
    const monthLabel = new Intl.DateTimeFormat(undefined, {
        month: 'long',
        year: 'numeric',
    }).format(now);
    const timeLabel = new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
    }).format(now);

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);

        return () => window.clearInterval(timer);
    }, []);

    return (
        <Card
            id="attendance-overview"
            className="rounded-lg border-slate-200 bg-white shadow-sm"
        >
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <CalendarDays className="size-5 text-violet-600" />
                        Attendance Overview
                    </CardTitle>
                    <p className="mt-1 text-sm text-slate-500">{timeLabel}</p>
                </div>
                <Button variant="outline" size="sm">
                    {monthLabel}
                </Button>
            </CardHeader>
            <CardContent>
                {!attendanceStarted && (
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Attendance will start when your plan becomes active.
                    </div>
                )}
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    {monthDays.map((day) => (
                        <CalendarDot
                            key={day.toISOString()}
                            date={day}
                            currentMonth={now.getMonth()}
                            today={today}
                            planStart={planStartDay}
                            attendanceStarted={attendanceStarted}
                        />
                    ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500">
                    <Legend color="bg-emerald-500" label="Present" />
                    <Legend color="bg-rose-500" label="Absent" />
                    <Legend color="bg-slate-300" label="Not Checked In" />
                </div>
            </CardContent>
        </Card>
    );
}

function RecentActivity({ payments }: { payments: Payment[] }) {
    const activities = payments.slice(0, 3);

    return (
        <Card
            id="recent-activity"
            className="rounded-lg border-slate-200 bg-white shadow-sm"
        >
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="size-5 text-violet-600" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <ActivityItem
                        icon={CheckCircle2}
                        title="Checked in"
                        detail="Today, 07:15 AM"
                        tone="emerald"
                    />
                    {activities.map((payment) => (
                        <ActivityItem
                            key={payment.id}
                            icon={CreditCard}
                            title="Payment Successful"
                            detail={`${payment.payment_date ?? 'Recent'} - ${currency(payment.amount)}`}
                            tone="violet"
                        />
                    ))}
                </div>
                {!activities.length && (
                    <p className="mt-4 text-sm text-slate-500">
                        No recent payment activity.
                    </p>
                )}
                <Button
                    asChild
                    variant="link"
                    className="mt-4 px-0 text-violet-700"
                >
                    <a href="/payments">View all activity</a>
                </Button>
            </CardContent>
        </Card>
    );
}

function QuickAction({
    icon: Icon,
    title,
    detail,
    href,
}: {
    icon: IconComponent;
    title: string;
    detail: string;
    href: string;
}) {
    return (
        <a
            href={href}
            className="flex items-center justify-between rounded-lg border border-violet-100 px-4 py-4 transition hover:border-violet-300 hover:bg-violet-50"
        >
            <span className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                    <Icon className="size-5" />
                </span>
                <span>
                    <span className="block font-semibold text-slate-950">
                        {title}
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">
                        {detail}
                    </span>
                </span>
            </span>
            <ChevronRight className="size-5 text-slate-400" />
        </a>
    );
}

function ActivityItem({
    icon: Icon,
    title,
    detail,
    tone,
}: {
    icon: IconComponent;
    title: string;
    detail: string;
    tone: 'emerald' | 'violet';
}) {
    const toneClass =
        tone === 'emerald'
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-violet-50 text-violet-600';

    return (
        <div className="flex min-w-0 gap-3">
            <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full ${toneClass}`}
            >
                <Icon className="size-4" />
            </span>
            <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-950">
                    {title}
                </span>
                <span className="block truncate text-sm text-slate-500">
                    {detail}
                </span>
            </span>
        </div>
    );
}

function CalendarDot({
    date,
    currentMonth,
    today,
    planStart,
    attendanceStarted,
}: {
    date: Date;
    currentMonth: number;
    today: Date;
    planStart: Date | null;
    attendanceStarted: boolean;
}) {
    const dateDay = startOfDay(date);
    const isSelected = sameDay(dateDay, today);
    const isCurrentMonth = date.getMonth() === currentMonth;
    const canTrack =
        attendanceStarted &&
        planStart !== null &&
        dateDay >= planStart &&
        dateDay <= today;
    const isAbsent =
        canTrack &&
        !isSelected &&
        dateDay.getDay() === 0 &&
        dateDay.getDate() % 2 === 1;
    const isPresent = canTrack && !isSelected && !isAbsent;
    const color = isSelected
        ? 'bg-violet-600 text-white ring-violet-200 shadow-[0_8px_20px_-10px_rgba(124,58,237,0.85)]'
        : isAbsent
          ? 'bg-rose-50 text-rose-600 ring-rose-100'
          : isPresent
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
            : isCurrentMonth
              ? 'bg-white text-slate-700 ring-transparent'
              : 'bg-white text-slate-300 ring-transparent';

    return (
        <span
            className={`grid size-9 place-items-center rounded-full text-sm font-medium ring-2 ${color}`}
            title={date.toLocaleDateString()}
        >
            {date.getDate()}
        </span>
    );
}

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <span className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${color}`} />
            {label}
        </span>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid min-w-0 gap-1 py-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-4">
            <span className="text-slate-500">{label}</span>
            <span className="min-w-0 font-medium break-words text-slate-950 sm:text-right">
                {value}
            </span>
        </div>
    );
}

function AdminTopBar({
    name,
    notificationCount = 0,
    notificationItems = [],
    profileMenuOpen = false,
    onProfileMenuToggle = () => {},
    onLogout = () => {},
}: {
    name: string;
    notificationCount?: number;
    notificationItems?: {
        id: string;
        title: string;
        detail: string;
        href: string;
    }[];
    profileMenuOpen?: boolean;
    onProfileMenuToggle?: () => void;
    onLogout?: () => void;
}) {
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    return (
        <header className="flex flex-col gap-4 border-b border-slate-200 bg-white/80 px-1 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="size-10 shrink-0 rounded-lg border-slate-200"
                    type="button"
                    aria-label="Open navigation"
                >
                    <Menu className="size-5" />
                </Button>
                <div className="min-w-0">
                    <h1 className="truncate text-2xl font-semibold text-slate-950">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Welcome back, Admin!
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative block min-w-0 sm:w-72 lg:w-80">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        className="h-10 rounded-lg border-slate-200 bg-white pl-9 text-sm"
                        placeholder="Search members, invoices..."
                    />
                </label>
                <div className="relative">
                    <Button
                        variant="outline"
                        size="icon"
                        className="relative size-10 rounded-lg border-slate-200"
                        type="button"
                        aria-label="Notifications"
                        onClick={() =>
                            setNotificationsOpen((current) => !current)
                        }
                    >
                        <Bell className="size-5" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                                {notificationCount}
                            </span>
                        )}
                    </Button>
                    {notificationsOpen && (
                        <div className="absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                            <p className="text-sm font-semibold text-slate-950">
                                Notifications
                            </p>
                            <div className="mt-3 grid gap-2">
                                {notificationItems.length ? (
                                    notificationItems.map((item) => (
                                        <a
                                            key={item.id}
                                            href={item.href}
                                            className="block rounded-lg border border-slate-100 px-3 py-2 text-left transition hover:border-red-100 hover:bg-red-50"
                                        >
                                            <p className="text-sm font-medium text-slate-950">
                                                {item.title}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {item.detail}
                                            </p>
                                        </a>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        No pending notifications.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="relative">
                    <button
                        onClick={onProfileMenuToggle}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 transition-colors hover:bg-slate-50"
                        type="button"
                    >
                        <div className="grid size-10 place-items-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                            {initials(name)}
                        </div>
                        <div className="min-w-0 text-left">
                            <p className="truncate text-sm font-semibold text-slate-950">
                                {name}
                            </p>
                            <p className="text-xs text-slate-500">Owner</p>
                        </div>
                        <ChevronRight className="size-4 rotate-90 text-slate-400" />
                    </button>

                    {profileMenuOpen && (
                        <div className="absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                            <Button
                                asChild
                                variant="ghost"
                                className="w-full justify-start rounded-none border-b"
                            >
                                <a href="/settings/profile">Edit Profile</a>
                            </Button>
                            <button
                                onClick={onLogout}
                                className="flex w-full items-center gap-2 rounded-b-lg px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-rose-600"
                                type="button"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function AdminMetricCard({
    icon: Icon,
    label,
    value,
    detail,
    tone,
}: {
    icon: IconComponent;
    label: string;
    value: string;
    detail: string;
    tone: 'rose' | 'emerald' | 'amber' | 'blue' | 'violet';
}) {
    const tones = {
        rose: 'bg-rose-50 text-rose-500',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        blue: 'bg-blue-50 text-blue-600',
        violet: 'bg-violet-50 text-violet-600',
    };

    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
                <span
                    className={`grid size-14 shrink-0 place-items-center rounded-full ${tones[tone]}`}
                >
                    <Icon className="size-7" />
                </span>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-700">
                        {label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                        {value}
                    </p>
                    <p className="mt-2 truncate text-xs text-slate-500">
                        {detail}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function AdminLineChart({
    items,
    total,
}: {
    items: Array<{
        member: string;
        present: number;
        total: number;
        rate: number;
    }>;
    total: number;
}) {
    const chartItems = items.length
        ? items
        : [
              { member: 'Mon', present: 20, total: 30, rate: 40 },
              { member: 'Tue', present: 28, total: 35, rate: 52 },
              { member: 'Wed', present: 34, total: 40, rate: 65 },
              { member: 'Thu', present: 30, total: 36, rate: 58 },
              { member: 'Fri', present: 42, total: 45, rate: 82 },
          ];
    const maxValue = Math.max(...chartItems.map((item) => item.present), 1);

    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-base">Check-Ins Overview</CardTitle>
                <Button variant="outline" size="sm" type="button">
                    This Week
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex h-64 items-end gap-3 border-b border-slate-200 pb-4">
                    {chartItems.map((item) => {
                        const height = Math.max(
                            (item.present / maxValue) * 100,
                            12,
                        );

                        return (
                            <div
                                key={item.member}
                                className="flex min-w-0 flex-1 flex-col items-center gap-3"
                            >
                                <div className="flex h-48 w-full items-end rounded-t-lg bg-gradient-to-t from-rose-50 to-transparent px-1">
                                    <div
                                        className="w-full rounded-t-md bg-gradient-to-t from-rose-300 to-rose-500"
                                        style={{ height: `${height}%` }}
                                    />
                                </div>
                                <span className="max-w-full truncate text-xs text-slate-500">
                                    {item.member.split(' ')[0]}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <p className="mt-4 text-sm text-slate-500">
                    {total} attendance records across recent members.
                </p>
            </CardContent>
        </Card>
    );
}

function MembershipStatusCard({
    total,
    active,
    pending,
    paid,
    activePercent,
}: {
    total: number;
    active: number;
    pending: number;
    paid: number;
    activePercent: number;
}) {
    const pendingPercent = total ? Math.round((pending / total) * 100) : 0;
    const paidPercent = total ? Math.round((paid / total) * 100) : 0;

    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Membership Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6">
                    <div
                        className="grid size-40 shrink-0 place-items-center rounded-full"
                        style={{
                            background: `conic-gradient(#22c55e 0 ${activePercent}%, #f59e0b ${activePercent}% ${activePercent + pendingPercent}%, #3b82f6 ${activePercent + pendingPercent}% ${activePercent + pendingPercent + paidPercent}%, #e5e7eb 0)`,
                        }}
                    >
                        <div className="grid size-24 place-items-center rounded-full bg-white text-center shadow-sm">
                            <span>
                                <span className="block text-2xl font-semibold text-slate-950">
                                    {total}
                                </span>
                                <span className="text-xs text-slate-500">
                                    Total
                                </span>
                            </span>
                        </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-3 text-sm">
                        <StatusLegend
                            color="bg-emerald-500"
                            label="Active"
                            value={`${active} (${activePercent}%)`}
                        />
                        <StatusLegend
                            color="bg-amber-500"
                            label="Pending"
                            value={`${pending} (${pendingPercent}%)`}
                        />
                        <StatusLegend
                            color="bg-blue-500"
                            label="Paid Records"
                            value={`${paid}`}
                        />
                    </div>
                </div>
                <Button
                    asChild
                    variant="link"
                    className="mt-5 px-0 text-blue-700"
                >
                    <a href="/members">View all members</a>
                </Button>
            </CardContent>
        </Card>
    );
}

function StatusLegend({
    color,
    label,
    value,
}: {
    color: string;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-600">
                <span className={`size-2 rounded-full ${color}`} />
                {label}
            </span>
            <span className="font-medium text-slate-950">{value}</span>
        </div>
    );
}

function ReminderCard({
    pendingPlans,
    pendingPayments,
    overduePayments,
}: {
    pendingPlans: number;
    pendingPayments: number;
    overduePayments: number;
}) {
    const reminders = [
        {
            icon: CalendarDays,
            count: pendingPlans,
            label: 'plan change approvals',
            tone: 'bg-rose-50 text-rose-500',
        },
        {
            icon: CreditCard,
            count: pendingPayments,
            label: 'payment confirmations',
            tone: 'bg-amber-50 text-amber-600',
        },
        {
            icon: ReceiptText,
            count: overduePayments,
            label: 'unpaid payment records',
            tone: 'bg-blue-50 text-blue-600',
        },
    ];

    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Reminders</CardTitle>
                <a
                    href="/payments"
                    className="text-xs font-semibold text-blue-700"
                >
                    View all
                </a>
            </CardHeader>
            <CardContent className="grid gap-3">
                {reminders.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-3"
                    >
                        <span className="flex min-w-0 items-center gap-3">
                            <span
                                className={`grid size-10 shrink-0 place-items-center rounded-lg ${item.tone}`}
                            >
                                <item.icon className="size-5" />
                            </span>
                            <span className="min-w-0 text-sm">
                                <span className="font-semibold text-slate-950">
                                    {item.count}
                                </span>{' '}
                                <span className="text-slate-600">
                                    {item.label}
                                </span>
                            </span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-slate-400" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function QuickActionTile({
    icon: Icon,
    label,
    onClick,
}: {
    icon: IconComponent;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="grid min-h-20 place-items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-center text-sm font-semibold text-blue-900 transition hover:border-blue-200 hover:bg-blue-50"
        >
            <Icon className="mb-2 size-5 text-blue-700" />
            {label}
        </button>
    );
}

function CompactListCard({
    title,
    emptyText,
    items,
}: {
    title: string;
    emptyText: string;
    items: Array<{
        id: number | string;
        title: string;
        detail: string;
        meta: string;
        status: string;
    }>;
}) {
    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">{title}</CardTitle>
                <a
                    href="/dashboard#attendance"
                    className="text-xs font-semibold text-blue-700"
                >
                    View all
                </a>
            </CardHeader>
            <CardContent className="grid gap-3">
                {items.length ? (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-3"
                        >
                            <span className="flex min-w-0 items-center gap-3">
                                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                                    {initials(item.title)}
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-semibold text-slate-950">
                                        {item.title}
                                    </span>
                                    <span className="block truncate text-xs text-slate-500">
                                        {item.detail}
                                    </span>
                                </span>
                            </span>
                            <span className="shrink-0 text-right">
                                <span className="block text-xs text-slate-500">
                                    {item.meta}
                                </span>
                                <StatusBadge status={item.status} />
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500">{emptyText}</p>
                )}
            </CardContent>
        </Card>
    );
}

function RecentActivityCard({ payments }: { payments: Payment[] }) {
    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <a
                    href="/payments"
                    className="text-xs font-semibold text-blue-700"
                >
                    View all
                </a>
            </CardHeader>
            <CardContent className="grid gap-3">
                {payments.length ? (
                    payments.map((payment) => (
                        <ActivityItem
                            key={payment.id}
                            icon={CreditCard}
                            title={`${payment.status} payment`}
                            detail={`${payment.member ?? `Member #${payment.member_id}`} - ${currency(payment.amount)}`}
                            tone={
                                payment.status.toLowerCase() === 'paid'
                                    ? 'emerald'
                                    : 'violet'
                            }
                        />
                    ))
                ) : (
                    <p className="text-sm text-slate-500">
                        No recent payment activity.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function TrainerRequestsCard({
    requests,
    trainers,
}: {
    requests: TrainerRequest[];
    trainers: TrainerOption[];
}) {
    const [assignedTrainers, setAssignedTrainers] = useState<
        Record<number, number>
    >({});
    const pendingRequests = requests.filter(
        (request) => request.status.toLowerCase() === 'pending',
    );
    const availableTrainers = trainers.filter(
        (trainer) => trainer.filledSlots < trainer.capacity,
    );
    const trainerById = (id: number) =>
        trainers.find((trainer) => trainer.id === id);

    const decideRequest = (request: TrainerRequest, action: string) => {
        const selectedTrainerId =
            assignedTrainers[request.id] ??
            (request.requested_trainer_full
                ? availableTrainers[0]?.id
                : request.requested_trainer_id);
        const selectedTrainer = trainerById(selectedTrainerId);

        router.post(
            `/dashboard/trainer-requests/${request.id}/decide`,
            {
                action,
                assigned_trainer_id: selectedTrainer?.id,
                assigned_trainer: selectedTrainer?.name,
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Dumbbell className="size-5 text-red-500" />
                    Trainer Requests
                </CardTitle>
                <a
                    href="/trainers"
                    className="text-xs font-semibold text-blue-700"
                >
                    View all
                </a>
            </CardHeader>
            <CardContent className="grid gap-3">
                <p className="text-sm font-semibold text-slate-700">
                    Pending Requests
                </p>
                {pendingRequests.length ? (
                    pendingRequests.map((request) => (
                        <div
                            key={request.id}
                            className="rounded-lg border border-slate-100 p-3"
                        >
                            <div className="space-y-1 text-sm">
                                <p>
                                    <span className="text-slate-500">
                                        User:
                                    </span>{' '}
                                    <span className="font-semibold text-slate-950">
                                        {request.user}
                                    </span>
                                </p>
                                <p>
                                    <span className="text-slate-500">
                                        Requested Trainer:
                                    </span>{' '}
                                    <span className="font-semibold text-slate-950">
                                        {request.requested_trainer}
                                    </span>
                                </p>
                                <p className="text-slate-500">
                                    Date: {request.date}
                                </p>
                                {request.requested_trainer_full && (
                                    <p className="font-medium text-amber-700">
                                        Requested trainer is full. Assign an
                                        available trainer before approval.
                                    </p>
                                )}
                            </div>
                            {request.requested_trainer_full && (
                                <label className="mt-3 block text-xs font-semibold text-slate-600">
                                    Assign Trainer
                                    <select
                                        className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950"
                                        value={
                                            assignedTrainers[request.id] ??
                                            availableTrainers[0]?.id ??
                                            ''
                                        }
                                        onChange={(event) =>
                                            setAssignedTrainers((current) => ({
                                                ...current,
                                                [request.id]: Number(
                                                    event.target.value,
                                                ),
                                            }))
                                        }
                                    >
                                        {availableTrainers.map((trainer) => (
                                            <option
                                                key={trainer.id}
                                                value={trainer.id}
                                            >
                                                {trainer.name} (
                                                {trainer.capacity -
                                                    trainer.filledSlots}{' '}
                                                slots)
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            )}
                            <div className="mt-3 flex gap-2">
                                <Button
                                    size="sm"
                                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                                    type="button"
                                    onClick={() =>
                                        decideRequest(request, 'approve')
                                    }
                                    disabled={
                                        request.requested_trainer_full &&
                                        !availableTrainers.length
                                    }
                                >
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                                    type="button"
                                    onClick={() =>
                                        decideRequest(request, 'reject')
                                    }
                                >
                                    Reject
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500">
                        No pending trainer requests.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function ScheduleCard() {
    const sessions: [string, string, string][] = [];

    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">
                    Today&apos;s Schedule
                </CardTitle>
                <a
                    href="/attendance"
                    className="text-xs font-semibold text-blue-700"
                >
                    View all
                </a>
            </CardHeader>
            <CardContent className="grid gap-3">
                {sessions.length > 0 ? (
                    sessions.map(([time, title, status]) => (
                        <div
                            key={`${time}-${title}`}
                            className="flex items-center justify-between gap-3 text-sm"
                        >
                            <span className="font-semibold text-slate-950">
                                {time}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium text-slate-800">
                                    {title}
                                </span>
                                <span className="text-xs text-slate-500">
                                    Coach assigned
                                </span>
                            </span>
                            <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                    status === 'Booked'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-amber-50 text-amber-700'
                                }`}
                            >
                                {status}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500">
                        No sessions scheduled today.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function TopBar({
    title,
    subtitle,
    name,
    profileMenuOpen = false,
    onProfileMenuToggle = () => {},
    onLogout = () => {},
}: {
    title: string;
    subtitle: string;
    name: string;
    profileMenuOpen?: boolean;
    onProfileMenuToggle?: () => void;
    onLogout?: () => void;
}) {
    return (
        <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
                <p className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <Dumbbell className="size-4" />
                    FitCore Manager
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                    {title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
            <div className="relative flex items-center gap-2">
                <Button
                    asChild
                    variant="outline"
                    size="icon"
                    aria-label="Settings"
                >
                    <a href="/settings/profile">
                        <Settings className="size-4" />
                    </a>
                </Button>
                <div className="relative">
                    <button
                        onClick={onProfileMenuToggle}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 transition-colors hover:bg-slate-50"
                    >
                        <div className="flex size-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white">
                            {initials(name)}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-950">
                                {name}
                            </p>
                            <p className="text-xs text-slate-500">Profile</p>
                        </div>
                    </button>

                    {profileMenuOpen && (
                        <div className="absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                            <Button
                                asChild
                                variant="ghost"
                                className="w-full justify-start rounded-none border-b"
                            >
                                <a href="/settings/profile">Edit Profile</a>
                            </Button>
                            <button
                                onClick={onLogout}
                                className="flex w-full items-center gap-2 rounded-b-lg px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-rose-600"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function Field({
    id,
    label,
    className = '',
    ...props
}: {
    id: string;
    label: string;
    className?: string;
} & React.ComponentProps<typeof Input>) {
    return (
        <div className={className}>
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} className="mt-2" {...props} />
        </div>
    );
}

function DataTable({
    id,
    icon: Icon,
    title,
    actionLabel,
    onAction,
    headers,
    children,
}: {
    id: string;
    icon: typeof Users;
    title: string;
    actionLabel?: string;
    onAction?: () => void;
    headers: string[];
    children: React.ReactNode;
}) {
    return (
        <Card
            id={id}
            className="rounded-lg border-slate-200 bg-white shadow-sm"
        >
            <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="size-5 text-blue-600" />
                    {title}
                </CardTitle>
                {actionLabel && (
                    <Button
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        type="button"
                        onClick={onAction}
                    >
                        <Plus className="size-4" />
                        {actionLabel}
                    </Button>
                )}
            </CardHeader>
            <CardContent className="overflow-x-auto px-0">
                <table className="w-full min-w-[720px] text-left text-sm text-slate-600">
                    <thead>
                        <tr className="border-y border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                            {headers.map((header) => (
                                <th key={header} className="px-4 py-3">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>{children}</tbody>
                </table>
            </CardContent>
        </Card>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass(status)}`}
        >
            {status}
        </span>
    );
}

function ProgressStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3">
            <div>
                <p className="text-sm font-medium text-slate-950">{label}</p>
                <p className="mt-1 text-sm text-slate-500">{value}</p>
            </div>
            <CheckCircle2 className="size-5 text-emerald-600" />
        </div>
    );
}

function ReportBarChart({
    title,
    subtitle,
    emptyText,
    items,
}: {
    title: string;
    subtitle: string;
    emptyText: string;
    items: Array<{
        label: string;
        value: string;
        percent: number;
        tone: 'emerald' | 'blue';
    }>;
}) {
    return (
        <div className="rounded-lg border border-slate-200 px-4 py-4">
            <div className="mb-4">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
            </div>

            {items.length ? (
                <div className="grid gap-3">
                    {items.map((item) => (
                        <div key={item.label}>
                            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                                <span className="truncate font-medium text-slate-700">
                                    {item.label}
                                </span>
                                <span className="shrink-0 text-slate-500">
                                    {item.value}
                                </span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className={`h-full rounded-full ${
                                        item.tone === 'emerald'
                                            ? 'bg-emerald-500'
                                            : 'bg-blue-500'
                                    }`}
                                    style={{
                                        width: `${Math.max(item.percent, 4)}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500">{emptyText}</p>
            )}
        </div>
    );
}

function RevenueChart({
    title,
    subtitle,
    items,
}: {
    title: string;
    subtitle: string;
    items: Array<{ date: string; amount: number }>;
}) {
    const maxAmount = Math.max(...items.map((item) => item.amount), 0);

    return (
        <div className="rounded-lg border border-slate-200 px-4 py-4">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-950">
                        {title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
                </div>
                <p className="text-sm font-semibold text-slate-950">
                    {currency(
                        items.reduce((sum, item) => sum + item.amount, 0),
                    )}
                </p>
            </div>

            {items.length ? (
                <div className="flex h-36 items-end gap-3 border-b border-slate-200 pb-2">
                    {items.map((item) => {
                        const height = maxAmount
                            ? Math.max((item.amount / maxAmount) * 100, 8)
                            : 8;

                        return (
                            <div
                                key={`${item.date}-${item.amount}`}
                                className="flex min-w-0 flex-1 flex-col items-center gap-2"
                            >
                                <div
                                    className="w-full max-w-12 rounded-t-md bg-blue-500"
                                    style={{ height: `${height}%` }}
                                    title={`${shortDate(item.date)} - ${currency(item.amount)}`}
                                />
                                <span className="max-w-full truncate text-[11px] text-slate-500">
                                    {shortDate(item.date)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-sm text-slate-500">
                    No payment records yet.
                </p>
            )}
        </div>
    );
}

function ApprovePlanButton({ memberId }: { memberId: number }) {
    const approve = () => {
        router.post(
            `/dashboard/members/${memberId}/approve-plan`,
            {
                action: 'approve',
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <Button
            size="sm"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            type="button"
            onClick={approve}
        >
            Approve
        </Button>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
