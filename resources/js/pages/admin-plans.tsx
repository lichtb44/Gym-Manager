import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Layers, Plus, Trash2, Pencil } from 'lucide-react';
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

interface Plan {
    id: number;
    name: string;
    duration: string;
    price: string | number;
    description?: string | null;
    status: string;
}

const emptyForm = {
    planName: '',
    duration: '1 Month',
    price: '',
    description: '',
    status: 'Active',
};

const currency = (value: string | number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(Number(value) || 0);

export default function AdminPlans({ plans = [] }: { plans?: Plan[] }) {
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);

    const activePlans = plans.filter(
        (plan) => plan.status.toLowerCase() === 'active',
    ).length;

    const startAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setOpen(true);
    };

    const startEdit = (plan: Plan) => {
        setEditingId(plan.id);
        setForm({
            planName: plan.name,
            duration: plan.duration,
            price: String(plan.price),
            description: plan.description ?? '',
            status: plan.status,
        });
        setOpen(true);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(
            editingId ? `/dashboard/plans/${editingId}` : '/dashboard/plans',
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

    const remove = (id: number) => {
        router.post(
            `/dashboard/plans/${id}`,
            { _method: 'DELETE' },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Plans" />

            <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="flex items-center gap-2 text-sm font-medium text-blue-600">
                            <Layers className="size-4" />
                            Plan Management
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                            Plans
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Maintain the membership plans shown to members.
                        </p>
                    </div>
                    <Button
                        type="button"
                        onClick={startAdd}
                        className="mt-4 bg-blue-600 text-white hover:bg-blue-700 sm:mt-0"
                    >
                        <Plus className="size-4" />
                        Add Plan
                    </Button>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-3">
                    <Metric label="Total Plans" value={plans.length} />
                    <Metric label="Active Plans" value={activePlans} />
                    <Metric
                        label="Highest Price"
                        value={
                            plans.length
                                ? currency(
                                      Math.max(
                                          ...plans.map(
                                              (plan) => Number(plan.price) || 0,
                                          ),
                                      ),
                                  )
                                : currency(0)
                        }
                    />
                </section>

                <Card className="mt-6 rounded-lg border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Layers className="size-5 text-blue-600" />
                            Plan Catalog
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto px-0">
                        <table className="w-full min-w-[840px] text-left text-sm text-slate-600">
                            <thead>
                                <tr className="border-y border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                                    <th className="px-5 py-3">Plan</th>
                                    <th className="px-5 py-3">Duration</th>
                                    <th className="px-5 py-3">Price</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {plans.map((plan) => (
                                    <tr
                                        key={plan.id}
                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-950">
                                                {plan.name}
                                            </p>
                                            <p className="mt-1 max-w-xl text-slate-500">
                                                {plan.description}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            {plan.duration}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-slate-950">
                                            {currency(plan.price)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <Status status={plan.status} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <IconButton
                                                    label="Edit"
                                                    onClick={() =>
                                                        startEdit(plan)
                                                    }
                                                >
                                                    <Pencil className="size-4" />
                                                </IconButton>
                                                <IconButton
                                                    label="Delete"
                                                    danger
                                                    onClick={() =>
                                                        remove(plan.id)
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
                                {editingId ? 'Edit Plan' : 'Add Plan'}
                            </DialogTitle>
                        </DialogHeader>
                        <form className="grid gap-4" onSubmit={submit}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    id="planName"
                                    label="Plan Name"
                                    value={form.planName}
                                    onChange={(value) =>
                                        setForm({ ...form, planName: value })
                                    }
                                />
                                <Field
                                    id="duration"
                                    label="Duration"
                                    value={form.duration}
                                    onChange={(value) =>
                                        setForm({ ...form, duration: value })
                                    }
                                />
                                <Field
                                    id="price"
                                    label="Price"
                                    type="number"
                                    value={form.price}
                                    onChange={(value) =>
                                        setForm({ ...form, price: value })
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
                                <Field
                                    id="description"
                                    label="Description"
                                    value={form.description}
                                    className="sm:col-span-2"
                                    onChange={(value) =>
                                        setForm({
                                            ...form,
                                            description: value,
                                        })
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
                                    Save Plan
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
            <CardContent className="flex items-center justify-between gap-4 pt-6">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {value}
                    </p>
                </div>
                <CheckCircle2 className="size-5 text-blue-600" />
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
    className = '',
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    className?: string;
}) {
    return (
        <div className={className}>
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

function Status({ status }: { status: string }) {
    return (
        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            {status}
        </span>
    );
}

function IconButton({
    label,
    children,
    onClick,
    danger = false,
}: {
    label: string;
    children: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className={`inline-flex size-8 items-center justify-center rounded-lg transition ${
                danger
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
        >
            {children}
        </button>
    );
}
