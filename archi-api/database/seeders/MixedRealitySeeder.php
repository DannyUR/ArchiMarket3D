<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MixedRealitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('mixed_reality')->insert([
            [
                'model_id'=> 1,
                'compatible'=> true,
                'platform'=> 'HoloLens',
                'notes'=> 'Optimizado para visualización en obra.',
                'created_at'=> now(),
                'updated_at'=> now()
            ]
        ]);

    }
}
