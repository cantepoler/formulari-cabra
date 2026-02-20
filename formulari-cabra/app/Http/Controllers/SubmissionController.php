<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Submission;
use App\Models\Task;
use App\Mail\MagicLinkMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionController extends Controller
{
    // GET/formulari

    public function create(): Response
    {
        return Inertia::render('Form/Wizard', [
            'roles' => Role::active()->get(['id', 'name', 'slug', 'description']),
            'tasks' => $this->tasksForWizard(),
        ]);
    }

    // POST/formulari

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name'        => ['required', 'string', 'max:255'],
            'birth_date'       => ['required', 'date', 'before:today'],
            'email'            => ['required', 'email', 'unique:submissions,email'],
            'phone'            => ['nullable', 'string', 'max:20'],
            'guardian_name'    => ['nullable', 'string', 'max:255'],
            'guardian_phone'   => ['nullable', 'string', 'max:20'],
            'role_ids'         => ['required', 'array', 'min:1'],
            'role_ids.*'       => ['integer', 'exists:roles,id'],
            'form_answers'     => ['nullable', 'array'],
            'task_ids'         => ['required', 'array', 'min:1'],
            'task_ids.*'       => ['integer', 'exists:tasks,id'],
            'attending_dinner' => ['required', 'boolean'],
            'dinner_notes'     => ['nullable', 'string', 'max:1000'],
        ]);

        // Guardar dades (transacció aïllada del mail)
        $submission = DB::transaction(function () use ($validated) {
            $submission = Submission::create([
                'full_name'        => $validated['full_name'],
                'birth_date'       => $validated['birth_date'],
                'email'            => $validated['email'],
                'phone'            => $validated['phone'] ?? null,
                'guardian_name'    => $validated['guardian_name'] ?? null,
                'guardian_phone'   => $validated['guardian_phone'] ?? null,
                'form_answers'     => $validated['form_answers'] ?? [],
                'attending_dinner' => $validated['attending_dinner'],
                'dinner_notes'     => $validated['dinner_notes'] ?? null, // auto-encrypted
                'status'           => 'submitted',
            ]);

            $submission->roles()->sync($validated['role_ids']);

            $taskIds = collect($validated['task_ids'])->filter(function ($taskId) {
                $task = Task::find($taskId);
                return $task && $task->hasCapacity();
            });
            $submission->tasks()->sync($taskIds);

            if ($submission->attending_dinner) {
                $submission->update(['qr_token' => Str::uuid()]);
            }

            return $submission;
        });

        // Enviar mail FORA de la transacció
        // Així si el mail falla, la inscripció ja està guardada igualment.
        try {
            $signedUrl = URL::temporarySignedRoute(
                'magic-link.verify',
                now()->addDays(30),
                ['token' => $submission->access_code]
            );

            Mail::to($submission->email)
                ->send(new MagicLinkMail($submission, $signedUrl));

        } catch (\Exception $e) {
            // Mail ha fallat però la inscripció s'ha guardat correctament.
            // L'admin pot reenviar manualment des del panell.
            Log::error('Magic link mail failed', [
                'submission_id' => $submission->id,
                'email'         => $submission->email,
                'error'         => $e->getMessage(),
            ]);
        }

        return Inertia::render('Form/Confirmation');
    }

    // GET/la-meva-inscripcio

    public function show(): Response
    {
        $submission = Submission::with(['roles', 'tasks'])
            ->findOrFail(session('submission_id'));

        return Inertia::render('Submission/Show', [
            'submission' => [
                'full_name'        => $submission->full_name,
                'email'            => $submission->email,
                'access_code'      => $submission->access_code,
                'attending_dinner' => $submission->attending_dinner,
                'qr_token'         => $submission->qr_token,
                'roles'            => $submission->roles->pluck('name'),
                'tasks'            => $submission->tasks->map(fn ($t) => [
                    'title'      => $t->title,
                    'start_time' => $t->start_time->format('d/m H:i'),
                    'end_time'   => $t->end_time->format('H:i'),
                    'location'   => $t->location,
                ]),
                'form_answers' => $submission->form_answers,
            ],
        ]);
    }

    // PATCH/la-meva-inscripcio

    public function update(Request $request)
    {
        $submission = Submission::findOrFail(session('submission_id'));

        $validated = $request->validate([
            'attending_dinner' => ['sometimes', 'boolean'],
            'dinner_notes'     => ['nullable', 'string', 'max:1000'],
            'task_ids'         => ['sometimes', 'array'],
            'task_ids.*'       => ['integer', 'exists:tasks,id'],
        ]);

        if (isset($validated['task_ids'])) {
            $taskIds = collect($validated['task_ids'])->filter(function ($taskId) use ($submission) {
                $task = Task::find($taskId);
                return $task && (
                        $submission->tasks->contains($taskId) || $task->hasCapacity()
                    );
            });
            $submission->tasks()->sync($taskIds);
            unset($validated['task_ids']);
        }

        $submission->update($validated);

        return back()->with('flash', [
            'type'    => 'success',
            'message' => 'Inscripció actualitzada correctament.',
        ]);
    }

    // Private

    private function tasksForWizard(): array
    {
        return Task::active()
            ->withCount('submissions')
            ->get()
            ->map(fn ($task) => [
                'id'                 => $task->id,
                'title'              => $task->title,
                'description'        => $task->description,
                'start_time'         => $task->start_time->format('Y-m-d H:i'),
                'end_time'           => $task->end_time->format('H:i'),
                'location'           => $task->location,
                'color'              => $task->color,
                'capacity'           => $task->capacity,
                'current_signups'    => $task->submissions_count,
                'remaining_capacity' => max(0, $task->capacity - $task->submissions_count),
                'visible_to_roles'   => $task->visible_to_roles,
            ])
            ->toArray();
    }
}
