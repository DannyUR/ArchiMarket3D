<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ReviewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('reviews')->insert([
            [
                'user_id'=> 2,
                'model_id'=> 1,
                'rating'=> 5,
                'comment'=> 'Excelente modelo, muy detallado y fácil de integrar en BIM.',
                'created_at'=> now(),
                'updated_at'=> now()
            ]
        ]);

    }
}
