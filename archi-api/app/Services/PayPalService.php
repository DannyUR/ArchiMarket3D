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
    }

    /**
     * Crear una orden de pago - Versión simplificada sin ItemList complicado
     */
    public function createOrder($shoppingId, $total, $items, $returnUrl, $cancelUrl, $metadata = [])
    {
        try {
            \Log::info('📊 PARÁMETROS QUE ENVÍO A PAYPAL:', [
                'shopping_id' => $shoppingId,
                'total' => $total,
                'total_type' => gettype($total),
                'items_count' => count($items),
                'items' => $items,
                'returnUrl' => $returnUrl,
                'cancelUrl' => $cancelUrl
            ]);

            // Crear una orden PayPal SIMPLE sin usar el SDK problemático
            $paymentData = [
                'intent' => 'sale',
                'payer' => [
                    'payment_method' => 'paypal'
                ],
                'transactions' => [
                    [
                        'amount' => [
                            'total' => round($total, 2),
                            'currency' => 'USD'
                        ],
                        'description' => 'Compra en ArchiMarket3D - ' . count($items) . ' modelo(s)',
                        'invoice_number' => $shoppingId . '-' . time()
                    ]
                ],
                'redirect_urls' => [
                    'return_url' => $returnUrl,
                    'cancel_url' => $cancelUrl
                ]
            ];

            \Log::info('📤 JSON que se enviará a PayPal:', $paymentData);

            // Hacer llamada directa a PayPal API con curl
            $response = $this->callPayPalAPI('/v1/payments/payment', $paymentData);

            if (!$response || !isset($response['id'])) {
                throw new Exception('No se recibió respuesta válida de PayPal');
            }

            // Buscar el link de aprobación
            $approvalUrl = null;
            if (isset($response['links']) && is_array($response['links'])) {
                foreach ($response['links'] as $link) {
                    if (isset($link['rel']) && $link['rel'] === 'approval_url') {
                        $approvalUrl = $link['href'];
                        break;
                    }
                }
            }

            if (!$approvalUrl) {
                throw new Exception('No se encontró URL de aprobación en respuesta de PayPal');
            }

            \Log::info('✅ Orden PayPal creada', [
                'shopping_id' => $shoppingId,
                'payment_id' => $response['id'],
                'approval_url' => $approvalUrl
            ]);

            return [
                'success' => true,
                'payment_id' => $response['id'],
                'approval_url' => $approvalUrl
            ];

        } catch (Exception $e) {
            \Log::error('❌ Error creando orden PayPal: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return [
                'success' => false,
                'message' => 'Error al crear la orden de pago',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Llamada directa a PayPal API usando curl
     */
    private function callPayPalAPI($endpoint, $data)
    {
        // Primero obtener access token
        $token = $this->getAccessToken();
        if (!$token) {
            throw new Exception('No se pudo obtener token de acceso de PayPal');
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

        \Log::info('PayPal API Response', [
            'endpoint' => $endpoint,
            'http_code' => $httpCode,
            'response' => $response
        ]);

        if ($httpCode >= 400) {
            \Log::error('PayPal API Error', [
                'code' => $httpCode,
                'response' => $response
            ]);
            return null;
        }

        return json_decode($response, true);
    }

    /**
     * Obtener access token de PayPal
     */
    private function getAccessToken()
    {
        $url = $this->getAPIURL() . '/v1/oauth2/token';
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERPWD, $this->clientId . ':' . $this->secret);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json', 'Accept-Language: en_US']);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, 'grant_type=client_credentials');

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode != 200) {
            \Log::error('PayPal OAuth Error', ['code' => $httpCode, 'response' => $response]);
            return null;
        }

        $result = json_decode($response, true);
        return $result['access_token'] ?? null;
    }

    /**
     * Obtener URL base según el modo
     */
    private function getAPIURL()
    {
        if ($this->mode === 'live') {
            return 'https://api.paypal.com';
        }
        return 'https://api.sandbox.paypal.com';
    }

    /**
     * Ejecutar/capturar el pago
     */
    public function executePayment($paymentId, $payerId)
    {
        try {
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

            \Log::info('✅ Pago ejecutado', [
                'payment_id' => $paymentId,
                'state' => $result['state'] ?? 'unknown'
            ]);

            return [
                'success' => true,
                'payment' => $result,
                'state' => $result['state'] ?? 'unknown'
            ];

        } catch (Exception $e) {
            \Log::error('❌ Error ejecutando pago: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Error al ejecutar el pago',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verificar webhook
     */
    public function verifyWebhook($headers, $body)
    {
        return true;
    }
}