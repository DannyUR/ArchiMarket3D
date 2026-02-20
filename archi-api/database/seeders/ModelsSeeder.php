<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ModelsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('models')->insert([
            [
                'name'=> 'Casa Moderna 2 Pisos',
                'description'=> 'Modelo residencial completo con planos arquitectónicos y estructura.',
                'price'=> 99.99,
                'format'=> 'RVT',
                'size_mb'=> 45.50,
                'category_id'=> 1,
                'publication_date'=> now(),
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Edificio Corporativo',
                'description'=> 'Modelo estructural para edificio de oficinas de 10 niveles.',
                'price'=> 150.00,
                'format'=> 'IFC',
                'size_mb'=> 80.20,
                'category_id'=> 2,
                'publication_date'=> now(),
                'created_at'=> now(),
                'updated_at'=> now()
            ]
        ]);

    }
}
