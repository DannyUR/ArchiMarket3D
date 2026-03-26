import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/common/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ModelList from './components/models/ModelList';
import ModelDetail from './components/models/ModelDetail';
import Cart from './components/cart/Cart';
import Checkout from './components/cart/Checkout';
import Categories from './components/categories/Categories';
import Profile from './components/user/Profile';
import MyPurchases from './components/purchases/MyPurchases';
import PurchaseDetail from './components/purchases/PurchaseDetail';
import Downloads from './components/user/Downloads';
import PublicLicenses from './components/licenses/PublicLicenses';
import Licenses from './components/user/Licenses';
import 'react-intersection-observer';
import AdminDashboard from './components/admin/Dashboard';
import Success from './pages/Success';
import Home from './pages/Home';

import 'bootstrap/dist/css/bootstrap.min.css';

const AppContent = () => {
    const location = useLocation();
    const hideNavbarPaths = ['/', '/login', '/register', '/admin'];
    const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

    const PrivateRoute = ({ children, adminOnly = false }) => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // Si está en login, no redirigir
        if (location.pathname === '/login') {
            return children;
        }

        // Si no hay token, redirigir a login
        if (!token) {
            return <Navigate to="/login" replace />;
        }

        // Si es ruta de admin y no es admin, redirigir a home
        if (adminOnly && user.user_type !== 'admin') {
            return <Navigate to="/" replace />;
        }

        return children;
    };

    return (
        <>
            {shouldShowNavbar && <Navbar />}
            <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/models" element={<ModelList />} />
                <Route path="/models/:id" element={<ModelDetail />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/licenses" element={<PublicLicenses />} />

                {/* ✅ Ruta de éxito (pública para recibir el callback de PayPal) */}
                <Route path="/purchases/success" element={<Success />} />

                <Route path="/home" element={
                    <PrivateRoute>
                        <Home />
                    </PrivateRoute>
                } />

                {/* Rutas protegidas (requieren login) */}
                <Route path="/cart" element={
                    <PrivateRoute>
                        <Cart />
                    </PrivateRoute>
                } />
                <Route path="/checkout" element={
                    <PrivateRoute>
                        <Checkout />
                    </PrivateRoute>
                } />
                <Route path="/profile" element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                } />
                <Route path="/purchases" element={
                    <PrivateRoute>
                        <MyPurchases />
                    </PrivateRoute>
                } />
                <Route path="/purchases/:id" element={
                    <PrivateRoute>
                        <PurchaseDetail />
                    </PrivateRoute>
                } />
                <Route path="/downloads" element={
                    <PrivateRoute>
                        <Downloads />
                    </PrivateRoute>
                } />
                <Route path="/my-licenses" element={
                    <PrivateRoute>
                        <Licenses />
                    </PrivateRoute>
                } />

                {/* Rutas de admin */}
                <Route
                    path="/admin/*"
                    element={
                        <PrivateRoute adminOnly={true}>
                            <AdminDashboard />
                        </PrivateRoute>
                    }
                />

                {/* Ruta 404 - Redirigir a inicio */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

function App() {
    return (
        <BrowserRouter>
            <NotificationProvider>
                <CartProvider>
                    <AppContent />
                </CartProvider>
            </NotificationProvider>
        </BrowserRouter>
    );
}

export default App;