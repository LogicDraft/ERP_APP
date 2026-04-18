import React from 'react';
import { AlertCircle, Info, CheckCircle, Laptop, Bell } from 'lucide-react';

const Notification = ({ notification, onDismiss }) => {
    const getIcon = () => {
        switch (notification.icon) {
            case 'laptop':
                return <Laptop className="w-6 h-6" />;
            case 'info':
                return <Info className="w-6 h-6" />;
            case 'success':
                return <CheckCircle className="w-6 h-6" />;
            default:
                return <Bell className="w-6 h-6" />;
        }
    };

    const getColorClasses = () => {
        switch (notification.type) {
            case 'warning':
                return {
                    bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
                    text: 'text-white',
                    icon: 'text-white'
                };
            case 'info':
                return {
                    bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
                    text: 'text-white',
                    icon: 'text-white'
                };
            case 'success':
                return {
                    bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
                    text: 'text-white',
                    icon: 'text-white'
                };
            default:
                return {
                    bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
                    text: 'text-white',
                    icon: 'text-white'
                };
        }
    };

    const colors = getColorClasses();

    return (
        <div className={`${colors.bg} rounded-xl p-4 shadow-lg ${colors.text} relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10 flex items-start gap-4">
                <div className={`${colors.icon} flex-shrink-0 mt-1`}>
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1">{notification.title}</h3>
                    <p className="text-sm opacity-90 leading-relaxed">{notification.message}</p>
                    {notification.priority === 'high' && (
                        <span className="inline-block mt-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">
                            High Priority
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notification;
