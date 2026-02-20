<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireSubmissionSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! session()->has('submission_id')) {
            return redirect()->route('magic-link.form')
                ->with('flash', [
                    'type'    => 'info',
                    'message' => 'Necessites accedir primer per veure la teva inscripció.',
                ]);
        }

        return $next($request);
    }
}
