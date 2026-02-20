<?php

namespace App\Http\Controllers;

use App\Mail\MagicLinkMail;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class MagicLinkController extends Controller
{
    // GET/accedir

    public function showForm(): Response
    {
        return Inertia::render('MagicLink/Enter');
    }

    // POST/accedir

    public function send(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $submission = Submission::where('email', $request->email)->first();

        // Always show the "check your email" page — never confirm if email exists.
        // This prevents email enumeration attacks.
        if ($submission) {
            $signedUrl = URL::temporarySignedRoute(
                'magic-link.verify',
                now()->addMinutes(60), // Link valid for 1 hour
                ['token' => $submission->access_code]
            );

            Mail::to($submission->email)
                ->send(new MagicLinkMail($submission, $signedUrl));

            // Update sent timestamp
            $submission->update(['magic_link_sent_at' => now()]);
        }

        return Inertia::render('MagicLink/Sent', [
            'email' => $request->email,
        ]);
    }

    // ── GET /accedir/{token} (signed) ─────────────────────────────────────

    public function verify(Request $request, string $token)
    {
        // Laravel's 'signed' middleware already validated the signature.
        // We just need to find the submission and set the session.

        $submission = Submission::where('access_code', $token)->firstOrFail();

        // Store submission ID in session — this is our "auth"
        session([
            'submission_id'   => $submission->id,
            'submission_email' => $submission->email,
        ]);

        return redirect()->route('submission.show')
            ->with('flash', [
                'type'    => 'success',
                'message' => 'Benvingut/da de nou, ' . $submission->full_name . '!',
            ]);
    }
}
