<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Compra - ArchiMarket3D</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; color: white; }
        .logo span { color: #fbbf24; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 20px; }
        .message { color: #4b5563; margin-bottom: 25px; }
        .purchase-details { background: #f9fafb; border-radius: 12px; padding: 20px; margin: 25px 0; }
        .purchase-header { font-weight: bold; color: #1f2937; margin-bottom: 15px; font-size: 18px; }
        .model-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .model-name { font-weight: 500; color: #1f2937; }
        .model-price { color: #4f46e5; font-weight: 600; }
        .total { display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; font-weight: bold; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 14px 35px; border-radius: 50px; font-weight: 600; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; }
        .footer-text { color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <div class="logo">Archi<span>Market</span>3D</div>
            </div>
            <div class="content">
                <div class="greeting">¡Gracias por tu compra, {{ $userName }}! 🎉</div>
                <div class="message">Tu transacción se ha completado exitosamente. Aquí están los detalles de tu compra:</div>
                
                <div class="purchase-details">
                    <div class="purchase-header">📦 Compra #{{ $shoppingId }}</div>
                    @foreach($models as $model)
                    <div class="model-item">
                        <span class="model-name">{{ $model['name'] }}</span>
                        <span class="model-price">${{ number_format($model['price'], 2) }}</span>
                    </div>
                    @endforeach
                    <div class="total">
                        <span>Total pagado</span>
                        <span>${{ number_format($total, 2) }}</span>
                    </div>
                </div>
                
                <div class="button-container">
                    <a href="{{ config('app.frontend_url') }}/my-licenses" class="button">📥 Mis Descargas</a>
                </div>
                
                <div class="message" style="font-size: 14px; text-align: center;">
                    Puedes descargar tus modelos desde tu panel de usuario.
                </div>
            </div>
            <div class="footer">
                <div class="footer-text">© 2024 ArchiMarket3D. Todos los derechos reservados.</div>
            </div>
        </div>
    </div>
</body>
</html>