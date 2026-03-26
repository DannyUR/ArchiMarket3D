<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    DB::statement('
        CREATE TABLE IF NOT EXISTS user_licenses (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            model_id BIGINT UNSIGNED NOT NULL,
            shopping_id BIGINT UNSIGNED NOT NULL,
            license_type ENUM("personal", "business", "unlimited") NOT NULL,
            price_paid DECIMAL(10, 2) NOT NULL,
            expires_at DATE NULL,
            is_active BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            UNIQUE KEY unique_user_model (user_id, model_id),
            CONSTRAINT fk_user_licenses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_user_licenses_model FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE,
            CONSTRAINT fk_user_licenses_shopping FOREIGN KEY (shopping_id) REFERENCES shopping(id) ON DELETE CASCADE
        )
    ');
    echo "✅ Tabla user_licenses creada exitosamente\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
