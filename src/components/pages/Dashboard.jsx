import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, GraduationCap, UserCheck, Contact } from 'lucide-react';
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

    // ── 1. Request permissions on mount ──────────────────────────────────────
    useEffect(() => {
        const requestPermissions = async () => {
            try {
                const permStatus = await LocalNotifications.checkPermissions();
                if (permStatus.display !== 'granted') {
                    await LocalNotifications.requestPermissions();
                }
            } catch (error) {
                console.error('Error requesting notification permissions:', error);
            }
        };
        requestPermissions();
    }, []);

    // ── 2. Schedule native push notifications for Programming in C days ───────
    useEffect(() => {
        const scheduleLaptopNotifications = async () => {
            try {
                const permStatus = await LocalNotifications.checkPermissions();
                if (permStatus.display !== 'granted') return;

                // Cancel previous laptop notifications before re-scheduling
                await LocalNotifications.cancel({
                    notifications: [{ id: 2001 }, { id: 2002 }]
                });

                const todaySchedule = timetable[today] || [];

                const hasCTheory = todaySchedule.some(
                    cls => cls.requiresLaptop && cls.subject === 'Programming in C'
                );
                const hasCLab = todaySchedule.some(
                    cls => cls.requiresLaptop && cls.subject === 'Programming in C (Lab)'
                );

                const notifList = [];

                if (hasCTheory) {
                    // 8:00 AM reminder for Programming in C (theory)
                    const at8am = new Date();
                    at8am.setHours(8, 0, 0, 0);
                    notifList.push({
                        title: '💻 Bring Your Laptop!',
                        body: "Programming in C class today — don't forget your laptop!",
                        id: 2001,
                        schedule: {
                            at: at8am.getTime() > Date.now() ? at8am : new Date(Date.now() + 1000)
                        },
                        sound: null,
                        attachments: null,
                        actionTypeId: '',
                        extra: null
                    });
                }

                if (hasCLab) {
                    // 1:20 PM reminder for Programming in C (Lab)
                    const at1_20pm = new Date();
                    at1_20pm.setHours(13, 20, 0, 0);
                    notifList.push({
                        title: '💻 C Lab at 1:40 PM!',
                        body: 'Programming in C (Lab) starts soon. Bring your laptop by 1:20 PM!',
                        id: 2002,
                        schedule: {
                            at: at1_20pm.getTime() > Date.now() ? at1_20pm : new Date(Date.now() + 1500)
                        },
                        sound: null,
                        attachments: null,
                        actionTypeId: '',
                        extra: null
                    });
                }

                if (notifList.length > 0) {
                    await LocalNotifications.schedule({ notifications: notifList });
                }
            } catch (e) {
                console.error('Error scheduling laptop notifications', e);
            }
        };

        scheduleLaptopNotifications();
    }, [timetable, today]);

    // ── 3. In-app smart notification banner logic ─────────────────────────────
    useEffect(() => {
        const checkNotifications = () => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const todaySchedule = timetable[today] || [];

            const hasCTheory = todaySchedule.some(
                cls => cls.requiresLaptop && cls.subject === 'Programming in C'
            );
            const hasCLab = todaySchedule.some(
                cls => cls.requiresLaptop && cls.subject === 'Programming in C (Lab)'
            );

            let notification = null;

            // Show from 8:00 AM if there is a C theory class today
            if (hasCTheory && currentHour >= 8 && currentHour < 18) {
                notification = {
                    id: 2001,
                    title: '💻 Bring Your Laptop Today!',
                    message: 'Programming in C class is scheduled today — please bring your laptop.',
                    type: 'warning',
                    priority: 'high',
                    icon: 'laptop'
                };
            }

            // Override with lab reminder from 1:20 PM
            if (hasCLab && (currentHour > 13 || (currentHour === 13 && currentMinute >= 20))) {
                notification = {
                    id: 2002,
                    title: '💻 C Lab Starting Soon!',
                    message: 'Programming in C (Lab) is at 1:40 PM today. Bring your laptop now!',
                    type: 'warning',
                    priority: 'high',
                    icon: 'laptop'
                };
            }

            setSmartNotification(notification);
        };

        checkNotifications();
        const interval = setInterval(checkNotifications, 30000); // re-check every 30 s
        return () => clearInterval(interval);
    }, [timetable, today]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const isBreak = (subject) => {
        const upper = subject.toUpperCase();
        return upper.includes('BREAK') || upper.includes('LUNCH');
    };

    const actualClasses = todaysClasses.filter(slot => !isBreak(slot.subject));
    const classCount = actualClasses.length;

    // ── Navigation cards ──────────────────────────────────────────────────────
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

    // ── Build notification list for the in-app bar ────────────────────────────
    const todaySchedule = timetable[today] || [];
    const staticNotifications = (mockClassroom.notifications || []).filter(n => {
        if (n.id === 1) return todaySchedule.some(c => c.requiresLaptop && c.subject === 'Programming in C');
        if (n.id === 2) return todaySchedule.some(c => c.requiresLaptop && c.subject === 'Programming in C (Lab)');
        return true;
    });

    const displayNotifications = smartNotification
        ? [smartNotification, ...staticNotifications.filter(n => n.id !== smartNotification.id)]
        : staticNotifications;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient">
                        Welcome AIML ERP
                    </h1>
                    <p className="text-slate-600 font-semibold mt-2 text-base">
                        Second Semester BE • Section N
                    </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-semibold text-slate-600 capitalize">{today}</span>
                </div>
            </div>

            {/* Top Row: Info Card & Classes Today */}
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

            {/* Notification Bar — laptop alerts */}
            {displayNotifications.length > 0 && (
                <div className="w-full animate-slideUp">
                    <NotificationBar customNotifications={displayNotifications} />
                </div>
            )}

            {/* Bottom Row: Schedule & Reminders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                    <div
                                        key={idx}
                                        className="group flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all"
                                    >
                                        <div className="w-24 text-sm font-bold text-slate-500 border-r-2 border-slate-200 pr-4 mr-4 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                                            {cls.time}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                                {cls.subject}
                                            </div>
                                            {cls.requiresLaptop && (
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
                            <div className={`h-full relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br ${card.gradient} p-[1px]`}>
                                <div className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-2xl z-0"></div>
                                <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
                                    <div className={`mb-3 p-3 rounded-full ${card.color.replace('bg-', 'bg-opacity-10 text-')} group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={32} strokeWidth={1.5} className={card.color.replace('bg-', 'text-')} />
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
