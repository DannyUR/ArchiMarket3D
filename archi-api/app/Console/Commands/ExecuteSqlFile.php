<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExecuteSqlFile extends Command
{
    protected $signature = 'db:execute-sql {file}';
    protected $description = 'Ejecuta un archivo SQL';

    public function handle()
    {
        $filePath = $this->argument('file');
        
        if (!file_exists($filePath)) {
            $this->error("❌ Archivo no encontrado: $filePath");
            return 1;
        }
        
        $this->info("🔄 Ejecutando SQL desde: $filePath");
        
        $sql = file_get_contents($filePath);
        $statements = array_filter(
            explode(';', $sql),
            fn($s) => trim($s) !== ''
        );
        
        $bar = $this->output->createProgressBar(count($statements));
        $executed = 0;
        
        foreach ($statements as $statement) {
            try {
                DB::statement(trim($statement));
                $executed++;
            } catch (\Exception $e) {
                $this->warn("\n⚠️ Error: " . $e->getMessage());
            }
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("✅ Ejecutados: {$executed} / " . count($statements));
        
        return 0;
    }
}
