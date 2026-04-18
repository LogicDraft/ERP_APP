import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, GraduationCap, ArrowRight, UserCheck, Contact } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { mockClassroom } from '../../data/mockData';
import { Card } from '../ui/Card';
import NotificationBar from '../NotificationBar';
import InfoCard from '../dashboard/InfoCard';
import ReminderWidget from '../dashboard/ReminderWidget';

const Dashboard = () => {
    const { institutionDetails, timetable } = mockClassroom;
    const [smartNotification, setSmartNotification] = useState(null);

    // Get today's day name (lowercase)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIndex = new Date().getDay();
    const today = days[todayIndex];
    const todaysClasses = timetable[today] || [];

    // Request Notification Permissions on Mount
    useEffect(() => {
        const requestPermissions = async () => {
            try {
                const permStatus = await LocalNotifications.checkPermissions();
                if (permStatus.display !== 'granted') {
                    await LocalNotifications.requestPermissions();
                }
            } catch (error) {
                console.error("Error requesting notification permissions:", error);
            }
        };
        requestPermissions();
    }, []);

    // Smart Notification Logic
    useEffect(() => {
        const checkNotifications = async () => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentDay = days[now.getDay()];

            // Helper to parse start time to 24h format (handling '01:40' as PM)
            const getStartHour = (timeStr) => {
                if (!timeStr) return 0;
                const startTime = timeStr.split('-')[0].trim();
                let [h] = startTime.split(':').map(Number);
                // Assumption: Classes starting 01-06 are PM, 07-12 are AM (except 12 which is PM, handled naturally)
                if (h >= 1 && h <= 6) h += 12;
                return h;
            };

            let notification = null;
            let startSchedule = false;

            // Morning Logic: Active from 8:00 AM to 12:00 PM
            if (currentHour >= 8 && currentHour < 12) {
                const hasMorningLaptop = timetable[currentDay]?.some(cls => {
                    const h = getStartHour(cls.time);
                    const isLaptop = cls.isLaptop || cls.subject.toLowerCase().includes('python programming');
                    return isLaptop && h < 12.5;
                });

                if (hasMorningLaptop) {
                    notification = {
                        id: 1001, // Numeric ID for Capacitor
                        title: 'Morning Laptop Session!',
                        body: 'You have a class before lunch that requires a laptop. Please ensure you have it with you.',
                        schedule: { at: new Date(Date.now() + 1000) } // Schedule for 1s later
                    };
                    startSchedule = true;
                }
            }
            // Afternoon Logic: Active from 1:15 PM onwards
            else if ((currentHour === 13 && currentMinute >= 15) || (currentHour > 13 && currentHour < 17)) {
                const hasAfternoonLaptop = timetable[currentDay]?.some(cls => {
                    const h = getStartHour(cls.time);
                    const isLaptop = cls.isLaptop || cls.subject.toLowerCase().includes('python programming');
                    return isLaptop && h >= 12.5;
                });

                if (hasAfternoonLaptop) {
                    notification = {
                        id: 1002, // Numeric ID for Capacitor
                        title: 'Afternoon Laptop Session!',
                        body: 'You have a post-lunch session starting soon that requires a laptop.',
                        schedule: { at: new Date(Date.now() + 1000) }
                    };
                    startSchedule = true;
                }
            }

            // Update React State for UI
            if (notification) {
                setSmartNotification({
                    id: notification.id,
                    title: notification.title,
                    message: notification.body,
                    type: 'warning',
                    priority: 'high',
                    icon: 'laptop'
                });

                // Request Permissions and Schedule Native Notification
                try {
                    const permStatus = await LocalNotifications.requestPermissions();
                    if (permStatus.display === 'granted') {
                        // Check if we already scheduled recently to avoid spam loop check
                        // For now, we schedule. In production, use LocalNotifications.getPending()
                        await LocalNotifications.schedule({
                            notifications: [{
                                title: notification.title,
                                body: notification.body,
                                id: notification.id,
                                schedule: { at: new Date(Date.now() + 1000) },
                                sound: null,
                                attachments: null,
                                actionTypeId: "",
                                extra: null
                            }]
                        });
                    }
                } catch (e) {
                    console.error("Error scheduling notification", e);
                }
            } else {
                setSmartNotification(null);
            }
        };

        checkNotifications();
        // Check every minute
        const interval = setInterval(checkNotifications, 60000);
        return () => clearInterval(interval);
    }, [timetable]);

    // Helper to check if a subject is a break
    const isBreak = (subject) => {
        const upper = subject.toUpperCase();
        return upper.includes('BREAK') || upper.includes('LUNCH');
    };

    // Filter out breaks for class count
    const actualClasses = todaysClasses.filter(slot => !isBreak(slot.subject));
    const classCount = actualClasses.length;

    const cards = [
        {
            title: 'Mentor Allocation',
            description: 'View mentor-wise student grouping',
            icon: Users,
            path: '/mentor-allocation',
            color: 'bg-blue-500',
            gradient: 'from-blue-500 to-blue-600',
        },
        {
            title: 'Student List',
            description: 'Complete list of N-Section students',
            icon: GraduationCap,
            path: '/student-list',
            color: 'bg-emerald-500',
            gradient: 'from-emerald-500 to-emerald-600',
        },
        {
            title: 'Time Table',
            description: 'Weekly class schedule',
            icon: Calendar,
            path: '/timetable',
            color: 'bg-purple-500',
            gradient: 'from-purple-500 to-purple-600',
        },
        {
            title: 'Attendance',
            description: 'Mark and view daily attendance',
            icon: UserCheck,
            path: '/attendance',
            color: 'bg-rose-500',
            gradient: 'from-rose-500 to-rose-600',
        },
        {
            title: 'Faculty',
            description: 'Contact details of faculty members',
            icon: Contact,
            path: '/faculty',
            color: 'bg-amber-500',
            gradient: 'from-amber-500 to-amber-600',
        },
    ];

    // Inject smart notification if exists
    const displayNotifications = smartNotification
        ? [smartNotification, ...(mockClassroom.notifications || [])]
        : mockClassroom.notifications;

    // Temporarily override mockData notifications for the NotificationBar
    const notificationsWithSmart = {
        ...mockClassroom,
        notifications: displayNotifications
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient">
                        Welcome AIML ERP
                    </h1>
                    <p className="text-slate-600 font-semibold mt-2 text-base">
                        First Semester BE • Section N
                    </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-semibold text-slate-600 capitalize">{today}</span>
                </div>
            </div>

            {/* Top Row: Info Card & Today's Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <InfoCard
                        institutionDetails={institutionDetails}
                        studentCount={mockClassroom.students.length}
                    />
                </div>
                <div className="lg:col-span-1">
                    <Card className="h-full flex flex-col justify-center items-center text-center bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                        <h3 className="text-lg font-medium opacity-90 mb-2 relative z-10">Classes Today</h3>
                        <div className="text-6xl font-extrabold mb-2 relative z-10">{classCount}</div>
                        <p className="text-sm opacity-75 relative z-10">Sessions Scheduled</p>
                    </Card>
                </div>
            </div>

            {/* Middle Section: Notification Bar (Only show if Python/AI class exists) */}
            {smartNotification && (
                <div className="w-full animate-slideUp">
                    <NotificationBar customNotifications={displayNotifications} />
                </div>
            )}

            {/* Bottom Row: Schedule & Reminders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Schedule */}
                <div className="lg:col-span-2">
                    <Card className="h-full bg-white border border-slate-100 shadow-lg rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Calendar className="text-indigo-500" />
                                Today's Schedule
                            </h2>
                        </div>
                        {todaysClasses.length > 0 ? (
                            <div className="space-y-4">
                                {todaysClasses.map((cls, idx) => (
                                    <div key={idx} className="group flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
                                        <div className="w-24 text-sm font-bold text-slate-500 border-r-2 border-slate-200 pr-4 mr-4 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                                            {cls.time}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                                {cls.subject}
                                            </div>
                                            {(cls.isLaptop || cls.subject.toLowerCase().includes('python')) && (
                                                <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-medium">
                                                    💻 Laptop Required
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                No classes scheduled for today.
                            </div>
                        )}
                    </Card>
                </div>

                {/* Reminder Widget */}
                <div className="lg:col-span-1">
                    <ReminderWidget />
                </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link key={card.path} to={card.path} className="group">
                            <div className={`h-full relative overflow-hidden rounded-2xl p-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br ${card.gradient} p-[1px]`}>
                                <div className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-2xl z-0"></div>
                                <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
                                    <div className={`mb-3 p-3 rounded-full bg-opacity-10 ${card.color.replace('bg-', 'bg-opacity-10 text-')} group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={32} strokeWidth={1.5} className={`${card.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium line-clamp-2">
                                        {card.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>

    );
};

export default Dashboard;
