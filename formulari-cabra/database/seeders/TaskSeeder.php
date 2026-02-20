<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Tasks are seeded from the visual schedule shown in the PPTX.
     * Dates: 10/08/2026 (night) and 11/08/2026 (morning, afternoon, night).
     *
     * Colors:
     *   - All-roles tasks: blue   #3B82F6
     *   - Banda-only:      amber  #F59E0B
     *   - Danses-only:     purple #A855F7
     *   - Organització:    green  #22C55E
     *   - Col·laboradors:  orange #F97316
     */
    public function run(): void
    {
        $tasks = [
            // ── 10 agost (nit) ───────────────────────────────────────────

            [
                'title'            => 'Baixada del Castell',
                'description'      => 'Actuació de la Banda Àuria a la baixada del castell',
                'start_time'       => '2026-08-10 21:00:00',
                'end_time'         => '2026-08-10 23:00:00',
                'capacity'         => 60,
                'location'         => 'Castell',
                'color'            => '#F59E0B',
                'visible_to_roles' => ['banda-auria'],
            ],

            // ── 11 agost (matí) ──────────────────────────────────────────

            [
                'title'            => 'Tallers matí',
                'description'      => 'Tallers participatius del matí',
                'start_time'       => '2026-08-11 10:00:00',
                'end_time'         => '2026-08-11 12:00:00',
                'capacity'         => 30,
                'location'         => 'Centre civic',
                'color'            => '#22C55E',
                'visible_to_roles' => null, // Visible to all
            ],
            [
                'title'            => 'Passacarrers matí (Contrabanda)',
                'description'      => 'Passacarrers del matí amb la Contrabanda',
                'start_time'       => '2026-08-11 11:00:00',
                'end_time'         => '2026-08-11 13:00:00',
                'capacity'         => 40,
                'location'         => 'Carrer Major',
                'color'            => '#F59E0B',
                'visible_to_roles' => ['banda-auria'],
            ],
            [
                'title'            => 'Trasllat Taverna (Parc → Cau)',
                'description'      => 'Ajuda en el trasllat del material de la taverna',
                'start_time'       => '2026-08-11 09:00:00',
                'end_time'         => '2026-08-11 11:00:00',
                'capacity'         => 10,
                'location'         => 'Parc Municipal',
                'color'            => '#22C55E',
                'visible_to_roles' => ['organitzacio', 'collaboradors'],
            ],

            // ── 11 agost (tarda) ─────────────────────────────────────────

            [
                'title'            => 'Muntar Plaça',
                'description'      => 'Preparació i muntatge de la plaça per la festa',
                'start_time'       => '2026-08-11 15:00:00',
                'end_time'         => '2026-08-11 17:00:00',
                'capacity'         => 20,
                'location'         => 'Plaça Major',
                'color'            => '#22C55E',
                'visible_to_roles' => ['organitzacio', 'collaboradors'],
            ],
            [
                'title'            => 'Passacarrers tarda (Banda)',
                'description'      => 'Passacarrers de la tarda amb la Banda Àuria',
                'start_time'       => '2026-08-11 17:00:00',
                'end_time'         => '2026-08-11 19:00:00',
                'capacity'         => 60,
                'location'         => 'Carrer Major',
                'color'            => '#F59E0B',
                'visible_to_roles' => ['banda-auria'],
            ],
            [
                'title'            => 'Actuació de Teatre',
                'description'      => 'Representació teatral de la tarda',
                'start_time'       => '2026-08-11 17:30:00',
                'end_time'         => '2026-08-11 19:00:00',
                'capacity'         => 25,
                'location'         => 'Plaça Major',
                'color'            => '#EC4899',
                'visible_to_roles' => ['teatre'],
            ],

            // ── 11 agost (nit) ───────────────────────────────────────────

            [
                'title'            => 'Fer Sopar',
                'description'      => 'Ajuda en la preparació i servei del sopar de festa',
                'start_time'       => '2026-08-11 19:00:00',
                'end_time'         => '2026-08-11 21:30:00',
                'capacity'         => 15,
                'location'         => 'Cuina del Cau',
                'color'            => '#F97316',
                'visible_to_roles' => ['organitzacio', 'collaboradors'],
            ],
            [
                'title'            => 'Balls (Banda)',
                'description'      => 'Actuació de la Banda Àuria als balls de la nit',
                'start_time'       => '2026-08-11 21:00:00',
                'end_time'         => '2026-08-11 23:00:00',
                'capacity'         => 60,
                'location'         => 'Plaça Major',
                'color'            => '#F59E0B',
                'visible_to_roles' => ['banda-auria'],
            ],
            [
                'title'            => 'Balls (Danses)',
                'description'      => 'Participació en els balls tradicionals de la nit',
                'start_time'       => '2026-08-11 21:00:00',
                'end_time'         => '2026-08-11 23:00:00',
                'capacity'         => 50,
                'location'         => 'Plaça Major',
                'color'            => '#A855F7',
                'visible_to_roles' => ['danses'],
            ],
            [
                'title'            => 'Tancada de la Cabra',
                'description'      => 'Actuació final de la Banda Àuria per tancar la festa',
                'start_time'       => '2026-08-11 23:00:00',
                'end_time'         => '2026-08-12 00:30:00',
                'capacity'         => 60,
                'location'         => 'Plaça Major',
                'color'            => '#F59E0B',
                'visible_to_roles' => ['banda-auria'],
            ],
            [
                'title'            => 'Torn de Barra (nit)',
                'description'      => 'Torn de barra durant la festa',
                'start_time'       => '2026-08-11 21:00:00',
                'end_time'         => '2026-08-11 23:30:00',
                'capacity'         => 6,
                'location'         => 'Taverna del Cau',
                'color'            => '#F97316',
                'visible_to_roles' => ['organitzacio', 'collaboradors'],
            ],
        ];

        foreach ($tasks as $taskData) {
            Task::updateOrCreate(
                [
                    'title'      => $taskData['title'],
                    'start_time' => $taskData['start_time'],
                ],
                $taskData
            );
        }

        $this->command->info('✅ Tasks seeded (' . count($tasks) . ' tasks)');
    }
}
