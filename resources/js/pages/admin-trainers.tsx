import { Head } from '@inertiajs/react';
import {
    Award,
    Dumbbell,
    Search,
    ShieldCheck,
    Star,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Trainer {
    id: number;
    name: string;
    specialty: string;
    experience: number;
    rating: number;
    activeMembers: number;
    filledSlots: number;
    capacity: number;
    banner: string;
    photo: string;
    accent: string;
    description: string;
    focusAreas: string[];
    coachingStyle: string;
}

interface TrainerRequest {
    id: number;
    user: string;
    requested_trainer: string;
    date: string;
    status: string;
}

const trainers: Trainer[] = [
    {
        id: 1,
        name: 'John Cena',
        specialty: 'Strength',
        experience: 18,
        rating: 4.9,
        activeMembers: 0,
        filledSlots: 0,
        capacity: 10,
        banner: '/images/trainers/john cena.jpg',
        photo: '/images/trainers/john cena.jpg',
        accent: 'from-red-500 to-slate-900',
        description:
            'A high-energy strength coach focused on consistency, discipline, and measurable progress. John builds programs around compound lifts, safe form, and weekly performance targets.',
        focusAreas: ['Strength cycles', 'Power training', 'Beginner form work'],
        coachingStyle: 'Motivational, structured, and goal-driven.',
    },
    {
        id: 2,
        name: 'The Rock',
        specialty: 'Functional Training',
        experience: 20,
        rating: 4.9,
        activeMembers: 0,
        filledSlots: 0,
        capacity: 10,
        banner: '/images/trainers/the rock.jpg',
        photo: '/images/trainers/the rock.jpg',
        accent: 'from-amber-500 to-slate-900',
        description:
            'A functional training specialist who blends athletic conditioning, mobility, and full-body strength. The Rock is best for members who want explosive workouts and strong everyday performance.',
        focusAreas: [
            'Functional strength',
            'Conditioning',
            'Mobility and stamina',
        ],
        coachingStyle: 'Intense, encouraging, and performance-focused.',
    },
    {
        id: 3,
        name: 'Arnold Schwarzenegger',
        specialty: 'Bodybuilding',
        experience: 25,
        rating: 4.9,
        activeMembers: 0,
        filledSlots: 0,
        capacity: 10,
        banner: '/images/trainers/arnold schwarzenegger.jpg',
        photo: '/images/trainers/arnold schwarzenegger.jpg',
        accent: 'from-emerald-500 to-slate-900',
        description:
            'A bodybuilding coach for members who want muscle growth, symmetry, and stage-ready discipline. Arnold emphasizes progressive overload, nutrition habits, and focused hypertrophy routines.',
        focusAreas: ['Bodybuilding', 'Hypertrophy', 'Nutrition discipline'],
        coachingStyle: 'Classic, precise, and results-oriented.',
    },
    {
        id: 4,
        name: 'Sylvester Gardenzio Stallone',
        specialty: 'Boxing',
        experience: 22,
        rating: 4.8,
        activeMembers: 0,
        filledSlots: 0,
        capacity: 10,
        banner: '/images/trainers/Sylvester stallone.jpg',
        photo: '/images/trainers/Sylvester stallone.jpg',
        accent: 'from-blue-500 to-slate-900',
        description:
            'A boxing and conditioning coach built for members who want grit, coordination, and fight-ready cardio. Sylvester develops footwork, punching mechanics, and resilient conditioning.',
        focusAreas: ['Boxing fundamentals', 'Footwork', 'Fight conditioning'],
        coachingStyle: 'Tough, focused, and confidence-building.',
    },
    {
        id: 5,
        name: 'Ma Dong-seok',
        specialty: 'Boxing',
        experience: 16,
        rating: 4.9,
        activeMembers: 0,
        filledSlots: 0,
        capacity: 10,
        banner: '/images/trainers/ma dong-seok.jpg',
        photo: '/images/trainers/ma dong-seok.jpg',
        accent: 'from-violet-500 to-slate-900',
        description:
            'A powerful boxing and functional strength coach who specializes in heavy conditioning and practical movement. Ma Dong-seok helps members build strength that feels useful outside the gym.',
        focusAreas: ['Boxing power', 'Functional strength', 'Core stability'],
        coachingStyle: 'Calm, direct, and strength-first.',
    },
];

const filters = ['Available', 'Full', 'Strength', 'Boxing', 'Bodybuilding'];

const initials = (name = 'Trainer') =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

export default function AdminTrainers({
    trainerRequests = [],
}: {
    trainerRequests?: TrainerRequest[];
}) {
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('Available');
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(
        null,
    );
    const [profileTrainer, setProfileTrainer] = useState<Trainer | null>(null);
    const [requestStatus, setRequestStatus] = useState<Record<number, string>>(
        {},
    );
    const [userRating, setUserRating] = useState<number | null>(null);
    const [userReview, setUserReview] = useState('');
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);

    const visibleTrainers = useMemo(() => {
        return trainers.filter((trainer) => {
            const matchesSearch =
                trainer.name.toLowerCase().includes(search.toLowerCase()) ||
                trainer.specialty.toLowerCase().includes(search.toLowerCase());
            const isFull = trainer.filledSlots >= trainer.capacity;
            const matchesFilter =
                activeFilter === 'Available'
                    ? !isFull
                    : activeFilter === 'Full'
                      ? isFull
                      : trainer.specialty === activeFilter;

            return matchesSearch && matchesFilter;
        });
    }, [activeFilter, search]);

    const pendingCount =
        trainerRequests.filter(
            (request) => request.status.toLowerCase() === 'pending',
        ).length +
        Object.values(requestStatus).filter((status) => status === 'Pending')
            .length;

    const sendRequest = () => {
        if (!selectedTrainer) {
            return;
        }

        setRequestStatus((current) => ({
            ...current,
            [selectedTrainer.id]: 'Pending',
        }));
        setSelectedTrainer(null);
    };

    const submitRating = async () => {
        if (!profileTrainer || userRating === null) {
            return;
        }

        setIsSubmittingRating(true);
        try {
            const response = await fetch(
                `/trainers/${profileTrainer.id}/rate`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        trainer_id: profileTrainer.id,
                        rating: userRating,
                        review: userReview,
                    }),
                }
            );

            if (response.ok) {
                setRatingSubmitted(true);
                setUserRating(null);
                setUserReview('');
                setTimeout(() => setRatingSubmitted(false), 3000);
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating');
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const handleProfileTrainerChange = (trainer: Trainer | null) => {
        setProfileTrainer(trainer);
        if (trainer === null) {
            setUserRating(null);
            setUserReview('');
            setRatingSubmitted(false);
        }
    };

    return (
        <>
            <Head title="Trainers" />

            <main className="min-h-screen bg-[#f7f8fb] px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
                <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="flex items-center gap-2 text-sm font-semibold text-red-500">
                                <Dumbbell className="size-4" />
                                Trainer Selection
                            </p>
                            <h1 className="mt-2 text-2xl font-semibold text-slate-950">
                                Gym Manager Trainers
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Assign members to premium coaches with live slot
                                capacity and approval tracking.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <Metric label="Trainers" value={trainers.length} />
                            <Metric
                                label="Open Slots"
                                value={trainers.reduce(
                                    (sum, trainer) =>
                                        sum +
                                        (trainer.capacity -
                                            trainer.filledSlots),
                                    0,
                                )}
                            />
                            <Metric
                                label="Pending Requests"
                                value={pendingCount}
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <label className="relative block min-w-0 lg:w-96">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="h-10 rounded-lg border-slate-200 bg-white pl-9"
                            placeholder="Search trainers or specialties..."
                        />
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter) => (
                            <Button
                                key={filter}
                                type="button"
                                size="sm"
                                variant={
                                    activeFilter === filter
                                        ? 'default'
                                        : 'outline'
                                }
                                className={
                                    activeFilter === filter
                                        ? 'bg-slate-950 text-white hover:bg-slate-800'
                                        : 'border-slate-200'
                                }
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </Button>
                        ))}
                    </div>
                </section>

                <section className="mt-5 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                    {visibleTrainers.map((trainer) => (
                        <TrainerCard
                            key={trainer.id}
                            trainer={trainer}
                            requestStatus={requestStatus[trainer.id]}
                            onViewProfile={() => setProfileTrainer(trainer)}
                            onChoose={() => setSelectedTrainer(trainer)}
                        />
                    ))}
                </section>

                {!visibleTrainers.length && (
                    <Card className="mt-5 rounded-lg border-slate-200 bg-white shadow-sm">
                        <CardContent className="py-12 text-center text-sm text-slate-500">
                            No trainers match the selected search and filter.
                        </CardContent>
                    </Card>
                )}

                <Dialog
                    open={selectedTrainer !== null}
                    onOpenChange={(open) => !open && setSelectedTrainer(null)}
                >
                    <DialogContent className="rounded-lg">
                        <DialogHeader>
                            <DialogTitle>Select Trainer</DialogTitle>
                            <DialogDescription>
                                Send this trainer selection into the admin
                                approval queue.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedTrainer && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">
                                    Trainer:{' '}
                                    <span className="font-semibold text-slate-950">
                                        {selectedTrainer.name}
                                    </span>
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    Available Slots:{' '}
                                    <span className="font-semibold text-slate-950">
                                        {selectedTrainer.capacity -
                                            selectedTrainer.filledSlots}
                                        /{selectedTrainer.capacity}
                                    </span>
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    Assigned Members:{' '}
                                    <span className="font-semibold text-slate-950">
                                        {selectedTrainer.filledSlots}
                                    </span>
                                </p>
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                type="button"
                                className="bg-red-500 text-white hover:bg-red-600"
                                onClick={sendRequest}
                            >
                                Send Request
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={profileTrainer !== null}
                    onOpenChange={(open) =>
                        handleProfileTrainerChange(open ? profileTrainer : null)
                    }
                >
                    <DialogContent className="overflow-hidden rounded-lg p-0 sm:max-w-2xl max-h-[90vh] flex flex-col">
                        {profileTrainer && (
                            <>
                                <div className="relative h-56 flex-shrink-0">
                                    <img
                                        src={profileTrainer.banner}
                                        alt={`${profileTrainer.name} profile banner`}
                                        className="h-full w-full object-cover"
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                'none';
                                        }}
                                    />
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${profileTrainer.accent} opacity-75`}
                                    />
                                    <div className="absolute -bottom-12 left-6 grid size-28 place-items-center rounded-full border-4 border-white bg-slate-950 text-xl font-semibold text-white shadow-xl">
                                        {initials(profileTrainer.name)}
                                    </div>
                                    <img
                                        src={profileTrainer.photo}
                                        alt={profileTrainer.name}
                                        className="absolute -bottom-12 left-6 size-28 rounded-full border-4 border-white object-cover shadow-xl"
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                'none';
                                        }}
                                    />
                                </div>
                                <div className="px-6 pt-16 pb-6 overflow-y-auto flex-1">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl">
                                            {profileTrainer.name}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {profileTrainer.specialty} trainer
                                            with {profileTrainer.experience}{' '}
                                            years of coaching experience.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                        <ProfileStat
                                            label="Rating"
                                            value={`${profileTrainer.rating}`}
                                        />
                                        <ProfileStat
                                            label="Assigned Members"
                                            value={`${profileTrainer.filledSlots}`}
                                        />
                                        <ProfileStat
                                            label="Available Slots"
                                            value={`${
                                                profileTrainer.capacity -
                                                profileTrainer.filledSlots
                                            }/${profileTrainer.capacity}`}
                                        />
                                    </div>

                                    <div className="mt-5">
                                        <p className="text-sm font-semibold text-slate-950">
                                            About
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {profileTrainer.description}
                                        </p>
                                    </div>

                                    <div className="mt-5">
                                        <p className="text-sm font-semibold text-slate-950">
                                            Focus Areas
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {profileTrainer.focusAreas.map(
                                                (area) => (
                                                    <Badge
                                                        key={area}
                                                        className="border-red-100 bg-red-50 text-red-700"
                                                    >
                                                        {area}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                                        <p className="text-sm font-semibold text-slate-950">
                                            Coaching Style
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            {profileTrainer.coachingStyle}
                                        </p>
                                    </div>

                                    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                                        <p className="text-sm font-semibold text-slate-950 mb-3">
                                            Rate This Trainer
                                        </p>
                                        <div className="flex gap-2 mb-3">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() =>
                                                        setUserRating(star)
                                                    }
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        className={`size-6 ${
                                                            star <=
                                                            (userRating || 0)
                                                                ? 'fill-amber-400 text-amber-400'
                                                                : 'text-slate-300'
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        {userRating !== null && (
                                            <>
                                                <textarea
                                                    value={userReview}
                                                    onChange={(e) =>
                                                        setUserReview(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Share your experience with this trainer (optional)"
                                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                                    rows={3}
                                                />
                                                <Button
                                                    type="button"
                                                    disabled={isSubmittingRating}
                                                    className="mt-3 w-full bg-red-500 text-white hover:bg-red-600 disabled:bg-slate-300"
                                                    onClick={submitRating}
                                                >
                                                    {isSubmittingRating
                                                        ? 'Submitting...'
                                                        : 'Submit Rating'}
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    <DialogFooter className="mt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                handleProfileTrainerChange(null)
                                            }
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            type="button"
                                            className="bg-red-500 text-white hover:bg-red-600"
                                            onClick={() => {
                                                setSelectedTrainer(
                                                    profileTrainer,
                                                );
                                                handleProfileTrainerChange(null);
                                            }}
                                        >
                                            Choose Trainer
                                        </Button>
                                    </DialogFooter>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </main>
        </>
    );
}

function TrainerCard({
    trainer,
    requestStatus,
    onViewProfile,
    onChoose,
}: {
    trainer: Trainer;
    requestStatus?: string;
    onViewProfile: () => void;
    onChoose: () => void;
}) {
    const isFull = trainer.filledSlots >= trainer.capacity;
    const remainingSlots = trainer.capacity - trainer.filledSlots;
    const progress = Math.round((trainer.filledSlots / trainer.capacity) * 100);

    return (
        <Card className="group overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            {/* Banner Section - 180px height with relative positioning for avatar overlap */}
            <div className="relative h-[180px] overflow-visible">
                <img
                    src={trainer.banner}
                    alt={`${trainer.name} training banner`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(event) => {
                        event.currentTarget.style.display = 'none';
                    }}
                />
                <div
                    className={`absolute inset-0 bg-gradient-to-br ${trainer.accent} opacity-70`}
                />
                <div className="absolute top-4 right-4">
                    <Badge
                        className={
                            isFull
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }
                    >
                        {isFull ? 'FULL' : `${remainingSlots} slots left`}
                    </Badge>
                </div>

                {/* Avatar - 96px × 96px, positioned absolute at bottom: -48px, left: 24px */}
                <div className="absolute -bottom-12 left-6 grid size-24 place-items-center rounded-full border-4 border-white bg-slate-950 text-lg font-semibold text-white shadow-md z-10">
                    {initials(trainer.name)}
                </div>
                <img
                    src={trainer.photo}
                    alt={trainer.name}
                    className="absolute -bottom-12 left-6 size-24 rounded-full border-4 border-white object-cover shadow-md z-20"
                    onError={(event) => {
                        event.currentTarget.style.display = 'none';
                    }}
                />
            </div>

            {/* Content Section - Top padding accommodates avatar overlap (64px covers 48px bottom overlap + 16px spacing) */}
            <CardContent className="relative px-5 pb-5 pt-16">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="truncate text-xl font-semibold text-slate-950">
                            {trainer.name}
                        </h2>
                        <p className="mt-1 text-sm font-medium text-red-500">
                            {trainer.specialty}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        {trainer.rating}
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                    <TrainerStat
                        icon={Award}
                        label="Experience"
                        value={`${trainer.experience}y`}
                    />
                    <TrainerStat
                        icon={Users}
                        label="Members"
                        value={trainer.activeMembers.toString()}
                    />
                    <TrainerStat
                        icon={ShieldCheck}
                        label="Slots"
                        value={`${remainingSlots}/${trainer.capacity}`}
                    />
                </div>

                <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">
                            {trainer.filledSlots} / {trainer.capacity} slots
                            filled
                        </span>
                        <span
                            className={
                                isFull
                                    ? 'font-semibold text-red-600'
                                    : 'font-semibold text-emerald-600'
                            }
                        >
                            {isFull ? 'Slots Full' : 'Available'}
                        </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={
                                isFull
                                    ? 'h-full rounded-full bg-red-500'
                                    : 'h-full rounded-full bg-emerald-500'
                            }
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {requestStatus && (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                        Request Pending
                    </div>
                )}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-slate-200"
                        onClick={onViewProfile}
                    >
                        View Profile
                    </Button>
                    <Button
                        type="button"
                        disabled={isFull || Boolean(requestStatus)}
                        className="bg-red-500 text-white hover:bg-red-600 disabled:bg-slate-200 disabled:text-slate-500"
                        onClick={onChoose}
                    >
                        {isFull ? 'Slots Full' : 'Choose Trainer'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
        </div>
    );
}

function TrainerStat({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Award;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
            <Icon className="size-4 text-slate-500" />
            <p className="mt-2 text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
        </div>
    );
}
