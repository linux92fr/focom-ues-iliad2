import { useState } from 'react';
import { X, AlertCircle, Info, Calendar, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FlashBannerProps {
  message: string;
  type?: 'urgent' | 'info' | 'event' | 'announcement';
  link?: string;
  autoHide?: boolean;
  duration?: number;
  onClose?: () => void;
}

const FlashBanner = ({
  message,
  type = 'info',
  link,
  autoHide = false,
  duration = 10000,
  onClose,
}: FlashBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  // Ne pas afficher si le message est vide
  if (!message || message.trim() === '') {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  // Auto-hide logic
  if (autoHide && duration) {
    setTimeout(() => {
      handleClose();
    }, duration);
  }

  if (!isVisible) return null;

  const typeConfig = {
    urgent: {
      icon: AlertCircle,
      bgPattern: 'bg-gradient-to-r from-red-600 via-red-700 to-red-600',
      textColor: 'text-white',
      iconColor: 'text-red-100',
      borderColor: 'border-red-400',
      stripeColor: 'bg-red-500/30',
    },
    info: {
      icon: Info,
      bgPattern: 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600',
      textColor: 'text-white',
      iconColor: 'text-blue-100',
      borderColor: 'border-blue-400',
      stripeColor: 'bg-blue-500/30',
    },
    event: {
      icon: Calendar,
      bgPattern: 'bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600',
      textColor: 'text-white',
      iconColor: 'text-purple-100',
      borderColor: 'border-purple-400',
      stripeColor: 'bg-purple-500/30',
    },
    announcement: {
      icon: Megaphone,
      bgPattern: 'bg-gradient-to-r from-orange-600 via-orange-700 to-orange-600',
      textColor: 'text-white',
      iconColor: 'text-orange-100',
      borderColor: 'border-orange-400',
      stripeColor: 'bg-orange-500/30',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  const content = (
    <div
      className={cn(
        'relative w-full overflow-hidden border-b-4',
        config.bgPattern,
        config.borderColor,
        type === 'urgent' && 'animate-pulse-glow'
      )}
      style={{
        backgroundSize: '200% 200%',
      }}
    >
      {/* Animated stripe background */}
      <div
        className={cn(
          'absolute inset-0 opacity-30 animate-flash-stripe',
          config.stripeColor
        )}
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)',
          backgroundSize: '200% 200%',
        }}
      />

      <div className="relative container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Icon className={cn('w-6 h-6 flex-shrink-0 animate-pulse', config.iconColor)} />
            
            {/* Texte centré SANS défilement */}
            <div className="flex-1 text-center">
              <p className={cn('font-bold text-sm md:text-base', config.textColor)}>
                {message}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className={cn(
              'p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0',
              config.textColor
            )}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
};

export default FlashBanner;
