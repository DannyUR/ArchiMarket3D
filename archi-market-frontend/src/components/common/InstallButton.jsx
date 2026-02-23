import React, { useState, useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';
import { colors } from '../../styles/theme';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('✅ App instalada correctamente');
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Usuario aceptó instalar');
    } else {
      console.log('❌ Usuario canceló');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstallClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1.2rem',
        backgroundColor: colors.primary,
        color: 'white',
        border: 'none',
        borderRadius: '30px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.9rem',
        boxShadow: '0 4px 12px rgba(255,87,51,0.3)',
        transition: 'all 0.3s',
        marginLeft: '1rem'
      }}
    >
      <FiDownload size={18} />
      Instalar App
    </button>
  );
};

export default InstallButton;