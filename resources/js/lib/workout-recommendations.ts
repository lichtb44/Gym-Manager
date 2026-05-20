const weightedExerciseMultipliers: Array<[RegExp, number]> = [
    [/deadlift|trap bar/i, 0.75],
    [/leg press/i, 1],
    [/back squat|front squat|barbell squat|goblet squat|dumbbell squat/i, 0.6],
    [/bench|chest press|incline press|dumbbell press/i, 0.45],
    [/row|pulldown/i, 0.4],
    [/overhead press|shoulder press/i, 0.35],
    [/hip thrust/i, 0.7],
    [/lunge|split squat|step up/i, 0.25],
    [
        /curl|tricep|skull crusher|pushdown|lateral raise|rear delt|face pull/i,
        0.15,
    ],
    [/kettlebell swing|thruster|renegade row/i, 0.3],
    [/calf raise/i, 0.45],
    [/weighted dip|weighted pull/i, 0.2],
];

const bodyweightOnlyExercises =
    /push up|pull up|plank|burpee|mountain climber|walk|bike|rower|treadmill|jump rope|battle rope|mobility|stretch|breathing|meal prep|core finisher/i;

const roundToNearestFive = (value: number) =>
    Math.max(0, Math.round(value / 5) * 5);

export function recommendedExerciseLoad(
    exerciseName: string,
    bodyWeightKg?: number | null,
) {
    if (!bodyWeightKg || bodyweightOnlyExercises.test(exerciseName)) {
        return null;
    }

    const multiplier =
        weightedExerciseMultipliers.find(([pattern]) =>
            pattern.test(exerciseName),
        )?.[1] ?? 0.3;
    const bodyWeightFactor =
        bodyWeightKg < 60 ? 0.9 : bodyWeightKg > 90 ? 1.1 : 1;
    const repAdjustment = bodyWeightKg < 60 ? 2 : bodyWeightKg > 90 ? -2 : 0;

    return {
        weightKg: roundToNearestFive(
            bodyWeightKg * multiplier * bodyWeightFactor,
        ),
        repAdjustment,
    };
}

export function recommendedReps(
    currentReps: number,
    exerciseName: string,
    bodyWeightKg?: number | null,
) {
    const recommendation = recommendedExerciseLoad(exerciseName, bodyWeightKg);

    if (!recommendation) {
        return currentReps;
    }

    return Math.min(
        15,
        Math.max(5, currentReps + recommendation.repAdjustment),
    );
}

export function applyBodyWeightRecommendationToDetail(
    exerciseName: string,
    detail: string,
    bodyWeightKg?: number | null,
) {
    const recommendation = recommendedExerciseLoad(exerciseName, bodyWeightKg);

    if (!recommendation) {
        return detail;
    }

    const repsMatch = detail.match(/(\d+)(?:\s*to\s*\d+)?\s*reps/i);
    const currentReps = repsMatch ? Number(repsMatch[1]) : 10;
    const nextReps = recommendedReps(currentReps, exerciseName, bodyWeightKg);
    const detailWithReps = repsMatch
        ? detail.replace(/(\d+)(?:\s*to\s*\d+)?\s*reps/i, `${nextReps} reps`)
        : `${detail} - ${nextReps} reps`;

    if (/\d+(?:\.\d+)?\s*kg/i.test(detailWithReps)) {
        return detailWithReps.replace(
            /\d+(?:\.\d+)?\s*kg/i,
            `${recommendation.weightKg} kg`,
        );
    }

    return `${detailWithReps} - ${recommendation.weightKg} kg`;
}
