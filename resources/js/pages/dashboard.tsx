import { Head, router } from '@inertiajs/react';
import {
    Activity,
    Bell,
    CalendarCheck,
    CheckCircle2,
    CreditCard,
    Dumbbell,
    Edit3,
    Eye,
    Plus,
    Settings,
    ShieldCheck,
    Trash2,
    UserRound,
    Users,
} from 'lucide-react';
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
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

const sampleMembers: Member[] = [
    {
        id: 1,
        name: 'Avery Johnson',
        email: 'avery@example.com',
        phone: '+1 415 555 0198',
        plan: 'Premium',
        status: 'Active',
        join_date: 'May 1, 2026',
    },
    {
        id: 2,
        name: 'Mia Chen',
        email: 'mia@example.com',
        phone: '+1 415 555 0124',
        plan: 'Standard',
        status: 'Active',
        join_date: 'Apr 18, 2026',
    },
    {
        id: 3,
        name: 'Noah Smith',
        email: 'noah@example.com',
        phone: '+1 415 555 0141',
        plan: 'Basic',
        status: 'Inactive',
        join_date: 'Mar 9, 2026',
    },
];

const samplePlans: Plan[] = [
    {
        id: 1,
        name: 'Basic',
        duration: '1 Month',
        price: 29.99,
        description: 'Gym floor access during standard staffed hours.',
        status: 'Active',
    },
    {
        id: 2,
        name: 'Standard',
        duration: '1 Month',
        price: 49.99,
        description: 'Gym access, group classes, and locker use.',
        status: 'Active',
    },
    {
        id: 3,
        name: 'Premium',
        duration: '1 Month',
        price: 79.99,
        description: 'Full facility access with recovery area and coaching.',
        status: 'Active',
    },
];

const sampleAttendance: AttendanceRecord[] = [
    {
        id: 1,
        member: 'Avery Johnson',
        checkIn: '07:15 AM',
        checkOut: '08:35 AM',
        date: 'May 11, 2026',
        status: 'Present',
    },
    {
        id: 2,
        member: 'Mia Chen',
        checkIn: '06:40 PM',
        checkOut: '07:55 PM',
        date: 'May 11, 2026',
        status: 'Present',
    },
    {
        id: 3,
        member: 'Noah Smith',
        checkIn: '',
        checkOut: '',
        date: 'May 11, 2026',
        status: 'Absent',
    },
];

const samplePayments: Payment[] = [
    {
        id: 1,
        member: 'Avery Johnson',
        member_id: 1,
        plan: 'Premium',
        amount: 79.99,
        payment_date: 'May 1, 2026',
        method: 'Credit Card',
        status: 'Paid',
    },
    {
        id: 2,
        member: 'Mia Chen',
        member_id: 2,
        plan: 'Standard',
        amount: 49.99,
        payment_date: 'Apr 18, 2026',
        method: 'UPI',
        status: 'Paid',
    },
];

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
    const memberRows = members.length ? members : sampleMembers;
    const planRows = plans.length ? plans : samplePlans;
    const paymentRows = payments.length ? payments : samplePayments;
    const attendanceRows = attendance.length ? attendance : sampleAttendance;
    const currentMember = member ?? memberRows[0];

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
    const remainingDays = currentMember?.status === 'Active' ? 22 : 0;

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
                        name="Admin"
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
                        </div>
                    </section>
                </main>
            ) : (
                <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                    <TopBar
                        title="My Membership"
                        subtitle="Plan status, attendance, and billing"
                        name={currentMember?.name ?? 'Member'}
                    />

                    <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                            <CardContent className="grid gap-6 pt-6 md:grid-cols-[auto_1fr]">
                                <div className="flex size-24 items-center justify-center rounded-lg bg-blue-600 text-2xl font-semibold text-white">
                                    {initials(currentMember?.name)}
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-2xl font-semibold text-slate-950">
                                            {currentMember?.name ?? 'Member'}
                                        </h1>
                                        <StatusBadge
                                            status={
                                                currentMember?.status ??
                                                'Active'
                                            }
                                        />
                                    </div>
                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <InfoItem
                                            label="Email"
                                            value={
                                                currentMember?.email ?? 'N/A'
                                            }
                                        />
                                        <InfoItem
                                            label="Phone"
                                            value={
                                                currentMember?.phone ?? 'N/A'
                                            }
                                        />
                                        <InfoItem
                                            label="Membership Plan"
                                            value={
                                                currentMember?.plan ?? 'Basic'
                                            }
                                        />
                                        <InfoItem
                                            label="Remaining Days"
                                            value={`${remainingDays} days`}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                            <CardContent className="grid h-full gap-3 pt-6 sm:grid-cols-3 lg:grid-cols-1">
                                <Shortcut
                                    icon={CalendarCheck}
                                    label="Check In"
                                />
                                <Shortcut
                                    icon={CreditCard}
                                    label="Renew Plan"
                                />
                                <Shortcut
                                    icon={UserRound}
                                    label="Update Profile"
                                />
                            </CardContent>
                        </Card>
                    </section>

                    <section className="mt-6 grid gap-6 xl:grid-cols-2">
                        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Activity className="size-5 text-blue-600" />
                                    Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <ProgressStat
                                    label="Attendance Consistency"
                                    value="14 visits this month"
                                />
                                <ProgressStat
                                    label="Plan Usage"
                                    value={`${currentMember?.plan ?? 'Basic'} member`}
                                />
                                <ProgressStat
                                    label="Membership Status"
                                    value={`${remainingDays} days remaining`}
                                />
                            </CardContent>
                        </Card>

                        <DataTable
                            id="payments"
                            icon={CreditCard}
                            title="Payment History"
                            headers={[
                                'Plan',
                                'Amount',
                                'Date',
                                'Method',
                                'Status',
                            ]}
                        >
                            {(memberPayments.length
                                ? memberPayments
                                : paymentRows.slice(0, 2)
                            ).map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                >
                                    <td className="px-4 py-4">{row.plan}</td>
                                    <td className="px-4 py-4 font-medium text-slate-950">
                                        {currency(row.amount)}
                                    </td>
                                    <td className="px-4 py-4">
                                        {row.payment_date ?? row.date ?? 'N/A'}
                                    </td>
                                    <td className="px-4 py-4">{row.method}</td>
                                    <td className="px-4 py-4">
                                        <StatusBadge status={row.status} />
                                    </td>
                                </tr>
                            ))}
                        </DataTable>
                    </section>
                </main>
            )}
        </>
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
                <Button variant="outline" size="icon" aria-label="Settings">
                    <Settings className="size-4" />
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

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 font-semibold text-slate-950">{value}</p>
        </div>
    );
}

function Shortcut({
    icon: Icon,
    label,
}: {
    icon: typeof CalendarCheck;
    label: string;
}) {
    return (
        <button
            type="button"
            className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
        >
            <span className="flex size-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Icon className="size-5" />
            </span>
            <span className="font-semibold text-slate-950">{label}</span>
        </button>
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
