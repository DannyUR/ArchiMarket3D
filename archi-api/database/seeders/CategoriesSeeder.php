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
            // ESTRUCTURALES
            [
                'name'=> 'Estructuras de Acero',
                'description' => 'Estructuras metálicas, vigas, columnas y elementos portantes',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Estructuras de Concreto',
                'description' => 'Losas, vigas y pilares de hormigón armado',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Cimentaciones',
                'description' => 'Zapatas, pilotes y sistemas de cimentación',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Elementos Portantes',
                'description' => 'Muros de carga, arcos y otros elementos estructurales',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            
            // ARQUITECTURA
            [
                'name'=> 'Arquitectura Residencial',
                'description' => 'Casas, departamentos, oficinas y conjuntos habitacionales',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Arquitectura Comercial',
                'description' => 'Edificios comerciales, centros comerciales y oficinas',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Fachadas y Cerramientos',
                'description' => 'Sistemas de fachadas, muros cortina y cerramientos',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Cubiertas y Azoteas',
                'description' => 'Sistemas de cobertura y azoteas',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            
            // INSTALACIONES MEP
            [
                'name'=> 'Sistemas Eléctricos',
                'description' => 'Instalaciones eléctricas, cableado y sistemas de distribución',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Fontanería y Tuberías',
                'description' => 'Sistemas de agua, desagüe y tuberías',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'HVAC (Climatización)',
                'description' => 'Sistemas de calefacción, ventilación y aire acondicionado',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Protección Contra Incendios',
                'description' => 'Sistemas de riego, detección y protección contra incendios',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            
            // MOBILIARIO
            [
                'name'=> 'Mobiliario de Oficina',
                'description' => 'Escritorios, sillas, armarios y equipamiento de oficina',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Mobiliario Residencial',
                'description' => 'Sofás, camas, mesas y muebles para el hogar',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Mobiliario Urbano',
                'description' => 'Bancos, luminarias, papeleras y equipamiento urbano',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Equipamiento',
                'description' => 'Máquinas expendedoras, señalética y equipos varios',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            
            // MAQUINARIA
            [
                'name'=> 'Equipo Pesado',
                'description' => 'Grúas, excavadoras, montacargas y equipamiento pesado',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Maquinaria Industrial',
                'description' => 'Maquinaria para procesos industriales y manufactura',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Equipo de Construcción',
                'description' => 'Andamios, hormigoneras y equipos de construcción',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            
            // URBANISMO
            [
                'name'=> 'Infraestructura Vial',
                'description' => 'Calles, carreteras, puentes y estructuras de transporte',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Espacios Públicos',
                'description' => 'Parques, plazas y espacios comunitarios',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Paisajismo',
                'description' => 'Elementos paisajísticos, vegetación y ornamentación',
                'created_at'=> now(),
                'updated_at'=> now()
            ],
            [
                'name'=> 'Redes de Servicio',
                'description' => 'Tuberías subterráneas, ductos y redes de servicios',
                'created_at'=> now(),
                'updated_at'=> now()
            ]
        ]);

    }
}
