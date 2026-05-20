<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class PasswordResetNotification extends Notification
{
    use Queueable;

    protected $token;
    protected $email;

    public function __construct($token, $email)
    {
        $this->token = $token;
        $this->email = $email;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        
        // Detectar si es dispositivo móvil por el User-Agent
        $userAgent = request()->header('User-Agent');
        $isMobile = preg_match('/(android|iphone|ipad|mobile)/i', $userAgent);
        
        if ($isMobile) {
            // Usar scheme de la app móvil
            $resetUrl = 'archimarket3d://reset-password?token=' . $this->token . '&email=' . urlencode($this->email);
        } else {
            // Usar URL web normal
            $resetUrl = $frontendUrl . '/reset-password?token=' . $this->token . '&email=' . urlencode($this->email);
        }
        
        return (new MailMessage)
            ->subject('🔐 Restablece tu contraseña - ArchiMarket3D')
            ->markdown('emails.password-reset', [
                'resetUrl' => $resetUrl,
                'userName' => $notifiable->name,
                'token' => $this->token,
                'email' => $this->email,
                'isMobile' => $isMobile
            ]);
    }
}