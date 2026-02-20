<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        DB::table('users')->insert([
            [
                'name'=> 'Rafael',
                'email' => 'rafa@gmail.com',
                'password'=> Hash::make('1234567890'),
                'user_type' => 'admin',
                'company' => 'ArchiMarket3D',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Laura Gómez',
                'email' => 'laura@constructora.com',
                'password'=> Hash::make('1234567890'),
                'user_type' => 'company',
                'company' => 'Constructora del Norte',
                'created_at'=> now(),
                'updated_at'=> now()
            ]
        ]);

        
    }
}
