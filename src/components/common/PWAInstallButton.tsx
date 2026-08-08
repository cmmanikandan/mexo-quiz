import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { MexoButton } from './MexoButton';

export const PWAInstallButton: React.FC<{ variant?: 'ghost' | 'outline' | 'purple'; size?: 'xs' | 'sm' | 'md' }> = ({
  variant = 'ghost',
  size = 'sm',
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('MEXO Quiz is ready for installation! Use your browser menu "Add to Home Screen" or "Install App".');
    }
  };

  return (
    <MexoButton variant={variant} size={size} onClick={handleInstall} leftIcon={<Download className="w-4 h-4" />}>
      Install App
    </MexoButton>
  );
};
