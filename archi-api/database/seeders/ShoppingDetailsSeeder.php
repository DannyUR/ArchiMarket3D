<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ShoppingDetailsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('shopping_details')->insert([
            [
                'shopping_id'=> 1,
                'model_id'=> 1,
                'unit_price'=> 99.99,
                'created_at'=> now(),
                'updated_at'=> now()
            ]
        ]);

    }
}
