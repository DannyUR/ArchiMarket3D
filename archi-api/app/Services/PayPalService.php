<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Exception;

class PayPalService
{
    protected $clientId;
    protected $secret;
    protected $mode;

    public function __construct()
    {
        $this->mode = config('services.paypal.mode', 'sandbox');
        $this->clientId = config('services.paypal.client_id');
        $this->secret = config('services.paypal.secret');
        
        Log::info('PayPalService inicializado', [
            'mode' => $this->mode,
            'client_id_present' => !empty($this->clientId),
            'secret_present' => !empty($this->secret)
        ]);
    }

    /**
     * Crear una orden de pago - Versión CORREGIDA
     */
    public function createOrder($shoppingId, $total, $items, $returnUrl, $cancelUrl, $metadata = [])
    {
        try {
            Log::info('=== CREAR ORDEN PAYPAL ===', [
                'shopping_id' => $shoppingId,
                'total' => $total,
                'items_count' => count($items)
            ]);

            // Calcular total correctamente si viene como string
            $totalAmount = floatval($total);
            
            // Estructura CORRECTA para PayPal API v1
            $paymentData = [
                'intent' => 'sale',
                'payer' => [
                    'payment_method' => 'paypal'
                ],
                'transactions' => [
                    [
                        'amount' => [
                            'total' => number_format($totalAmount, 2, '.', ''),
                            'currency' => 'USD',
                            'details' => [
                                'subtotal' => number_format($totalAmount, 2, '.', '')
                            ]
                        ],
                        'description' => 'Compra en ArchiMarket3D - ' . count($items) . ' modelo(s)',
                        'invoice_number' => $shoppingId . '-' . time(),
                        'custom' => json_encode([
                            'shopping_id' => $shoppingId,
                            'user_id' => auth()->id() ?? ($metadata['user_id'] ?? null)
                        ]),
                        'item_list' => [
                            'items' => []
                        ]
                    ]
                ],
                'redirect_urls' => [
                    'return_url' => $returnUrl,
                    'cancel_url' => $cancelUrl
                ]
            ];
            
            // Agregar items si hay
            foreach ($items as $index => $item) {
                $model = \App\Models\Model3D::find($item['model_id']);
                $itemPrice = $this->calculateItemPrice($model->price, $item['license_type']);
                
                $paymentData['transactions'][0]['item_list']['items'][] = [
                    'name' => $model->name,
                    'sku' => 'MODEL-' . $item['model_id'],
                    'price' => number_format($itemPrice, 2, '.', ''),
                    'currency' => 'USD',
                    'quantity' => $item['quantity'] ?? 1
                ];
            }

            Log::info('📤 Enviando a PayPal:', $paymentData);

            // Hacer llamada a PayPal
            $response = $this->callPayPalAPI('/v1/payments/payment', $paymentData);

            if (!$response || !isset($response['id'])) {
                Log::error('Respuesta inválida de PayPal', ['response' => $response]);
                throw new Exception('No se recibió respuesta válida de PayPal');
            }

            // Buscar URL de aprobación
            $approvalUrl = null;
            foreach ($response['links'] as $link) {
                if ($link['rel'] === 'approval_url') {
                    $approvalUrl = $link['href'];
                    break;
                }
            }

            if (!$approvalUrl) {
                throw new Exception('No se encontró URL de aprobación');
            }

            Log::info('✅ Orden PayPal creada', [
                'payment_id' => $response['id'],
                'approval_url' => $approvalUrl
            ]);

            return [
                'success' => true,
                'payment_id' => $response['id'],
                'approval_url' => $approvalUrl
            ];

        } catch (Exception $e) {
            Log::error('❌ Error en createOrder: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Calcular precio según tipo de licencia
     */
    private function calculateItemPrice($basePrice, $licenseType)
    {
        $multipliers = [
            'personal' => 1.0,
            'business' => 2.5,
            'unlimited' => 5.0
        ];
        
        $multiplier = $multipliers[$licenseType] ?? 1.0;
        return round($basePrice * $multiplier, 2);
    }

    /**
     * Llamada a PayPal API
     */
    private function callPayPalAPI($endpoint, $data)
    {
        $token = $this->getAccessToken();
        if (!$token) {
            throw new Exception('No se pudo obtener token de acceso');
        }

        $url = $this->getAPIURL() . $endpoint;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        Log::info('PayPal API Response', [
            'endpoint' => $endpoint,
            'http_code' => $httpCode,
            'response' => $response
        ]);

        if ($httpCode >= 400) {
            Log::error('PayPal API Error', [
                'code' => $httpCode,
                'response' => $response
            ]);
            return null;
        }

        return json_decode($response, true);
    }

    /**
     * Obtener Access Token
     */
    private function getAccessToken()
    {
        $url = $this->getAPIURL() . '/v1/oauth2/token';
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERPWD, $this->clientId . ':' . $this->secret);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, 'grant_type=client_credentials');

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            Log::error('PayPal OAuth Error', [
                'code' => $httpCode,
                'response' => $response
            ]);
            return null;
        }

        $result = json_decode($response, true);
        return $result['access_token'] ?? null;
    }

    /**
     * Obtener URL base de PayPal
     */
    private function getAPIURL()
    {
        if ($this->mode === 'live') {
            return 'https://api.paypal.com';
        }
        return 'https://api.sandbox.paypal.com';
    }

    /**
     * Ejecutar/Capturar pago
     */
    public function executePayment($paymentId, $payerId)
    {
        try {
            Log::info('=== EJECUTAR PAGO ===', [
                'payment_id' => $paymentId,
                'payer_id' => $payerId
            ]);
            
            $token = $this->getAccessToken();
            if (!$token) {
                throw new Exception('No se pudo obtener token de acceso');
            }

            $url = $this->getAPIURL() . '/v1/payments/payment/' . $paymentId . '/execute';
            $data = ['payer_id' => $payerId];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $token
            ]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $result = json_decode($response, true);

            if ($httpCode !== 200 && $httpCode !== 201) {
                throw new Exception('Error ejecutando pago: ' . ($result['message'] ?? 'Unknown error'));
            }

            Log::info('✅ Pago ejecutado', [
                'state' => $result['state'] ?? 'completed'
            ]);

            return [
                'success' => true,
                'state' => $result['state'] ?? 'completed',
                'payment' => $result
            ];

        } catch (Exception $e) {
            Log::error('❌ Error en executePayment: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

        /**
     * Capturar una orden de PayPal (para API v2 - usada por app móvil)
     */
    public function captureOrder($orderId)
    {
        try {
            \Log::info('=== CAPTURAR ORDEN PAYPAL ===', ['order_id' => $orderId]);
            
            $token = $this->getAccessToken();
            if (!$token) {
                throw new Exception('No se pudo obtener token de acceso');
            }
            
            // Usar API v2 de PayPal
            $url = $this->getAPIURL() . '/v2/checkout/orders/' . $orderId . '/capture';
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $token
            ]);
            curl_setopt($ch, CURLOPT_POST, true);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            $result = json_decode($response, true);
            
            \Log::info('Respuesta PayPal capture:', [
                'http_code' => $httpCode,
                'response' => $result
            ]);
            
            if ($httpCode === 201 || $httpCode === 200) {
                return [
                    'success' => true,
                    'capture_id' => $result['id'] ?? $orderId,
                    'status' => $result['status'] ?? 'COMPLETED'
                ];
            }
            
            return [
                'success' => false,
                'message' => $result['message'] ?? 'Error capturando pago'
            ];
            
        } catch (Exception $e) {
            \Log::error('❌ Error en captureOrder: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}