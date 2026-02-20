<?php

namespace App\Mail;

use App\Models\Submission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MagicLinkMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Submission $submission,
        public readonly string $magicLinkUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Accés a la teva inscripció — La Cabra d\'Or 2026',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.magic-link',
        );
    }
}
