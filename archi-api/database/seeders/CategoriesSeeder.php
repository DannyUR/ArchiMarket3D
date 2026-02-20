<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('categories')->insert([
            [
                'name'=> 'Arquitectura Residencial',
                'description' => 'Modelos 3D de casas, departamentos y conjuntos habitacionales.',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Estructural',
                'description' => 'Modelos estructurales para construcción de edificios y puentes.',
                'created_at'=> now(),
                'updated_at'=> now()
            ]
        ]);

    }
}
