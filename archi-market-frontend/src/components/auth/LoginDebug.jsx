import React, { useState } from 'react';
import API from '../../services/api';

const LoginDebug = () => {
    const [email, setEmail] = useState('rafa@gmail.com');
    const [password, setPassword] = useState('1234567890');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testLogin = async () => {
        setLoading(true);
        try {
            console.log('📤 Enviando petición a:', '/auth/login');
            console.log('📦 Datos:', { email, password });
            
            const response = await API.post('/auth/login', { email, password });
            console.log('✅ Login exitoso:', response.data);
            
            setResult({ success: true, data: response.data });
            
            // Guardar token
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
            
            console.log('💾 Token guardado:', response.data.data.token);
            console.log('👤 Usuario guardado:', response.data.data.user);
            
        } catch (err) {
            console.error('❌ Error:', err);
            console.error('❌ Respuesta:', err.response?.data);
            setResult({ 
                success: false, 
                error: err.message,
                data: err.response?.data 
            });
        } finally {
            setLoading(false);
        }
    };

    const checkStorage = () => {
        console.log('🔑 Token:', localStorage.getItem('token'));
        console.log('👤 User:', localStorage.getItem('user'));
        alert('Revisa la consola (F12)');
    };

    const clearStorage = () => {
        localStorage.clear();
        console.log('🧹 Storage limpiado');
        setResult(null);
    };

    const testAPI = async () => {
        try {
            const response = await API.get('/');
            console.log('✅ API respondió:', response.data);
            alert('API conectada correctamente');
        } catch (err) {
            console.error('❌ API no responde:', err);
            alert('Error conectando a API');
        }
    };

    return (
        <div style={{ 
            padding: '30px', 
            maxWidth: '600px', 
            margin: '50px auto',
            fontFamily: 'monospace',
            backgroundColor: '#f5f5f5',
            borderRadius: '10px'
        }}>
            <h1 style={{ color: '#333' }}>🔧 Login Debug</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <h3>📝 Credenciales de prueba:</h3>
                <p><strong>Admin:</strong> rafa@gmail.com / 1234567890</p>
                <p><strong>Usuario:</strong> laura@constructora.com / 1234567890</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        marginBottom: '10px',
                        borderRadius: '5px',
                        border: '1px solid #ccc'
                    }}
                />
                
                <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        marginBottom: '20px',
                        borderRadius: '5px',
                        border: '1px solid #ccc'
                    }}
                />
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                        onClick={testLogin}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? 'Probando...' : '🔐 Probar Login'}
                    </button>
                    
                    <button 
                        onClick={checkStorage}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        📦 Ver Storage
                    </button>
                    
                    <button 
                        onClick={clearStorage}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        🗑️ Limpiar Storage
                    </button>

                    <button 
                        onClick={testAPI}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        🌐 Test API
                    </button>
                </div>
            </div>

            {result && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
                    borderRadius: '5px'
                }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>
                        {result.success ? '✅ Login Exitoso' : '❌ Error'}
                    </h3>
                    <pre style={{ 
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        margin: 0
                    }}>
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <p>💡 Abre la consola (F12) para ver más detalles</p>
            </div>
        </div>
    );
};

export default LoginDebug;