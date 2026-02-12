<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use App\Models\Task;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Elimino tota l'informació de les taules per diferents execucions del mètode
        \DB::statement('TRUNCATE TABLE roles RESTART IDENTITY CASCADE');
        \DB::statement('TRUNCATE TABLE tasks RESTART IDENTITY CASCADE');

        $roles = [
            [
                'name' => 'Organització',
                'slug' => 'organitzacio',
                'color' => 'bg-red-100 text-red-800',
            ],
            [
                'name' => 'Banda Auria',
                'slug' => 'banda',
                'color' => 'bg-yellow-100 text-yellow-800',
            ],
            [
                'name' => 'Danses',
                'slug' => 'danses',
                'color' => 'bg-green-100 text-green-800',
            ],
            [
                'name' => 'Teatre',
                'slug' => 'teatre',
                'color' => 'bg-purple-100 text-purple-800',
            ],
            [
                'name' => 'Col·laboradors',
                'slug' => 'colla',
                'color' => 'bg-blue-100 text-blue-800',
            ],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }

        $this->command->info('Rols creats correctament!');

        $dia10 = Carbon::create(2026, 8, 10);
        $dia11 = Carbon::create(2026, 8, 11);

        $tasks = [
            [
                'title' => 'Muntar plaça',
                'category' => 'Logística',
                'start_time' => $dia10->copy()->setTime(17, 0),
                'end_time' => $dia10->copy()->setTime(19, 0),
                'capacity' => 15,
            ],
            [
                'title' => 'Botifarres (Sopar)',
                'category' => 'Logística',
                'start_time' => $dia10->copy()->setTime(19, 0),
                'end_time' => $dia10->copy()->setTime(21, 0),
                'capacity' => 6,
            ],
            [
                'title' => 'Cercavila Nocturna',
                'category' => 'Públic',
                'start_time' => $dia10->copy()->setTime(22, 0),
                'end_time' => $dia10->copy()->setTime(23, 30),
                'capacity' => null,
            ],

            // --- NIT DEL 10 AL 11: BARRA (Els torns crítics) ---
            [
                'title' => 'Torn 1 Barra',
                'category' => 'Barra',
                'start_time' => $dia11->copy()->setTime(0, 0),
                'end_time' => $dia11->copy()->setTime(1, 0),
                'capacity' => 4,
            ],
            [
                'title' => 'Torn 2 Barra',
                'category' => 'Barra',
                'start_time' => $dia11->copy()->setTime(1, 0),
                'end_time' => $dia11->copy()->setTime(2, 0),
                'capacity' => 4,
            ],
            [
                'title' => 'Torn 3 Barra',
                'category' => 'Barra',
                'start_time' => $dia11->copy()->setTime(2, 0),
                'end_time' => $dia11->copy()->setTime(3, 0),
                'capacity' => 4,
            ],
            [
                'title' => 'Torn 4 Barra (La mort)',
                'category' => 'Barra',
                'start_time' => $dia11->copy()->setTime(3, 0),
                'end_time' => $dia11->copy()->setTime(4, 0),
                'capacity' => 4,
            ],

            // DIA 11
            [
                'title' => 'Tallers Infantils',
                'category' => 'Públic',
                'start_time' => $dia11->copy()->setTime(11, 0),
                'end_time' => $dia11->copy()->setTime(13, 0),
                'capacity' => 8, // Monitors necessaris
            ],
            [
                'title' => 'Cercavila Matí',
                'category' => 'Públic',
                'start_time' => $dia11->copy()->setTime(12, 0),
                'end_time' => $dia11->copy()->setTime(14, 0),
                'capacity' => null,
            ],
            [
                'title' => 'Recollir i Netejar Plaça',
                'category' => 'Logística',
                'start_time' => $dia11->copy()->setTime(14, 0), // Després del vermut
                'end_time' => $dia11->copy()->setTime(16, 0),
                'capacity' => 10,
            ],
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }

        $this->command->info('Tasques creades correctament!');

    }
}
