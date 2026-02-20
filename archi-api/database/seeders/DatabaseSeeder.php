<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UsersSeeder::class,
            CategoriesSeeder::class,
            ModelsSeeder::class,
            LicensesSeeder::class,
            MixedRealitySeeder::class,
            ModelFilesSeeder::class,
            ShoppingSeeder::class,
            ShoppingDetailsSeeder::class,
            ReviewsSeeder::class,
        ]);
    }

}
