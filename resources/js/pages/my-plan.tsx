import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    Dumbbell,
    ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Member {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    plan: string;
    pending_plan?: string | null;
    plan_status?: string | null;
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
    member_id: number;
    plan: string;
    amount: string | number;
    payment_date?: string | null;
    method: string;
    status: string;
}

interface MyPlanProps {
    member?: Member;
    plans?: Plan[];
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

    if (['active', 'paid'].includes(normalized)) {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    }

    if (['pending', 'overdue', 'failed'].includes(normalized)) {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    return 'bg-slate-50 text-slate-700 ring-slate-100';
};

export default function MyPlan({
    member,
    plans = [],
    payments = [],
}: MyPlanProps) {
    const currentPlan = plans.find((plan) => plan.name === member?.plan);
    const latestPayment = payments[0];
    const planStartedAt = member?.plan_started_at ?? member?.join_date;
    const pendingPlan = member?.pending_plan ?? null;
    const hasPendingPlan = member?.plan_status === 'pending' && pendingPlan;
    const hasActivePlan =
        Boolean(member?.plan) &&
        member?.plan !== 'No plan yet' &&
        member?.status !== 'Pending';

    const selectPlan = (planName: string) => {
        if (member?.plan === planName || pendingPlan === planName) {
            return;
        }

        router.post(
            '/dashboard/select-plan',
            { plan: planName },
            {
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="My Plan" />

            <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <p className="flex items-center gap-2 text-sm font-medium text-violet-600">
                            <Dumbbell className="size-4" />
                            FitCore Manager
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                            My Plan
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Review your membership and choose the plan that fits
                            your training.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                </header>

                <section className="mt-6 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                    <div className="space-y-6">
                        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ShieldCheck className="size-5 text-violet-600" />
                                    Current Membership
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border border-violet-100 bg-violet-50 px-4 py-5">
                                    <p className="text-sm font-medium text-violet-700">
                                        Active Plan
                                    </p>
                                    <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                                        {member?.plan ?? 'No plan yet'}
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {currentPlan?.description ??
                                            'Choose a plan to start attendance tracking.'}
                                    </p>
                                </div>

                                {hasPendingPlan && (
                                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                        <p className="font-semibold">
                                            Plan change pending approval
                                        </p>
                                        <p className="mt-1">
                                            Your request to switch to{' '}
                                            <span className="font-semibold">
                                                {pendingPlan}
                                            </span>{' '}
                                            is waiting for admin approval.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-5 divide-y divide-slate-100 text-sm">
                                    <InfoRow
                                        label="Status"
                                        value={member?.status ?? 'Pending'}
                                        badge
                                    />
                                    <InfoRow
                                        label="Started"
                                        value={planStartedAt ?? 'Not started'}
                                    />
                                    <InfoRow
                                        label="Billing Cycle"
                                        value={currentPlan?.duration ?? 'N/A'}
                                    />
                                    <InfoRow
                                        label="Requested Plan"
                                        value={
                                            hasPendingPlan
                                                ? `${pendingPlan} (Pending)`
                                                : 'None'
                                        }
                                    />
                                    <InfoRow
                                        label="Latest Payment"
                                        value={
                                            latestPayment
                                                ? `${currency(latestPayment.amount)} on ${latestPayment.payment_date ?? 'N/A'}`
                                                : 'No payments yet'
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <CalendarDays className="size-5 text-violet-600" />
                                    Plan Start Rule
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-slate-600">
                                <p>
                                    Attendance starts only when the selected
                                    plan becomes active. If approval is enabled,
                                    the timer starts after admin approval.
                                </p>
                                <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-700">
                                    Current start:{' '}
                                    <span className="font-semibold">
                                        {planStartedAt ?? 'Waiting for plan'}
                                    </span>
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <section>
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-950">
                                    Available Plans
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {hasActivePlan
                                        ? 'Request a plan change here instead of from the dashboard.'
                                        : 'Choose your plan here instead of from the dashboard.'}
                                </p>
                            </div>
                            <span className="text-sm text-slate-500">
                                {plans.length} plans
                            </span>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            {plans.map((plan) => {
                                const isCurrent = member?.plan === plan.name;
                                const isPending = pendingPlan === plan.name;
                                const actionLabel = hasActivePlan
                                    ? 'Request Change Plan'
                                    : 'Choose Plan';

                                return (
                                    <Card
                                        key={plan.id}
                                        className={`rounded-lg border bg-white shadow-sm ${
                                            isCurrent
                                                ? 'border-violet-300 ring-2 ring-violet-100'
                                                : 'border-slate-200'
                                        }`}
                                    >
                                        <CardContent className="flex h-full flex-col pt-6">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-violet-600">
                                                        {plan.duration}
                                                    </p>
                                                    <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                                                        {plan.name}
                                                    </h3>
                                                </div>
                                                {isCurrent && (
                                                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                                        Current
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-5 flex items-end gap-1">
                                                <span className="text-3xl font-semibold text-slate-950">
                                                    {currency(plan.price)}
                                                </span>
                                                <span className="pb-1 text-sm text-slate-500">
                                                    / cycle
                                                </span>
                                            </div>

                                            <p className="mt-4 min-h-16 text-sm text-slate-600">
                                                {plan.description ??
                                                    'Membership access for your selected training level.'}
                                            </p>

                                            <div className="mt-5 space-y-2 text-sm text-slate-600">
                                                <Feature text="Attendance starts after activation" />
                                                <Feature text="Payment history stays linked" />
                                                <Feature text="Dashboard updates automatically" />
                                            </div>

                                            <Button
                                                type="button"
                                                disabled={
                                                    isCurrent || isPending
                                                }
                                                className={`mt-6 w-full ${
                                                    isCurrent || isPending
                                                        ? isPending
                                                            ? 'bg-amber-600 text-white hover:bg-amber-600'
                                                            : 'bg-emerald-600 text-white hover:bg-emerald-600'
                                                        : 'bg-violet-600 text-white hover:bg-violet-700'
                                                }`}
                                                onClick={() =>
                                                    selectPlan(plan.name)
                                                }
                                            >
                                                {isCurrent
                                                    ? 'Current Plan'
                                                    : isPending
                                                      ? 'Pending Approval'
                                                      : actionLabel}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {!plans.length && (
                            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                                <CardContent className="py-10 text-center text-sm text-slate-500">
                                    No active plans are available yet.
                                </CardContent>
                            </Card>
                        )}
                    </section>
                </section>
            </main>
        </>
    );
}

function InfoRow({
    label,
    value,
    badge = false,
}: {
    label: string;
    value: string;
    badge?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <span className="text-slate-500">{label}</span>
            {badge ? (
                <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass(value)}`}
                >
                    {value}
                </span>
            ) : (
                <span className="text-right font-medium text-slate-950">
                    {value}
                </span>
            )}
        </div>
    );
}

function Feature({ text }: { text: string }) {
    return (
        <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            {text}
        </p>
    );
}

MyPlan.layout = {
    breadcrumbs: [
        {
            title: 'My Plan',
            href: '/my-plan',
        },
    ],
};
