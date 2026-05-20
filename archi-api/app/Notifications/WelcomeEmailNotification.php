<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class WelcomeEmailNotification extends Notification
{
    use Queueable;

    protected $user;
    protected $verificationUrl;

    public function __construct($user, $verificationUrl)
    {
        $this->user = $user;
        $this->verificationUrl = $verificationUrl;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('🎉 ¡Bienvenido a ArchiMarket3D!')
            ->markdown('emails.welcome', [
                'userName' => $notifiable->name,
                'verificationUrl' => $this->verificationUrl
            ]);
    }
}