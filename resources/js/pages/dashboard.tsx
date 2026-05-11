import { Head, router } from '@inertiajs/react';
import {
    Activity,
    Bell,
    CalendarCheck,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    CreditCard,
    DollarSign,
    Dumbbell,
    Edit3,
    Eye,
    Plus,
    Settings,
    ShieldCheck,
    Trash2,
    UserRound,
    WalletCards,
    Users,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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

interface DashboardProps {
    members?: Member[];
    plans?: Plan[];
    payments?: Payment[];
    attendance?: AttendanceRecord[];
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

export default function Dashboard({
    members = [],
    plans = [],
    payments = [],
    attendance = [],
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

    const metrics = useMemo(() => {
        const activeMembers = memberRows.filter(
            (row) => row.status.toLowerCase() === 'active',
        ).length;
        const presentToday = attendanceRows.filter(
            (row) => row.status.toLowerCase() === 'present',
        ).length;
        const revenue = paymentRows.reduce(
            (sum, row) => sum + (Number(row.amount) || 0),
            0,
        );

        return [
            {
                label: 'Active Members',
                value: activeMembers.toString(),
                detail: `${memberRows.length} total profiles`,
                icon: Users,
            },
            {
                label: 'Plan Catalog',
                value: planRows.length.toString(),
                detail: 'Basic, Standard, Premium',
                icon: ShieldCheck,
            },
            {
                label: 'Attendance Today',
                value: presentToday.toString(),
                detail: `${attendanceRows.length} records logged`,
                icon: CalendarCheck,
            },
            {
                label: 'Payments',
                value: currency(revenue),
                detail: `${paymentRows.length} recent transactions`,
                icon: CreditCard,
            },
        ];
    }, [attendanceRows, memberRows, paymentRows, planRows]);

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
    const completedVisits = 18;
    const plannedVisits = 24;
    const attendancePercent = Math.round(
        (completedVisits / plannedVisits) * 100,
    );

    const openForm = (form: FormType, editId?: number | string) => {
        setActiveForm(form);
        setEditingId(editId ?? null);

        if (!editId) {
            setFormData(defaultFormData[form]);

            return;
        }

        if (form === 'member') {
            const row = memberRows.find((item) => item.id === editId);

            if (row) {
                setFormData({
                    name: row.name,
                    email: row.email,
                    phone: row.phone ?? '',
                    plan: row.plan,
                    status: row.status,
                });
            }
        }

        if (form === 'plan') {
            const row = planRows.find((item) => item.id === editId);

            if (row) {
                setFormData({
                    planName: row.name,
                    duration: row.duration,
                    price: String(row.price),
                    description: row.description ?? '',
                    status: row.status,
                });
            }
        }

        if (form === 'payment') {
            const row = paymentRows.find((item) => item.id === editId);

            if (row) {
                setFormData({
                    member: String(row.member_id),
                    plan: row.plan,
                    amount: String(row.amount),
                    date: row.date ?? row.payment_date ?? '',
                    method: row.method,
                    status: row.status,
                });
            }
        }
    };

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
                <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                    <TopBar
                        title="Admin Dashboard"
                        subtitle="Membership operations, attendance, and revenue"
                        name="admin"
                    />

                    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {metrics.map((item) => (
                            <Card
                                key={item.label}
                                className="rounded-lg border-slate-200 bg-white shadow-sm"
                            >
                                <CardContent className="flex items-center justify-between gap-4 pt-6">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            {item.label}
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-slate-950">
                                            {item.value}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {item.detail}
                                        </p>
                                    </div>
                                    <div className="flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <item.icon className="size-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </section>

                    <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.65fr)]">
                        <div className="space-y-6">
                            <DataTable
                                id="members"
                                icon={Users}
                                title="Members"
                                actionLabel="Add Member"
                                onAction={() => openForm('member')}
                                headers={[
                                    'Member',
                                    'ID',
                                    'Phone',
                                    'Join Date',
                                    'Plan',
                                    'Status',
                                    'Actions',
                                ]}
                            >
                                {memberRows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                    >
                                        <td className="min-w-64 px-4 py-4">
                                            <ProfileCell
                                                name={row.name}
                                                detail={row.email}
                                            />
                                        </td>
                                        <td className="px-4 py-4 font-medium text-slate-950">
                                            #{row.id}
                                        </td>
                                        <td className="px-4 py-4">
                                            {row.phone ?? 'N/A'}
                                        </td>
                                        <td className="px-4 py-4">
                                            {row.join_date ?? 'N/A'}
                                        </td>
                                        <td className="px-4 py-4">
                                            {row.plan}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={row.status} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <RowActions
                                                onView={() => undefined}
                                                onEdit={() =>
                                                    openForm('member', row.id)
                                                }
                                                onDelete={() =>
                                                    setDeleteTarget({
                                                        type: 'member',
                                                        id: row.id,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </DataTable>

                            <DataTable
                                id="attendance"
                                icon={CalendarCheck}
                                title="Attendance"
                                actionLabel="Mark Attendance"
                                onAction={() => openForm('attendance')}
                                headers={[
                                    'Member',
                                    'Check In',
                                    'Check Out',
                                    'Date',
                                    'Status',
                                    'Actions',
                                ]}
                            >
                                {attendanceRows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-4 font-medium text-slate-950">
                                            {row.member}
                                        </td>
                                        <td className="px-4 py-4">
                                            {row.checkIn || '-'}
                                        </td>
                                        <td className="px-4 py-4">
                                            {row.checkOut || '-'}
                                        </td>
                                        <td className="px-4 py-4">
                                            {row.date}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={row.status} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <RowActions
                                                onView={() => undefined}
                                                onEdit={undefined}
                                                onDelete={() =>
                                                    setDeleteTarget({
                                                        type: 'attendance',
                                                        id: row.id,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </DataTable>
                        </div>

                        <div className="space-y-6">
                            <DataTable
                                id="plans"
                                icon={ShieldCheck}
                                title="Plans"
                                actionLabel="Add Plan"
                                onAction={() => openForm('plan')}
                                headers={[
                                    'Plan',
                                    'Duration',
                                    'Price',
                                    'Status',
                                    'Actions',
                                ]}
                            >
                                {planRows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                    >
                                        <td className="min-w-56 px-4 py-4">
                                            <p className="font-medium text-slate-950">
                                                {row.name}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {row.description}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            {row.duration}
                                        </td>
                                        <td className="px-4 py-4 font-medium text-slate-950">
                                            {currency(row.price)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={row.status} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <RowActions
                                                onView={() => undefined}
                                                onEdit={() =>
                                                    openForm('plan', row.id)
                                                }
                                                onDelete={() =>
                                                    setDeleteTarget({
                                                        type: 'plan',
                                                        id: row.id,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </DataTable>

                            <DataTable
                                id="payments"
                                icon={CreditCard}
                                title="Payments"
                                actionLabel="Add Payment"
                                onAction={() => openForm('payment')}
                                headers={[
                                    'Member',
                                    'Plan',
                                    'Amount',
                                    'Method',
                                    'Status',
                                    'Actions',
                                ]}
                            >
                                {paymentRows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-4 font-medium text-slate-950">
                                            {row.member ?? `#${row.member_id}`}
                                        </td>
                                        <td className="px-4 py-4">
                                            {row.plan}
                                        </td>
                                        <td className="px-4 py-4 font-medium text-slate-950">
                                            {currency(row.amount)}
                                        </td>
                                        <td className="px-4 py-4">
                                            {row.method}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={row.status} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <RowActions
                                                onView={() => undefined}
                                                onEdit={() =>
                                                    openForm('payment', row.id)
                                                }
                                                onDelete={() =>
                                                    setDeleteTarget({
                                                        type: 'payment',
                                                        id: row.id,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </DataTable>

                            <Card
                                id="reports"
                                className="rounded-lg border-slate-200 bg-white shadow-sm"
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Activity className="size-5 text-blue-600" />
                                        Reports
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                                    <ProgressStat
                                        label="Attendance Consistency"
                                        value="87%"
                                    />
                                    <ProgressStat
                                        label="Plan Usage"
                                        value="Premium leads"
                                    />
                                    <ProgressStat
                                        label="Payment Health"
                                        value="96% paid"
                                    />
                                </CardContent>
                            </Card>

                            <Card
                                id="settings"
                                className="rounded-lg border-slate-200 bg-white shadow-sm"
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Settings className="size-5 text-blue-600" />
                                        Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild variant="outline">
                                        <a href="/settings/profile">
                                            Open admin settings
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </main>
            ) : (
                <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                    <TopBar
                        title="Dashboard"
                        subtitle="Your membership, billing, and activity"
                        name={currentMember?.name ?? 'Member'}
                    />

                    <section className="mt-6 overflow-hidden rounded-lg border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-indigo-50 px-6 py-8 shadow-sm lg:px-9">
                        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                            <div>
                                <p className="text-sm font-semibold text-violet-700">
                                    Welcome back, {memberFirstName}
                                </p>
                                <h1 className="mt-3 max-w-xl text-3xl font-semibold leading-tight text-slate-950">
                                    Keep going, great things take time.
                                </h1>
                                <p className="mt-4 max-w-lg text-sm text-slate-600">
                                    You're one step closer to your fitness goals.
                                    Track your plan, attendance, payments, and
                                    profile from one place.
                                </p>
                            </div>
                            <HeroIllustration />
                        </div>
                    </section>

                    <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <AccountMetricCard
                            icon={CalendarCheck}
                            title="Membership Plan"
                            value={currentMember?.plan ?? 'No plan yet'}
                            badge={currentMember?.status ?? 'Pending'}
                            tone="violet"
                        />
                        <AccountMetricCard
                            icon={ClipboardList}
                            title="Plan Renew Date"
                            value={
                                latestPayment?.payment_date ??
                                currentMember?.join_date ??
                                'Not scheduled'
                            }
                            detail={
                                currentPlan
                                    ? `${currentPlan.duration} billing cycle`
                                    : 'Choose a plan to start'
                            }
                            tone="blue"
                        />
                        <AccountMetricCard
                            icon={CalendarDays}
                            title="This Month Attendance"
                            value={`${completedVisits} / ${plannedVisits}`}
                            detail={`${attendancePercent}% completed`}
                            progress={attendancePercent}
                            tone="emerald"
                        />
                        <AccountMetricCard
                            icon={DollarSign}
                            title="Outstanding Balance"
                            value={String(currency(outstandingBalance))}
                            badge={outstandingBalance > 0 ? 'Due' : 'Paid'}
                            tone="amber"
                        />
                    </section>

                    <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px_300px]">
                        <MemberPlanDetails
                            currentMember={currentMember}
                            currentPlan={currentPlan}
                            latestPayment={latestPayment}
                        />
                        <AttendanceOverview />
                        <RecentActivity payments={memberPayments} />
                    </section>

                    <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.75fr)]">
                        <DataTable
                            id="payments"
                            icon={CreditCard}
                            title="Payment History"
                            headers={['ID', 'Date', 'Plan', 'Amount', 'Status', 'Method']}
                        >
                            {memberPayments.length ? (
                                memberPayments.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-4 font-medium text-slate-950">
                                            PAY{String(row.id).padStart(3, '0')}
                                        </td>
                                        <td className="px-4 py-4">
                                            {row.payment_date ?? row.date ?? 'N/A'}
                                        </td>
                                        <td className="px-4 py-4">{row.plan}</td>
                                        <td className="px-4 py-4 font-medium text-slate-950">
                                            {currency(row.amount)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={row.status} />
                                        </td>
                                        <td className="px-4 py-4">{row.method}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-sm text-slate-500"
                                    >
                                        No payments yet.
                                    </td>
                                </tr>
                            )}
                        </DataTable>

                        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Zap className="size-5 text-violet-600" />
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 sm:grid-cols-2">
                                <QuickAction
                                    icon={CalendarCheck}
                                    title="Book a Class"
                                    detail="Reserve your spot"
                                    href="/dashboard#attendance-overview"
                                />
                                <QuickAction
                                    icon={CalendarDays}
                                    title="View Schedule"
                                    detail="Check class timings"
                                    href="/dashboard#attendance-overview"
                                />
                                <QuickAction
                                    icon={UserRound}
                                    title="Update Profile"
                                    detail="Manage your details"
                                    href="/settings/profile"
                                />
                                <QuickAction
                                    icon={WalletCards}
                                    title="Payment History"
                                    detail="View your payments"
                                    href="/dashboard#payments"
                                />
                            </CardContent>
                        </Card>
                    </section>
                </main>
            )}
        </>
    );
}

type IconComponent = ComponentType<{ className?: string }>;

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
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}>
                    <Icon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-600">{title}</p>
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
        <Card id="plan-details" className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="size-5 text-violet-600" />
                    My Plan Details
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-[220px_1fr]">
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
                    <Button className="mt-6 w-full bg-violet-600 text-white hover:bg-violet-700">
                        Manage Plan
                    </Button>
                </div>
                <div>
                    <p className="font-semibold text-slate-950">Plan Information</p>
                    <div className="mt-4 divide-y divide-slate-100 text-sm">
                        <InfoRow label="Plan Name" value={currentMember?.plan ?? 'N/A'} />
                        <InfoRow label="Start Date" value={currentMember?.join_date ?? 'N/A'} />
                        <InfoRow label="Renew Date" value={latestPayment?.payment_date ?? 'N/A'} />
                        <InfoRow label="Billing Cycle" value={currentPlan?.duration ?? 'Monthly'} />
                        <InfoRow label="Payment Method" value={latestPayment?.method ?? 'N/A'} />
                    </div>
                    <Button asChild variant="outline" className="mt-5 w-full border-violet-200 text-violet-700 hover:bg-violet-50">
                        <a href="/dashboard#payments">View Plan Details</a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function AttendanceOverview() {
    const days = [
        ['Mon', '29'], ['Tue', '30'], ['Wed', '1'], ['Thu', '2'], ['Fri', '3'], ['Sat', '4'], ['Sun', '5'],
        ['Mon', '6'], ['Tue', '7'], ['Wed', '8'], ['Thu', '9'], ['Fri', '10'], ['Sat', '11'], ['Sun', '12'],
        ['Mon', '13'], ['Tue', '14'], ['Wed', '15'], ['Thu', '16'], ['Fri', '17'], ['Sat', '18'], ['Sun', '19'],
        ['Mon', '20'], ['Tue', '21'], ['Wed', '22'], ['Thu', '23'], ['Fri', '24'], ['Sat', '25'], ['Sun', '26'],
    ];

    return (
        <Card id="attendance-overview" className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarDays className="size-5 text-violet-600" />
                    Attendance Overview
                </CardTitle>
                <Button variant="outline" size="sm">This Month</Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    {days.map(([day, date], index) => (
                        <CalendarDot key={`${day}-${date}-${index}`} date={date} index={index} />
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
        <Card id="recent-activity" className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="size-5 text-violet-600" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                {!activities.length && (
                    <p className="text-sm text-slate-500">No recent payment activity.</p>
                )}
                <Button asChild variant="link" className="px-0 text-violet-700">
                    <a href="/dashboard#payments">View all activity</a>
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
                    <span className="block font-semibold text-slate-950">{title}</span>
                    <span className="mt-1 block text-sm text-slate-500">{detail}</span>
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
        <div className="flex gap-3">
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${toneClass}`}>
                <Icon className="size-4" />
            </span>
            <span>
                <span className="block text-sm font-semibold text-slate-950">
                    {title}
                </span>
                <span className="text-sm text-slate-500">{detail}</span>
            </span>
        </div>
    );
}

function CalendarDot({ date, index }: { date: string; index: number }) {
    const isPresent = [7, 8, 9, 10, 11, 12, 14, 15, 22, 23, 24].includes(index);
    const isAbsent = index === 20;
    const isSelected = index === 21;
    const color = isSelected
        ? 'bg-violet-600 text-white ring-violet-200'
        : isAbsent
          ? 'bg-rose-50 text-rose-600 ring-rose-100'
          : isPresent
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
            : 'bg-white text-slate-700 ring-transparent';

    return (
        <span className={`grid size-9 place-items-center rounded-full text-sm font-medium ring-2 ${color}`}>
            {date}
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
        <div className="flex justify-between gap-4 py-3">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-950">{value}</span>
        </div>
    );
}

function TopBar({
    title,
    subtitle,
    name,
}: {
    title: string;
    subtitle: string;
    name: string;
}) {
    return (
        <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
                <p className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <Dumbbell className="size-4" />
                    GymFit Manager
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                    {title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Notifications"
                >
                    <Bell className="size-4" />
                </Button>
                <Button asChild variant="outline" size="icon" aria-label="Settings">
                    <a href="/settings/profile">
                        <Settings className="size-4" />
                    </a>
                </Button>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white">
                        {initials(name)}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">
                            {name}
                        </p>
                        <p className="text-xs text-slate-500">Profile</p>
                    </div>
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

function ProfileCell({ name, detail }: { name: string; detail: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
                {initials(name)}
            </div>
            <div>
                <p className="font-medium text-slate-950">{name}</p>
                <p className="text-sm text-slate-500">{detail}</p>
            </div>
        </div>
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

function RowActions({
    onView,
    onEdit,
    onDelete,
}: {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}) {
    return (
        <div className="flex justify-end gap-1 text-slate-500">
            {onView && (
                <IconButton label="View" onClick={onView}>
                    <Eye className="size-4" />
                </IconButton>
            )}
            {onEdit && (
                <IconButton label="Edit" onClick={onEdit}>
                    <Edit3 className="size-4" />
                </IconButton>
            )}
            {onDelete && (
                <IconButton
                    label="Delete"
                    onClick={onDelete}
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                    <Trash2 className="size-4" />
                </IconButton>
            )}
        </div>
    );
}

function IconButton({
    label,
    className = '',
    children,
    onClick,
}: {
    label: string;
    className?: string;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={`inline-flex size-8 items-center justify-center rounded-lg transition hover:bg-slate-100 hover:text-slate-950 ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
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

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
