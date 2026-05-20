<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a ArchiMarket3D</title>
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
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
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
        }
        
        .logo span {
            color: #fbbf24;
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
            margin-bottom: 25px;
            font-size: 16px;
        }
        
        .features {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 10px;
        }
        
        .feature-icon {
            width: 40px;
            height: 40px;
            background: #e0e7ff;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
        }
        
        .feature-icon svg {
            width: 20px;
            height: 20px;
            color: #4f46e5;
        }
        
        .feature-text {
            flex: 1;
        }
        
        .feature-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
        }
        
        .feature-desc {
            font-size: 13px;
            color: #6b7280;
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            text-decoration: none;
            padding: 14px 35px;
            border-radius: 50px;
            font-weight: 600;
        }
        
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
        }
        
        .footer-text {
            color: #6b7280;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <div class="logo">Archi<span>Market</span>3D</div>
            </div>
            
            <div class="content">
                <div class="greeting">¡Bienvenido a ArchiMarket3D, {{ $userName }}! 🎉</div>
                
                <div class="message">
                    Nos alegra tenerte con nosotros. Estás a punto de descubrir una colección increíble de modelos 3D para arquitectura y diseño.
                </div>
                
                <div class="features">
                    <div class="feature-item">
                        <div class="feature-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                        </div>
                        <div class="feature-text">
                            <div class="feature-title">+200 Modelos 3D</div>
                            <div class="feature-desc">Accede a una amplia biblioteca de modelos profesionales</div>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                        </div>
                        <div class="feature-text">
                            <div class="feature-title">Licencias Flexibles</div>
                            <div class="feature-desc">Personal, Business o Unlimited según tus necesidades</div>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </div>
                        <div class="feature-text">
                            <div class="feature-title">Descarga Inmediata</div>
                            <div class="feature-desc">Obtén tus modelos al instante después de la compra</div>
                        </div>
                    </div>
                </div>
                
                <div class="button-container">
                    <a href="{{ config('app.frontend_url') }}/models" class="button">🎨 Explorar Modelos</a>
                </div>
                
                <div class="message" style="font-size: 14px; text-align: center;">
                    ¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@archimarket3d.com" style="color: #4f46e5;">soporte@archimarket3d.com</a>
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-text">© 2024 ArchiMarket3D. Todos los derechos reservados.</div>
            </div>
        </div>
    </div>
</body>
</html>