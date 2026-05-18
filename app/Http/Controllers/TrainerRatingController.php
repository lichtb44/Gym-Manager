<?php

namespace App\Http\Controllers;

use App\Models\TrainerRating;
use App\Models\Member;
use Illuminate\Http\Request;

class TrainerRatingController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'trainer_id' => 'required|integer',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:500',
        ]);

        $member = Member::where('user_id', auth()->id())->first();

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        $rating = TrainerRating::updateOrCreate(
            [
                'trainer_id' => $validated['trainer_id'],
                'member_id' => $member->id,
            ],
            [
                'rating' => $validated['rating'],
                'review' => $validated['review'] ?? null,
                'status' => 'pending', // Default to pending for admin review
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Rating submitted for admin approval',
            'rating' => $rating,
        ]);
    }

    public function getTrainerRating($trainerId)
    {
        $member = Member::where('user_id', auth()->id())->first();

        if (!$member) {
            return response()->json(null);
        }

        $rating = TrainerRating::where('trainer_id', $trainerId)
            ->where('member_id', $member->id)
            ->first();

        return response()->json($rating);
    }

    public function getTrainerAverageRating($trainerId)
    {
        // Only count approved ratings
        $average = TrainerRating::where('trainer_id', $trainerId)
            ->where('status', 'approved')
            ->avg('rating');

        $count = TrainerRating::where('trainer_id', $trainerId)
            ->where('status', 'approved')
            ->count();

        return response()->json([
            'average' => $average ? round($average, 1) : 0,
            'count' => $count,
        ]);
    }

    // Admin methods
    public function getPendingRatings()
    {
        $ratings = TrainerRating::where('status', 'pending')
            ->with('member')
            ->get();

        return response()->json($ratings);
    }

    public function approveRating($id)
    {
        $rating = TrainerRating::findOrFail($id);
        $rating->update(['status' => 'approved']);

        return response()->json([
            'success' => true,
            'message' => 'Rating approved',
            'rating' => $rating,
        ]);
    }

    public function rejectRating($id)
    {
        $rating = TrainerRating::findOrFail($id);
        $rating->update(['status' => 'rejected']);

        return response()->json([
            'success' => true,
            'message' => 'Rating rejected',
            'rating' => $rating,
        ]);
    }
}
