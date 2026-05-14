import { Head, Link } from '@inertiajs/react';
import {
    CalendarCheck,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Dumbbell,
    XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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

interface AttendanceRecord {
    id: number | string;
    member: string;
    member_id?: number;
    checkIn?: string;
    checkOut?: string;
    date: string;
    status: string;
}

interface AttendanceProps {
    member?: Member;
    attendance?: AttendanceRecord[];
}

const parseDate = (value?: string | null) => {
    if (!value) {
        return null;
    }

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

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

export default function Attendance({
    member,
    attendance = [],
}: AttendanceProps) {
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
    const monthAttendance = useMemo(
        () =>
            attendance.filter((record) => {
                const date = parseDate(record.date);

                return (
                    date &&
                    date.getFullYear() === now.getFullYear() &&
                    date.getMonth() === now.getMonth()
                );
            }),
        [attendance, now],
    );
    const presentCount = monthAttendance.filter(
        (record) => record.status.toLowerCase() === 'present',
    ).length;
    const absentCount = monthAttendance.filter(
        (record) => record.status.toLowerCase() === 'absent',
    ).length;
    const attendanceRate = monthAttendance.length
        ? Math.round((presentCount / monthAttendance.length) * 100)
        : 0;
    const monthLabel = new Intl.DateTimeFormat(undefined, {
        month: 'long',
        year: 'numeric',
    }).format(now);
    const timeLabel = new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
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
        <>
            <Head title="Attendance" />

            <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <p className="flex items-center gap-2 text-sm font-medium text-violet-600">
                            <Dumbbell className="size-4" />
                            GymFit Manager
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                            Attendance
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            View attendance records for your active membership.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                        <p className="text-sm font-medium text-slate-950">
                            {timeLabel}
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/dashboard">Back to Dashboard</Link>
                        </Button>
                    </div>
                </header>

                <section className="mt-6 grid gap-4 sm:grid-cols-3">
                    <MetricCard
                        icon={CalendarCheck}
                        title="Present"
                        value={String(presentCount)}
                        detail={`${monthLabel} visits`}
                    />
                    <MetricCard
                        icon={XCircle}
                        title="Absent"
                        value={String(absentCount)}
                        detail="Recorded absences"
                    />
                    <MetricCard
                        icon={Clock3}
                        title="Attendance Rate"
                        value={`${attendanceRate}%`}
                        detail={
                            attendanceStarted
                                ? 'Based on tracked days'
                                : 'Starts after plan activation'
                        }
                    />
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
                    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <CalendarDays className="size-5 text-violet-600" />
                                    Calendar
                                </CardTitle>
                                <p className="mt-1 text-sm text-slate-500">
                                    {monthLabel}
                                </p>
                            </div>
                            <span className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
                                {member?.plan ?? 'No plan'}
                            </span>
                        </CardHeader>
                        <CardContent>
                            {!attendanceStarted && (
                                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    Attendance will appear here once your plan
                                    is active.
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
                                <Legend
                                    color="bg-emerald-500"
                                    label="Present"
                                />
                                <Legend color="bg-rose-500" label="Absent" />
                                <Legend
                                    color="bg-slate-300"
                                    label="Not Checked In"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CalendarCheck className="size-5 text-violet-600" />
                                Attendance History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto px-0">
                            <table className="w-full min-w-[720px] text-left text-sm text-slate-600">
                                <thead>
                                    <tr className="border-y border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Check In</th>
                                        <th className="px-4 py-3">Check Out</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.length ? (
                                        attendance.map((record) => (
                                            <tr
                                                key={record.id}
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >
                                                <td className="px-4 py-4 font-medium text-slate-950">
                                                    {record.date}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {record.checkIn || '-'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {record.checkOut || '-'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge
                                                        status={record.status}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-10 text-center text-sm text-slate-500"
                                            >
                                                No attendance records yet.
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
    icon: typeof CalendarCheck;
    title: string;
    value: string;
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

function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase();
    const color =
        normalized === 'present'
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
            : normalized === 'absent'
              ? 'bg-rose-50 text-rose-700 ring-rose-100'
              : 'bg-slate-50 text-slate-700 ring-slate-100';

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${color}`}
        >
            {status}
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

Attendance.layout = {
    breadcrumbs: [
        {
            title: 'Attendance',
            href: '/attendance',
        },
    ],
};
