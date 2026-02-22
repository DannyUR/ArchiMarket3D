<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class LicensesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
            DB::table('licenses')->insert([
        [
            'model_id' => 1,
            'type' => 'personal',
            'description' => 'Licencia personal - 1 año',
            'created_at' => now(),
            'updated_at' => now()
        ],
        [
            'model_id' => 1,
            'type' => 'business',
            'description' => 'Licencia empresarial - 3 años',
            'created_at' => now(),
            'updated_at' => now()
        ],
        [
            'model_id' => 1,
            'type' => 'unlimited',
            'description' => 'Licencia ilimitada - perpetua',
            'created_at' => now(),
            'updated_at' => now()
        ],
    ]);

    }
}
