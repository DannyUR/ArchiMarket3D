import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';  // 👈 AGREGAR Navigate
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
import AdminDashboard from './components/admin/Dashboard';
import { useNotification } from './context/NotificationContext';  

import 'bootstrap/dist/css/bootstrap.min.css';

const AppContent = () => {
    const location = useLocation();
    const hideNavbarPaths = ['/login', '/register'];
    const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

    const PrivateRoute = ({ children, adminOnly = false }) => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const { showError } = useNotification(); // Si tienes notificaciones

        if (!token) {
            return <Navigate to="/login" />;
        }

        if (adminOnly && user.user_type !== 'admin') {
            // Mostrar mensaje (si tienes notificaciones)
            if (showError) {
                showError('⛔ No tienes permisos de administrador');
            }
            // Redirigir al perfil del usuario
            return <Navigate to="/profile" />;
        }

        return children;
    };

    return (
        <>
            {shouldShowNavbar && <Navbar />}
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/models" element={<ModelList />} />
                <Route path="/models/:id" element={<ModelDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/purchases" element={<MyPurchases />} />
                <Route path="/purchases/:id" element={<PurchaseDetail />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/licenses" element={<PublicLicenses />} />
                <Route path="/my-licenses" element={<Licenses />} />

                {/* ✅ RUTA DE ADMIN DENTRO DE <Routes> */}
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute adminOnly={true}>
                            <AdminDashboard />
                        </PrivateRoute>
                    }
                />
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