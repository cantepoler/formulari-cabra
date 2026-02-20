<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name'        => 'Organització',
                'slug'        => 'organitzacio',
                'description' => 'Membres de les comissions organitzatives (taverna, poble, etc.)',
                'sort_order'  => 1,
            ],
            [
                'name'        => 'Banda Àuria',
                'slug'        => 'banda-auria',
                'description' => 'Músics de la Banda Àuria i la Contrabanda',
                'sort_order'  => 2,
            ],
            [
                'name'        => 'Danses',
                'slug'        => 'danses',
                'description' => 'Participants en les activitats de ball i danses tradicionals',
                'sort_order'  => 3,
            ],
            [
                'name'        => 'Teatre',
                'slug'        => 'teatre',
                'description' => 'Participants en les activitats de teatre',
                'sort_order'  => 4,
            ],
            [
                'name'        => 'Col·laboradors',
                'slug'        => 'collaboradors',
                'description' => 'Pares i gent que vol col·laborar sense rol d\'organització (butis, torn de barra, etc.)',
                'sort_order'  => 5,
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['slug' => $role['slug']], $role);
        }

        $this->command->info('✅ Roles seeded (' . count($roles) . ' roles)');
    }
}
