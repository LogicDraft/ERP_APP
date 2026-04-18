import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { mockClassroom } from '../data/mockData';
import Notification from './ui/Notification';

const NotificationBar = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState([]);

    const notifications = mockClassroom.notifications || [];
    const activeNotifications = notifications.filter(n => !dismissed.includes(n.id));

    if (activeNotifications.length === 0) return null;

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % activeNotifications.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + activeNotifications.length) % activeNotifications.length);
    };

    const handleDismiss = (id) => {
        setDismissed([...dismissed, id]);
        if (currentIndex >= activeNotifications.length - 1) {
            setCurrentIndex(Math.max(0, currentIndex - 1));
        }
    };

    return (
        <div className="mb-6">
            <div className="relative">
                <Notification
                    notification={activeNotifications[currentIndex]}
                    onDismiss={() => handleDismiss(activeNotifications[currentIndex].id)}
                />

                {activeNotifications.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
                            aria-label="Previous notification"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
                            aria-label="Next notification"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                            {activeNotifications.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white bg-opacity-50'
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NotificationBar;
