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
                'user_id'=> '1',
                'shop_date' => date("Y-m-d h:m:s"),
                'total'=>99.99
            ]
        ]);
    }
}
