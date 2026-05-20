import { Head, Link } from '@inertiajs/react';
import {
    BarChart3,
    Clock,
    Dumbbell,
    Flame,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    recommendedExerciseLoad,
    recommendedReps,
} from '@/lib/workout-recommendations';

interface Member {
    id: number;
    name: string;
    plan: string;
    body_weight_kg?: number | null;
}

interface WorkoutExercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weightKg: number;
    restSec: number;
    notes: string;
}

interface SavedWorkout {
    title: string;
    focus: string;
    durationMin: number;
    exercises: WorkoutExercise[];
    savedAt: string;
}

interface TodaysWorkoutProps {
    member?: Member;
}

const makeExerciseId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const defaultExercise = (): WorkoutExercise => ({
    id: makeExerciseId(),
    name: '',
    sets: 3,
    reps: 10,
    weightKg: 0,
    restSec: 90,
    notes: '',
});

const storageKey = (member?: Member) =>
    `gymfit-daily-workout-${member?.id ?? 'guest'}`;

const savedWorkoutFor = (member?: Member): SavedWorkout | null => {
    const savedWorkout = window.localStorage.getItem(storageKey(member));

    if (!savedWorkout) {
        return null;
    }

    return JSON.parse(savedWorkout) as SavedWorkout;
};

const basicWorkoutOptions = [
    'Barbell Squat',
    'Bench Press',
    'Deadlift',
    'Overhead Press',
    'Bent Over Row',
    'Lat Pulldown',
    'Leg Press',
    'Lunges',
    'Push Ups',
    'Pull Ups',
    'Dumbbell Row',
    'Shoulder Press',
    'Bicep Curls',
    'Tricep Pushdown',
    'Plank',
    'Crunches',
    'Calf Raises',
    'Hamstring Curl',
    'Leg Extension',
    'Treadmill Walk',
];

export default function TodaysWorkout({ member }: TodaysWorkoutProps) {
    const [initialWorkout] = useState(() => savedWorkoutFor(member));
    const [title, setTitle] = useState(
        initialWorkout?.title || "Today's Workout",
    );
    const [focus, setFocus] = useState(initialWorkout?.focus || 'Strength');
    const [durationMin, setDurationMin] = useState(
        initialWorkout?.durationMin || 45,
    );
    const [exercises, setExercises] = useState<WorkoutExercise[]>(() =>
        initialWorkout?.exercises?.length
            ? initialWorkout.exercises
            : [defaultExercise()],
    );
    const [saved, setSaved] = useState(false);

    const filledExercises = useMemo(
        () => exercises.filter((exercise) => exercise.name.trim()),
        [exercises],
    );
    const totalSets = filledExercises.reduce(
        (sum, exercise) => sum + exercise.sets,
        0,
    );
    const totalKg = filledExercises.reduce(
        (sum, exercise) =>
            sum + exercise.sets * exercise.reps * exercise.weightKg,
        0,
    );
    const balance = useMemo(() => {
        if (!filledExercises.length) {
            return 'Empty';
        }

        return filledExercises.length >= 3 ? 'Good' : 'Light';
    }, [filledExercises.length]);

    const updateExercise = (
        id: string,
        field: keyof WorkoutExercise,
        value: string | number,
    ) => {
        setExercises((current) =>
            current.map((exercise) => {
                if (exercise.id !== id) {
                    return exercise;
                }

                if (field === 'name' && typeof value === 'string') {
                    const recommendation = recommendedExerciseLoad(
                        value,
                        member?.body_weight_kg,
                    );

                    return {
                        ...exercise,
                        name: value,
                        reps: recommendedReps(
                            exercise.reps,
                            value,
                            member?.body_weight_kg,
                        ),
                        weightKg: recommendation?.weightKg ?? exercise.weightKg,
                    };
                }

                return { ...exercise, [field]: value };
            }),
        );
    };

    const addExercise = () => {
        setExercises((current) => [...current, defaultExercise()]);
    };

    const removeExercise = (id: string) => {
        setExercises((current) =>
            current.length === 1
                ? [defaultExercise()]
                : current.filter((exercise) => exercise.id !== id),
        );
    };

    const saveWorkout = () => {
        window.localStorage.setItem(
            storageKey(member),
            JSON.stringify({
                title,
                focus,
                durationMin,
                exercises: filledExercises,
                savedAt: new Date().toISOString(),
            } satisfies SavedWorkout),
        );
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1800);
    };

    return (
        <>
            <Head title="Today's Workout" />

            <main className="min-h-screen bg-[#f7f8fb] px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <section className="space-y-5">
                        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                            <CardHeader className="flex flex-row items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="text-3xl">
                                        Today's Workout
                                    </CardTitle>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Edit your daily workout. This is what
                                        appears on your dashboard.
                                    </p>
                                </div>
                                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                                    {member?.body_weight_kg
                                        ? `${member.body_weight_kg} kg`
                                        : (member?.plan ?? 'Member')}
                                </span>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-3 md:grid-cols-3">
                                    <Input
                                        value={title}
                                        onChange={(event) =>
                                            setTitle(event.target.value)
                                        }
                                        placeholder="Workout title"
                                    />
                                    <Input
                                        value={focus}
                                        onChange={(event) =>
                                            setFocus(event.target.value)
                                        }
                                        placeholder="Focus"
                                    />
                                    <Input
                                        type="number"
                                        min={0}
                                        value={durationMin}
                                        onChange={(event) =>
                                            setDurationMin(
                                                Number(event.target.value) || 0,
                                            )
                                        }
                                        placeholder="Minutes"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Plus className="size-5 text-red-500" />
                                    Add Exercise
                                </CardTitle>
                                <Button
                                    type="button"
                                    size="icon"
                                    className="bg-red-500 text-white hover:bg-red-600"
                                    onClick={addExercise}
                                >
                                    <Plus className="size-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {exercises.map((exercise, index) => (
                                    <div
                                        key={exercise.id}
                                        className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="font-semibold text-slate-950">
                                                Exercise {index + 1}
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="border-red-100 text-red-600 hover:bg-red-50"
                                                onClick={() =>
                                                    removeExercise(exercise.id)
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-3">
                                            <label className="grid gap-1 text-xs font-semibold text-slate-600">
                                                Exercise
                                                <select
                                                    value={exercise.name}
                                                    onChange={(event) =>
                                                        updateExercise(
                                                            exercise.id,
                                                            'name',
                                                            event.target.value,
                                                        )
                                                    }
                                                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-950 shadow-xs transition outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                                                >
                                                    <option value="">
                                                        Choose exercise...
                                                    </option>
                                                    {basicWorkoutOptions.map(
                                                        (option) => (
                                                            <option
                                                                key={option}
                                                                value={option}
                                                            >
                                                                {option}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </label>
                                            <NumberField
                                                label="Sets"
                                                value={exercise.sets}
                                                onChange={(value) =>
                                                    updateExercise(
                                                        exercise.id,
                                                        'sets',
                                                        value,
                                                    )
                                                }
                                            />
                                            <NumberField
                                                label="Reps"
                                                value={exercise.reps}
                                                onChange={(value) =>
                                                    updateExercise(
                                                        exercise.id,
                                                        'reps',
                                                        value,
                                                    )
                                                }
                                            />
                                            <NumberField
                                                label="Weight (kg)"
                                                value={exercise.weightKg}
                                                onChange={(value) =>
                                                    updateExercise(
                                                        exercise.id,
                                                        'weightKg',
                                                        value,
                                                    )
                                                }
                                            />
                                            <NumberField
                                                label="Rest (sec)"
                                                value={exercise.restSec}
                                                onChange={(value) =>
                                                    updateExercise(
                                                        exercise.id,
                                                        'restSec',
                                                        value,
                                                    )
                                                }
                                            />
                                            <Input
                                                value={exercise.notes}
                                                onChange={(event) =>
                                                    updateExercise(
                                                        exercise.id,
                                                        'notes',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Notes"
                                            />
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-12 border-dashed border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={addExercise}
                                >
                                    <Plus className="mr-2 size-4" />
                                    Add Another Exercise
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="grid gap-3">
                            <Button
                                type="button"
                                className="h-12 bg-red-500 text-white hover:bg-red-600"
                                onClick={saveWorkout}
                            >
                                <Save className="mr-2 size-4" />
                                {saved ? 'Saved' : 'Save Workout'}
                            </Button>
                            <Button asChild variant="outline" className="h-12">
                                <Link href="/dashboard">Back to Dashboard</Link>
                            </Button>
                        </div>
                    </section>

                    <aside className="grid content-start gap-5">
                        <SummaryCard
                            exercises={filledExercises.length}
                            minutes={durationMin}
                            calories={filledExercises.length * 80}
                            balance={balance}
                        />
                        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Your Exercises ({filledExercises.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                {filledExercises.length ? (
                                    filledExercises.map((exercise, index) => (
                                        <div
                                            key={exercise.id}
                                            className="rounded-lg border border-slate-100 p-3"
                                        >
                                            <p className="text-sm font-semibold text-slate-950">
                                                {index + 1}. {exercise.name}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {exercise.sets} sets x{' '}
                                                {exercise.reps} reps at{' '}
                                                {exercise.weightKg} kg
                                            </p>
                                            <p className="mt-1 text-xs text-red-600">
                                                Rest: {exercise.restSec} sec
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        Add exercises to build your workout.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="rounded-lg border-blue-100 bg-blue-50 shadow-sm">
                            <CardContent className="pt-5 text-sm text-blue-900">
                                <span className="font-semibold">Tip:</span> Warm
                                up before your workout and stretch afterward.
                            </CardContent>
                        </Card>
                        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Total Lifted
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-slate-950">
                                    {totalKg.toLocaleString()} kg
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    {totalSets} total sets
                                </p>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </main>
        </>
    );
}

function NumberField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
            {label}
            <Input
                type="number"
                min={0}
                value={value}
                onChange={(event) => onChange(Number(event.target.value) || 0)}
            />
        </label>
    );
}

function SummaryCard({
    exercises,
    minutes,
    calories,
    balance,
}: {
    exercises: number;
    minutes: number;
    calories: number;
    balance: string;
}) {
    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="size-5 text-red-500" />
                    Workout Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
                <SummaryTile
                    icon={Dumbbell}
                    label="Exercises"
                    value={exercises.toString()}
                    tone="red"
                />
                <SummaryTile
                    icon={Clock}
                    label="Minutes"
                    value={minutes.toString()}
                    tone="emerald"
                />
                <SummaryTile
                    icon={Flame}
                    label="Calories"
                    value={calories.toString()}
                    tone="amber"
                />
                <SummaryTile
                    icon={BarChart3}
                    label="Balance"
                    value={balance}
                    tone="blue"
                />
            </CardContent>
        </Card>
    );
}

function SummaryTile({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof Dumbbell;
    label: string;
    value: string;
    tone: 'red' | 'emerald' | 'amber' | 'blue';
}) {
    const toneClass = {
        red: 'bg-red-50 text-red-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        blue: 'bg-blue-50 text-blue-600',
    }[tone];

    return (
        <div className="rounded-lg border border-slate-100 p-4 text-center">
            <div
                className={`mx-auto grid size-11 place-items-center rounded-full ${toneClass}`}
            >
                <Icon className="size-5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{label}</p>
        </div>
    );
}

TodaysWorkout.layout = {
    breadcrumbs: [
        {
            title: "Today's Workout",
            href: '/todays-workout',
        },
    ],
};
