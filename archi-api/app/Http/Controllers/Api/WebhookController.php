<?php
// app/Http/Controllers/Api/WebhookController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebhookLog;
use App\Models\Shopping;
use App\Models\UserLicense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Manejar webhooks de pago (PayPal, Stripe, etc)
     */
    public function handlePayment(Request $request)
    {
        // Detectar el proveedor por la URL o headers
        $provider = $this->detectProvider($request);
        
        // Registrar que llegó el webhook
        $log = WebhookLog::create([
            'provider' => $provider,
            'event_type' => $request->event_type ?? $request->type ?? 'unknown',
            'payload' => json_encode($request->all()),
            'status' => 'received',
            'ip_address' => $request->ip()
        ]);

        try {
            // Procesar según el proveedor
            $result = match($provider) {
                'stripe' => $this->handleStripeWebhook($request),
                'paypal' => $this->handlePayPalWebhook($request),
                'mercadopago' => $this->handleMercadoPagoWebhook($request),
                default => throw new \Exception("Proveedor no soportado: {$provider}")
            };

            // Actualizar log con éxito
            $log->update([
                'status' => 'processed',
                'response' => json_encode(['message' => 'Webhook procesado correctamente'])
            ]);

            return response()->json(['received' => true]);

        } catch (\Exception $e) {
            // Actualizar log con error
            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()
            ]);

            // Log para debugging
            Log::error('Webhook failed', [
                'provider' => $provider,
                'error' => $e->getMessage(),
                'payload' => $request->all()
            ]);

            return response()->json([
                'error' => 'Webhook processing failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Manejar webhooks de Stripe
     */
    private function handleStripeWebhook(Request $request)
    {
        $event = $request->all();

        switch ($event['type']) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event['data']['object'];
                $this->processSuccessfulPayment('stripe', $paymentIntent['id'], $paymentIntent);
                break;

            case 'payment_intent.payment_failed':
                $paymentIntent = $event['data']['object'];
                $this->processFailedPayment('stripe', $paymentIntent['id'], $paymentIntent);
                break;

            default:
                // Ignorar otros tipos de eventos
                break;
        }

        return true;
    }

    /**
     * Manejar webhooks de PayPal
     */
    private function handlePayPalWebhook(Request $request)
    {
        $event = $request->all();

        if ($event['event_type'] === 'PAYMENT.CAPTURE.COMPLETED') {
            $resource = $event['resource'];
            $this->processSuccessfulPayment('paypal', $resource['id'], $resource);
        }

        return true;
    }

    /**
     * Manejar webhooks de MercadoPago
     */
    private function handleMercadoPagoWebhook(Request $request)
    {
        $event = $request->all();

        if ($event['action'] === 'payment.created' || $event['action'] === 'payment.updated') {
            $payment = $event['data'];
            $this->processSuccessfulPayment('mercadopago', $payment['id'], $payment);
        }

        return true;
    }

/**
 * Procesar pago exitoso
 */
private function processSuccessfulPayment($provider, $paymentId, $paymentData)
{
    DB::transaction(function () use ($provider, $paymentId, $paymentData) {
        // Buscar la compra usando el ID que guardaste en metadata al crear el pago
        $shoppingId = $paymentData['metadata']['shopping_id'] ?? null;
        
        if (!$shoppingId) {
            Log::error('Webhook: No se encontró shopping_id en metadata', [
                'provider' => $provider,
                'payment_id' => $paymentId
            ]);
            throw new \Exception("No se encontró shopping_id en los metadatos");
        }

        $shopping = Shopping::find($shoppingId);
        
        if (!$shopping) {
            Log::error('Webhook: Compra no encontrada', [
                'shopping_id' => $shoppingId,
                'provider' => $provider
            ]);
            throw new \Exception("Compra no encontrada: {$shoppingId}");
        }

        // ✅ 1. CAMBIAR ESTADO DE LA COMPRA (necesitas agregar columna 'status' a shopping)
        $shopping->status = 'completed';
        $shopping->payment_id = $paymentId; // 👈 Necesitas agregar columna 'payment_id'
        $shopping->payment_provider = $provider; // 👈 Necesitas agregar columna
        $shopping->save();

        // ✅ 2. ACTIVAR LAS LICENCIAS (si usas campo 'is_active' en user_licenses)
        UserLicense::where('shopping_id', $shopping->id)
            ->update(['is_active' => true]); // 👈 Necesitas agregar columna 'is_active'

        // ✅ 3. ENVIAR EMAIL DE CONFIRMACIÓN (opcional)
        // Mail::to($shopping->user->email)->send(new PurchaseConfirmed($shopping));

        Log::info('Pago procesado exitosamente', [
            'shopping_id' => $shoppingId,
            'provider' => $provider,
            'payment_id' => $paymentId,
            'user_id' => $shopping->user_id
        ]);
    });
}

    /**
     * Procesar pago fallido
     */
    private function processFailedPayment($provider, $paymentId, $paymentData)
    {
        $shoppingId = $paymentData['metadata']['shopping_id'] ?? null;
        
        if ($shoppingId) {
            $shopping = Shopping::find($shoppingId);
            
            if ($shopping) {
                // ❌ Marcar la compra como fallida
                $shopping->status = 'failed';
                $shopping->payment_id = $paymentId;
                $shopping->payment_provider = $provider;
                $shopping->save();

                // ❌ Opcional: notificar al admin
                Log::warning('Pago fallido', [
                    'shopping_id' => $shoppingId,
                    'provider' => $provider,
                    'payment_id' => $paymentId,
                    'user_id' => $shopping->user_id
                ]);
            }
        }
    }

    /**
     * Detectar proveedor del webhook
     */
    private function detectProvider(Request $request)
    {
        // Por User-Agent
        $userAgent = $request->header('User-Agent');
        
        if (str_contains($userAgent, 'Stripe')) {
            return 'stripe';
        }
        
        if (str_contains($userAgent, 'PayPal')) {
            return 'paypal';
        }

        // Por la ruta (si usas diferentes endpoints)
        if ($request->is('api/webhooks/stripe*')) {
            return 'stripe';
        }

        if ($request->is('api/webhooks/paypal*')) {
            return 'paypal';
        }

        // Por defecto
        return 'unknown';
    }
}