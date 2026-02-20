<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ShoppingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('shopping')->insert([
            [
                'user_id'=> 2,
                'purchase_date' => now(),
                'total'=> 199.99,
                'created_at'=> now(),
                'updated_at'=> now()
            ]
        ]);

    }
}
