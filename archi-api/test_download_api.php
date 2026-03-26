<?php

// Test modelos 3, 10, 1, 2
$modelsToTest = [3, 10, 1, 2];

foreach ($modelsToTest as $modelId) {
    $curl = curl_init("http://127.0.0.1/api/models/$modelId/download-info");
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_TIMEOUT, 5);
    curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 5);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    echo "🔍 Modelo $modelId (HTTP $httpCode):\n";
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        echo "  - is_downloadable: " . ($data['is_downloadable'] ? 'true' : 'false') . "\n";
        echo "  - formats: " . json_encode($data['available_formats'] ?? []) . "\n";
    } else {
        echo "  - Error: $response\n";
    }
    echo "\n";
}
