<?php

namespace App\Helpers;

use App\Models\Notification;
use App\Models\User;

class NotificationHelper
{
    /**
     * Crear notificación para un usuario específico
     */
    public static function createForUser($userId, $type, $title, $message, $data = null)
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data ? json_encode($data) : null,
            'read_at' => null
        ]);
    }

    /**
     * Crear notificación para todos los administradores
     */
    public static function createForAdmins($type, $title, $message, $data = null)
    {
        // Obtener todos los usuarios con tipo admin
        $admins = User::where('user_type', 'admin')->get();
        
        $notifications = [];
        
        foreach ($admins as $admin) {
            $notifications[] = Notification::create([
                'user_id' => $admin->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => $data ? json_encode($data) : null,
                'read_at' => null
            ]);
        }
        
        return $notifications;
    }

    /**
     * Crear notificación para un tipo específico de usuario
     */
    public static function createForUserType($userType, $type, $title, $message, $data = null)
    {
        $users = User::where('user_type', $userType)->get();
        
        $notifications = [];
        
        foreach ($users as $user) {
            $notifications[] = Notification::create([
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => $data ? json_encode($data) : null,
                'read_at' => null
            ]);
        }
        
        return $notifications;
    }

    /**
     * Notificación de nuevo usuario registrado
     */
    public static function newUserRegistered($user)
    {
        return self::createForAdmins(
            'user',
            'Nuevo usuario registrado',
            "{$user->name} se ha registrado como " . 
            ($user->user_type === 'architect' ? 'Arquitecto' : 
             ($user->user_type === 'engineer' ? 'Ingeniero' : 
              ($user->user_type === 'company' ? 'Empresa' : 'Usuario'))),
            ['user_id' => $user->id]
        );
    }

    /**
     * Notificación de nueva compra
     */
    public static function newPurchase($shopping, $user)
    {
        return self::createForAdmins(
            'sale',
            'Nueva compra realizada',
            "{$user->name} compró por \${$shopping->total}",
            [
                'shopping_id' => $shopping->id,
                'user_id' => $user->id,
                'amount' => $shopping->total
            ]
        );
    }

    /**
     * Notificación de nueva reseña
     */
    public static function newReview($review)
    {
        return self::createForAdmins(
            'review',
            'Nueva reseña',
            "{$review->user->name} calificó {$review->model->name} con {$review->rating} estrellas",
            [
                'review_id' => $review->id,
                'user_id' => $review->user_id,
                'model_id' => $review->model_id,
                'rating' => $review->rating
            ]
        );
    }

    /**
     * Notificación de pago procesado
     */
    public static function paymentProcessed($shopping)
    {
        return self::createForAdmins(
            'payment',
            'Pago procesado',
            "Pago de \${$shopping->total} procesado correctamente",
            [
                'shopping_id' => $shopping->id,
                'amount' => $shopping->total,
                'method' => $shopping->payment_provider
            ]
        );
    }

    /**
     * Notificación de alerta del sistema
     */
    public static function systemAlert($title, $message, $data = null)
    {
        return self::createForAdmins(
            'alert',
            $title,
            $message,
            $data
        );
    }
}