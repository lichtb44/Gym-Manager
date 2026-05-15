import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    CreditCard,
    Pencil,
    Plus,
    ReceiptText,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Member {
    id: number;
    name: string;
    plan: string;
}

interface Plan {
    id: number;
    name: string;
    price: string | number;
}

interface Payment {
    id: number;
    member?: string;
    member_id: number;
    plan: string;
    amount: string | number;
    payment_date?: string | null;
    method: string;
    status: string;
    created_at?: string | null;
}

const emptyForm = {
    member: '',
    plan: '',
    amount: '',
    date: '',
    method: 'Cash',
    status: 'Paid',
};

const currency = (value: string | number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(Number(value) || 0);

const statusClass = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === 'paid') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    }

    if (normalized === 'pending confirmation') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    return 'bg-slate-50 text-slate-700 ring-slate-100';
};

export default function AdminPayments({
    payments = [],
    members = [],
    plans = [],
}: {
    payments?: Payment[];
    members?: Member[];
    plans?: Plan[];
}) {
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);

    const totalPaid = payments
        .filter((payment) => payment.status.toLowerCase() === 'paid')
        .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    const pendingCount = payments.filter(
        (payment) => payment.status.toLowerCase() === 'pending confirmation',
    ).length;

    const startAdd = () => {
        setEditingId(null);
        setForm({
            ...emptyForm,
            member: members[0] ? String(members[0].id) : '',
            plan: plans[0]?.name ?? '',
            amount: plans[0] ? String(plans[0].price) : '',
        });
        setOpen(true);
    };

    const startEdit = (payment: Payment) => {
        setEditingId(payment.id);
        setForm({
            member: String(payment.member_id),
            plan: payment.plan,
            amount: String(payment.amount),
            date: payment.payment_date ?? '',
            method: payment.method,
            status: payment.status,
        });
        setOpen(true);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(
            editingId
                ? `/dashboard/payments/${editingId}`
                : '/dashboard/payments',
            {
                ...form,
                ...(editingId ? { _method: 'PUT' } : {}),
            },
            {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            },
        );
    };

    const confirmPayment = (id: number) => {
        router.post(
            `/dashboard/payments/${id}/confirm`,
            {},
            { preserveScroll: true },
        );
    };

    const remove = (id: number) => {
        router.post(
            `/dashboard/payments/${id}`,
            { _method: 'DELETE' },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Payments" />

            <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="flex items-center gap-2 text-sm font-medium text-blue-600">
                            <CreditCard className="size-4" />
                            Payment Management
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                            Payments
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Review transactions and confirm member payments.
                        </p>
                    </div>
                    <Button
                        type="button"
                        onClick={startAdd}
                        className="mt-4 bg-blue-600 text-white hover:bg-blue-700 sm:mt-0"
                    >
                        <Plus className="size-4" />
                        Add Payment
                    </Button>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-3">
                    <Metric label="Total Collected" value={currency(totalPaid)} />
                    <Metric label="Payment Records" value={payments.length} />
                    <Metric label="Needs Confirmation" value={pendingCount} />
                </section>

                <Card className="mt-6 rounded-lg border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ReceiptText className="size-5 text-blue-600" />
                            Payment History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto px-0">
                        <table className="w-full min-w-[960px] text-left text-sm text-slate-600">
                            <thead>
                                <tr className="border-y border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                                    <th className="px-5 py-3">Payment</th>
                                    <th className="px-5 py-3">Member</th>
                                    <th className="px-5 py-3">Plan</th>
                                    <th className="px-5 py-3">Amount</th>
                                    <th className="px-5 py-3">Method</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr
                                        key={payment.id}
                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-950">
                                                PAY
                                                {String(payment.id).padStart(
                                                    3,
                                                    '0',
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {payment.payment_date ??
                                                    payment.created_at ??
                                                    'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 font-medium text-slate-950">
                                            {payment.member ??
                                                `#${payment.member_id}`}
                                        </td>
                                        <td className="px-5 py-4">
                                            {payment.plan}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-slate-950">
                                            {currency(payment.amount)}
                                        </td>
                                        <td className="px-5 py-4">
                                            {payment.method}
                                        </td>
                                        <td className="px-5 py-4">
                                            <Status status={payment.status} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                {payment.status.toLowerCase() ===
                                                    'pending confirmation' && (
                                                    <IconButton
                                                        label="Confirm"
                                                        success
                                                        onClick={() =>
                                                            confirmPayment(
                                                                payment.id,
                                                            )
                                                        }
                                                    >
                                                        <CheckCircle2 className="size-4" />
                                                    </IconButton>
                                                )}
                                                <IconButton
                                                    label="Edit"
                                                    onClick={() =>
                                                        startEdit(payment)
                                                    }
                                                >
                                                    <Pencil className="size-4" />
                                                </IconButton>
                                                <IconButton
                                                    label="Delete"
                                                    danger
                                                    onClick={() =>
                                                        remove(payment.id)
                                                    }
                                                >
                                                    <Trash2 className="size-4" />
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-2xl rounded-lg">
                        <DialogHeader>
                            <DialogTitle>
                                {editingId ? 'Edit Payment' : 'Add Payment'}
                            </DialogTitle>
                        </DialogHeader>
                        <form className="grid gap-4" onSubmit={submit}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <SelectField
                                    id="member"
                                    label="Member"
                                    value={form.member}
                                    options={members.map((member) => ({
                                        value: String(member.id),
                                        label: member.name,
                                    }))}
                                    onChange={(value) =>
                                        setForm({ ...form, member: value })
                                    }
                                />
                                <SelectField
                                    id="plan"
                                    label="Plan"
                                    value={form.plan}
                                    options={plans.map((plan) => ({
                                        value: plan.name,
                                        label: plan.name,
                                    }))}
                                    onChange={(value) => {
                                        const plan = plans.find(
                                            (item) => item.name === value,
                                        );

                                        setForm({
                                            ...form,
                                            plan: value,
                                            amount: plan
                                                ? String(plan.price)
                                                : form.amount,
                                        });
                                    }}
                                />
                                <Field
                                    id="amount"
                                    label="Amount"
                                    type="number"
                                    value={form.amount}
                                    onChange={(value) =>
                                        setForm({ ...form, amount: value })
                                    }
                                />
                                <Field
                                    id="date"
                                    label="Payment Date"
                                    type="date"
                                    value={form.date}
                                    onChange={(value) =>
                                        setForm({ ...form, date: value })
                                    }
                                />
                                <Field
                                    id="method"
                                    label="Method"
                                    value={form.method}
                                    onChange={(value) =>
                                        setForm({ ...form, method: value })
                                    }
                                />
                                <Field
                                    id="status"
                                    label="Status"
                                    value={form.status}
                                    onChange={(value) =>
                                        setForm({ ...form, status: value })
                                    }
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                                    Save Payment
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
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

function Field({
    id,
    label,
    value,
    onChange,
    type = 'text',
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
}) {
    return (
        <div>
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                value={value}
                className="mt-2"
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}

function SelectField({
    id,
    label,
    value,
    options,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <Label htmlFor={id}>{label}</Label>
            <select
                id={id}
                value={value}
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                onChange={(event) => onChange(event.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
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

function IconButton({
    label,
    children,
    onClick,
    danger = false,
    success = false,
}: {
    label: string;
    children: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
    success?: boolean;
}) {
    const color = success
        ? 'text-emerald-600 hover:bg-emerald-50'
        : danger
          ? 'text-rose-600 hover:bg-rose-50'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950';

    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className={`inline-flex size-8 items-center justify-center rounded-lg transition ${color}`}
        >
            {children}
        </button>
    );
}
