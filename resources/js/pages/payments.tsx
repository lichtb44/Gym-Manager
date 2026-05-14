import { Head, Link, router } from '@inertiajs/react';
import {
    CreditCard,
    DollarSign,
    Dumbbell,
    ReceiptText,
    WalletCards,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Member {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    plan: string;
    plan_started_at?: string | null;
    status: string;
    join_date?: string | null;
}

interface Plan {
    id: number;
    name: string;
    duration: string;
    price: string | number;
    description?: string | null;
    status: string;
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
}

interface PaymentsProps {
    member?: Member;
    currentPlan?: Plan | null;
    payments?: Payment[];
}

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

const statusClass = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === 'paid') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    }

    if (['due', 'overdue', 'failed', 'unpaid'].includes(normalized)) {
        return 'bg-rose-50 text-rose-700 ring-rose-100';
    }

    return 'bg-amber-50 text-amber-700 ring-amber-100';
};

export default function Payments({
    member,
    currentPlan,
    payments = [],
}: PaymentsProps) {
    const paidPayments = payments.filter(
        (payment) => payment.status.toLowerCase() === 'paid',
    );
    const pendingPayments = payments.filter(
        (payment) => payment.status.toLowerCase() !== 'paid',
    );
    const totalPaid = paidPayments.reduce(
        (sum, payment) => sum + (Number(payment.amount) || 0),
        0,
    );
    const outstanding = pendingPayments.reduce(
        (sum, payment) => sum + (Number(payment.amount) || 0),
        0,
    );
    const latestPayment = payments[0];
    const canPay =
        Boolean(member) &&
        Boolean(currentPlan) &&
        member?.status !== 'Pending' &&
        member?.plan !== 'No plan yet';

    const submitPayment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(
            '/payments',
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="Payments" />

            <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <p className="flex items-center gap-2 text-sm font-medium text-violet-600">
                            <Dumbbell className="size-4" />
                            GymFit Manager
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                            Payments
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            View your payment history and membership billing
                            status.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                </header>

                <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        icon={DollarSign}
                        title="Total Paid"
                        value={currency(totalPaid)}
                        detail={`${paidPayments.length} paid transactions`}
                    />
                    <MetricCard
                        icon={WalletCards}
                        title="Outstanding"
                        value={currency(outstanding)}
                        detail={
                            pendingPayments.length
                                ? `${pendingPayments.length} pending records`
                                : 'No pending balance'
                        }
                    />
                    <MetricCard
                        icon={CreditCard}
                        title="Current Plan"
                        value={member?.plan ?? 'No plan'}
                        detail={member?.status ?? 'Pending'}
                    />
                    <MetricCard
                        icon={ReceiptText}
                        title="Latest Payment"
                        value={
                            latestPayment
                                ? currency(latestPayment.amount)
                                : 'N/A'
                        }
                        detail={
                            latestPayment?.payment_date ?? 'No payments yet'
                        }
                    />
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <Card className="rounded-lg border-slate-200 bg-white shadow-sm xl:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CreditCard className="size-5 text-violet-600" />
                                Billing Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border border-violet-100 bg-violet-50 px-4 py-5">
                                <p className="text-sm font-medium text-violet-700">
                                    Member
                                </p>
                                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                                    {member?.name ?? 'Member'}
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    {member?.email ?? 'No email'}
                                </p>
                            </div>

                            <div className="mt-5 divide-y divide-slate-100 text-sm">
                                <InfoRow
                                    label="Plan"
                                    value={member?.plan ?? 'No plan'}
                                />
                                <InfoRow
                                    label="Status"
                                    value={member?.status ?? 'Pending'}
                                />
                                <InfoRow
                                    label="Started"
                                    value={
                                        member?.plan_started_at ??
                                        member?.join_date ??
                                        'Not started'
                                    }
                                />
                                <InfoRow
                                    label="Last Method"
                                    value={latestPayment?.method ?? 'N/A'}
                                />
                            </div>

                            <Button
                                asChild
                                className="mt-5 w-full bg-violet-600 text-white hover:bg-violet-700"
                            >
                                <Link href="/my-plan">Manage Plan</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <WalletCards className="size-5 text-violet-600" />
                                Send Payment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border border-slate-200 px-4 py-4">
                                <InfoRow
                                    label="Plan"
                                    value={member?.plan ?? 'No active plan'}
                                />
                                <InfoRow
                                    label="Amount"
                                    value={
                                        currentPlan
                                            ? String(
                                                  currency(currentPlan.price),
                                              )
                                            : 'N/A'
                                    }
                                />
                            </div>

                            <form className="mt-5" onSubmit={submitPayment}>
                                <Button
                                    type="submit"
                                    disabled={!canPay}
                                    className="w-full bg-violet-600 text-white hover:bg-violet-700"
                                >
                                    Pay with Stripe
                                </Button>
                                {!canPay && (
                                    <p className="text-sm text-slate-500">
                                        Activate a plan before sending payment.
                                    </p>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ReceiptText className="size-5 text-violet-600" />
                                Payment History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="min-h-[360px] overflow-x-auto px-0">
                            <table className="w-full min-w-[760px] text-left text-sm text-slate-600">
                                <thead>
                                    <tr className="border-y border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Plan</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Method</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.length ? (
                                        payments.map((payment) => (
                                            <tr
                                                key={payment.id}
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >
                                                <td className="px-4 py-4 font-medium text-slate-950">
                                                    PAY
                                                    {String(
                                                        payment.id,
                                                    ).padStart(3, '0')}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {payment.payment_date ??
                                                        'N/A'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {payment.plan}
                                                </td>
                                                <td className="px-4 py-4 font-medium text-slate-950">
                                                    {currency(payment.amount)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {payment.method}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge
                                                        status={payment.status}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-10 text-center text-sm text-slate-500"
                                            >
                                                No payment history yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </section>
            </main>
        </>
    );
}

function MetricCard({
    icon: Icon,
    title,
    value,
    detail,
}: {
    icon: typeof CreditCard;
    title: string;
    value: string | number;
    detail: string;
}) {
    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center justify-between gap-4 pt-6">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {value}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{detail}</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <Icon className="size-5" />
                </div>
            </CardContent>
        </Card>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 py-3">
            <span className="text-slate-500">{label}</span>
            <span className="text-right font-medium text-slate-950">
                {value}
            </span>
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

Payments.layout = {
    breadcrumbs: [
        {
            title: 'Payments',
            href: '/payments',
        },
    ],
};
