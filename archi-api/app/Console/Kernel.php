<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Programar importación semanal de modelos
        $schedule->command('sketchfab:import architecture --limit=20')
                 ->weekly()
                 ->sundays()
                 ->at('02:00')
                 ->withoutOverlapping()
                 ->appendOutputTo(storage_path('logs/sketchfab-import.log'));

        // También puedes importar otras categorías
        $schedule->command('sketchfab:import building --limit=10')
                 ->weekly()
                 ->mondays()
                 ->at('02:00')
                 ->withoutOverlapping()
                 ->appendOutputTo(storage_path('logs/sketchfab-import.log'));
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}