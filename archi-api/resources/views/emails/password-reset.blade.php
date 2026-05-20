<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer Contraseña - ArchiMarket3D</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f3f4f6;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .card {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: white;
            text-decoration: none;
            display: inline-block;
            margin-bottom: 10px;
        }
        
        .logo span {
            color: #fbbf24;
        }
        
        .subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .message {
            color: #4b5563;
            margin-bottom: 30px;
            font-size: 16px;
        }
        
        .button-container {
            text-align: center;
            margin: 35px 0;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            text-decoration: none;
            padding: 14px 35px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .button-mobile {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        }
        
        .info-box {
            background: #f3f4f6;
            border-left: 4px solid #4f46e5;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 25px 0;
            font-size: 14px;
            color: #4b5563;
        }
        
        .info-box strong {
            color: #1f2937;
        }
        
        .expiry {
            font-size: 13px;
            color: #6b7280;
            text-align: center;
            margin: 20px 0;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 10px;
        }
        
        .footer-links {
            margin-top: 15px;
        }
        
        .footer-links a {
            color: #4f46e5;
            text-decoration: none;
            font-size: 12px;
            margin: 0 10px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        .warning {
            background: #fef3c7;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 12px 15px;
            margin: 20px 0;
            font-size: 13px;
            color: #92400e;
        }
        
        .mobile-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            font-size: 10px;
            padding: 2px 8px;
            border-radius: 20px;
            margin-left: 10px;
            vertical-align: middle;
        }
        
        @media (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            
            .greeting {
                font-size: 20px;
            }
            
            .button {
                padding: 12px 30px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <!-- Header -->
            <div class="header">
                <div class="logo">
                    Archi<span>Market</span>3D
                </div>
                <div class="subtitle">Plataforma de modelos 3D para arquitectura y diseño</div>
            </div>
            
            <!-- Content -->
            <div class="content">
                <div class="greeting">
                    ¡Hola, {{ $userName }}! 👋
                </div>
                
                <div class="message">
                    Recibiste este correo porque solicitaste restablecer la contraseña de tu cuenta en <strong>ArchiMarket3D</strong>.
                </div>
                
                <!-- Botón para Web/Desktop -->
                <div class="button-container" id="webButton">
                    <a href="{{ $resetUrl }}" class="button">
                        🔐 Restablecer Contraseña
                    </a>
                    <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                        💻 Abrir en el navegador
                    </p>
                </div>
                
                <!-- Botón para Móvil (Deep Link) -->
                <div class="button-container" id="mobileButton" style="display: none;">
                    <a href="archimarket3d://reset-password?token={{ $token }}&email={{ urlencode($email) }}" class="button button-mobile">
                        📱 Abrir en la App
                    </a>
                    <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                        Si tienes la app instalada, toca aquí para abrirla automáticamente
                    </p>
                </div>
                
                <div class="info-box">
                    <strong>📌 ¿No solicitaste este cambio?</strong><br>
                    Si no solicitaste restablecer tu contraseña, ignora este mensaje. Tu contraseña no cambiará hasta que accedas al enlace y crees una nueva.
                </div>
                
                <div class="warning">
                    ⚠️ <strong>Importante:</strong> Este enlace expirará en <strong>60 minutos</strong> por razones de seguridad. Si expira, deberás solicitar un nuevo restablecimiento.
                </div>
                
                <div class="expiry">
                    <strong>🔗 Enlace directo (copia y pega en tu navegador):</strong><br>
                    <span style="font-size: 12px; word-break: break-all; color: #6b7280;">{{ $resetUrl }}</span>
                </div>
                
                @if(isset($isMobile) && $isMobile)
                <div class="expiry" style="background: #e0e7ff; margin-top: 10px;">
                    <strong>📱 Enlace para la app móvil:</strong><br>
                    <span style="font-size: 12px; word-break: break-all; color: #4f46e5;">archimarket3d://reset-password?token={{ $token }}&email={{ urlencode($email) }}</span>
                </div>
                @endif
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-text">
                    © 2024 ArchiMarket3D. Todos los derechos reservados.
                </div>
                <div class="footer-text">
                    Plataforma de modelos 3D para arquitectura y diseño
                </div>
                <div class="footer-links">
                    <a href="{{ config('app.frontend_url') }}/terms">Términos de servicio</a>
                    <a href="{{ config('app.frontend_url') }}/privacy">Política de privacidad</a>
                    <a href="{{ config('app.frontend_url') }}/contact">Contacto</a>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Detectar si es dispositivo móvil
        function isMobileDevice() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }
        
        // Detectar si es iOS
        function isIOS() {
            return /iPhone|iPad|iPod/i.test(navigator.userAgent);
        }
        
        // Mostrar el botón correspondiente según el dispositivo
        if (isMobileDevice()) {
            document.getElementById('webButton').style.display = 'none';
            document.getElementById('mobileButton').style.display = 'block';
        }
        
        console.log('📱 Dispositivo móvil:', isMobileDevice());
        console.log('🍎 iOS:', isIOS());
    </script>
</body>
</html>