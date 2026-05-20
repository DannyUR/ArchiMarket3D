<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class PurchaseConfirmation extends Notification
{
    use Queueable;

    protected $shopping;
    protected $user;

    public function __construct($shopping, $user)
    {
        $this->shopping = $shopping;
        $this->user = $user;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $models = [];
        foreach ($this->shopping->models as $model) {
            $models[] = [
                'name' => $model->name,
                'price' => $model->pivot->unit_price ?? $model->price
            ];
        }
        
        return (new MailMessage)
            ->subject('✅ Confirmación de compra - ArchiMarket3D')
            ->markdown('emails.purchase-confirmation', [
                'userName' => $notifiable->name,
                'shoppingId' => $this->shopping->id,
                'models' => $models,
                'total' => $this->shopping->total
            ]);
    }
}