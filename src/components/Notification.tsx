import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X 
} from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: NotificationType = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <Toast notification={n} onClose={() => setNotifications(prev => prev.filter(item => item.id !== n.id))} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

const Toast: React.FC<{ notification: Notification; onClose: () => void }> = ({ notification, onClose }) => {
  const { message, type } = notification;
  
  const config = {
    success: {
      icon: CheckCircle,
      color: 'text-[#39FF14]',
      bg: 'bg-[#39FF14]/10',
      border: 'border-[#39FF14]/20',
      shadow: 'shadow-[#39FF14]/10'
    },
    error: {
      icon: XCircle,
      color: 'text-[#FF3131]',
      bg: 'bg-[#FF3131]/10',
      border: 'border-[#FF3131]/20',
      shadow: 'shadow-[#FF3131]/10'
    },
    warning: {
      icon: AlertCircle,
      color: 'text-[#FFD700]',
      bg: 'bg-[#FFD700]/10',
      border: 'border-[#FFD700]/20',
      shadow: 'shadow-[#FFD700]/10'
    },
    info: {
      icon: Info,
      color: 'text-[#00FFFF]',
      bg: 'bg-[#00FFFF]/10',
      border: 'border-[#00FFFF]/20',
      shadow: 'shadow-[#00FFFF]/10'
    }
  }[type];

  const Icon = config.icon;

  return (
    <div className={`
      relative group flex items-center gap-4 px-5 py-4 min-w-[320px] max-w-[450px]
      backdrop-blur-xl ${config.bg} ${config.border} border rounded-2xl
      shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] ${config.shadow}
      overflow-hidden transition-all duration-300 hover:scale-[1.02]
    `}>
      {/* Glow Effect */}
      <div className={`absolute -inset-1 opacity-20 blur-xl ${config.bg} group-hover:opacity-40 transition-opacity`} />
      
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Icon Container */}
      <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 ${config.color}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Message */}
      <div className="flex-1 pr-4">
        <p className="text-white text-sm font-medium leading-relaxed">
          {message}
        </p>
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="text-white/30 hover:text-white transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: 0 }}
        transition={{ duration: 5, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-[3px] ${config.color} bg-current opacity-30`}
      />
    </div>
  );
};
