import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, GraduationCap, Calendar, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockClassroom } from '../../data/mockData';

const ATTENDANCE_STORAGE_KEY = 'self_attendance_records_v2';
const ATTENDANCE_TARGET = 85;

const Attendance = () => {
    const navigate = useNavigate();
    const [attendanceRecords, setAttendanceRecords] = useState({});
    
    // 1. Process timetable data without changing timetable structure
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const todayIndex = today.getDay();
    const todayStr = days[todayIndex];
    const todayDate = today.toISOString().split('T')[0];
    const { timetable } = mockClassroom;

    const isBreak = (subject) => {
        const upper = subject.toUpperCase();
        return upper.includes('BREAK') || upper.includes('LUNCH');
    };

    const buildSlotId = (slot, day) => `${day}|${slot.time}|${slot.code || slot.subject}|${slot.subject}`;

    const trackableSlots = useMemo(() => {
        const slots = [];
        Object.keys(timetable).forEach((day) => {
            (timetable[day] || []).forEach((slot) => {
                if (!isBreak(slot.subject)) {
                    slots.push({
                        ...slot,
                        day,
                        slotId: buildSlotId(slot, day)
                    });
                }
            });
        });
        return slots;
    }, [timetable]);

    const uniqueSubjects = useMemo(() => {
        const grouped = {};

        trackableSlots.forEach((slot) => {
            const key = `${slot.subject}|${slot.code || 'NO_CODE'}`;
            if (!grouped[key]) {
                grouped[key] = {
                    key,
                    name: slot.subject,
                    code: slot.code || 'N/A',
                    shortName: slot.subject.replace(/[^A-Z]/g, '').slice(0, 5) || (slot.code ? slot.code.slice(-4) : 'SUBJ'),
                    slots: []
                };
            }
            grouped[key].slots.push(slot);
        });

        return Object.values(grouped);
    }, [trackableSlots]);

    // 2. Auto-show today's subjects
    const todaysClasses = useMemo(
        () => (timetable[todayStr] || [])
            .filter((slot) => !isBreak(slot.subject))
            .map((slot) => ({ ...slot, day: todayStr, slotId: buildSlotId(slot, todayStr) })),
        [timetable, todayStr]
    );

    // Helper to find next class for a subject + code
    const getNextClass = (subjectName, subjectCode) => {
        for (let i = 0; i < 7; i++) {
            const checkDayIndex = (todayIndex + i) % 7;
            const checkDayStr = days[checkDayIndex];
            const classes = timetable[checkDayStr] || [];
            const found = classes.find((c) => !isBreak(c.subject) && c.subject === subjectName && (c.code || 'N/A') === subjectCode);
            
            if (found) {
                if (i === 0) return `Today at ${found.time.split('-')[0]}`;
                if (i === 1) return `Tomorrow at ${found.time.split('-')[0]}`;
                return `${checkDayStr.charAt(0).toUpperCase() + checkDayStr.slice(1).substring(0,2)} ${found.time.split('-')[0]}`;
            }
        }
        return 'Not scheduled';
    };

    // 3. Load attendance records from local storage
    useEffect(() => {
        const saved = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
        if (saved) {
            try {
                setAttendanceRecords(JSON.parse(saved));
            } catch {
                setAttendanceRecords({});
            }
        }
    }, []);

    // 4. User attendance mapping and actions (present/absent) per subject, slot and date
    const markAttendance = (slot, status) => {
        const slotId = slot.slotId || buildSlotId(slot, slot.day || todayStr);
        
        setAttendanceRecords((prev) => {
            const updated = {
                ...prev,
                [todayDate]: {
                    ...(prev[todayDate] || {}),
                    [slotId]: {
                        status,
                        subject: slot.subject,
                        code: slot.code || 'N/A',
                        time: slot.time,
                        day: slot.day || todayStr
                    }
                }
            };
            
            localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    // Auto sync UI metrics from saved records
    const statsBySubject = useMemo(() => {
        const stats = {};

        Object.values(attendanceRecords).forEach((dateRecord) => {
            Object.values(dateRecord || {}).forEach((entry) => {
                const subjectKey = `${entry.subject}|${entry.code || 'N/A'}`;
                if (!stats[subjectKey]) {
                    stats[subjectKey] = { total: 0, attended: 0 };
                }
                stats[subjectKey].total += 1;
                if (entry.status === 'present') {
                    stats[subjectKey].attended += 1;
                }
            });
        });

        return stats;
    }, [attendanceRecords]);

    // Calculate Insights
    const getInsight = (subject) => {
        const data = statsBySubject[subject.key] || { total: 0, attended: 0 };
        if (data.total === 0) return { text: "No classes tracked yet", type: 'neutral', percentage: 100 };
        
        const percentage = Math.round((data.attended / data.total) * 100);
        
        if (percentage >= 85) {
            // How many can they bunk?
            // (attended) / (total + x) = 0.85 => x = (attended / 0.85) - total
            const canBunk = Math.floor((data.attended / (ATTENDANCE_TARGET / 100)) - data.total);
            if (canBunk > 0) {
                return { text: `You can bunk ${canBunk} more class${canBunk > 1 ? 'es' : ''} and stay above ${ATTENDANCE_TARGET}%`, type: 'safe', percentage };
            } else {
                return { text: `You're just safe at ${ATTENDANCE_TARGET}%. Don't miss the next class`, type: 'warning', percentage };
            }
        } else {
            // How many do they need to attend?
            // (attended + x) / (total + x) = target => x = (target * total - attended) / (1 - target)
            const targetRatio = ATTENDANCE_TARGET / 100;
            const needed = Math.ceil((targetRatio * data.total - data.attended) / (1 - targetRatio));
            return { text: `Attend the next ${needed} class${needed > 1 ? 'es' : ''} to reach ${ATTENDANCE_TARGET}%`, type: 'danger', percentage };
        }
    };

    // Prepare chart data
    const chartData = uniqueSubjects.map((sub) => {
        const insight = getInsight(sub);
        return {
            ...sub,
            percentage: insight.percentage
        };
    });

    const getStatusForTodaySlot = (slot) => {
        const slotId = slot.slotId || buildSlotId(slot, todayStr);
        return attendanceRecords[todayDate]?.[slotId]?.status;
    };

    const recentAttendanceHistory = useMemo(() => {
        const records = [];

        Object.entries(attendanceRecords).forEach(([date, dateRecord]) => {
            Object.values(dateRecord || {}).forEach((entry) => {
                records.push({
                    date,
                    subject: entry.subject,
                    code: entry.code,
                    time: entry.time,
                    day: entry.day,
                    status: entry.status
                });
            });
        });

        records.sort((a, b) => {
            if (a.date !== b.date) {
                return b.date.localeCompare(a.date);
            }
            return a.time.localeCompare(b.time);
        });

        return records.slice(0, 8);
    }, [attendanceRecords]);

    const formatHistoryDate = (date) => {
        const parsed = new Date(`${date}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) {
            return date;
        }
        return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const getRingStyle = (percentage) => {
        const radius = 18;
        const circumference = 2 * Math.PI * radius;
        const progress = Math.max(0, Math.min(100, percentage));
        const dashOffset = circumference - (progress / 100) * circumference;

        return {
            radius,
            circumference,
            dashOffset,
            progressColor: progress >= ATTENDANCE_TARGET ? '#a8bfff' : '#6f789b'
        };
    };

    return (
        <div className="min-h-[calc(100vh-6rem)] -mx-4 sm:-mx-6 lg:-mx-8 -my-6 bg-black text-slate-100 animate-fadeIn font-sans">
            <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 pt-4 pb-[calc(7rem+env(safe-area-inset-bottom,0px))]">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-5xl font-extrabold tracking-tight text-slate-200">Self Attendance</h1>
                        <p className="text-slate-400 text-sm mt-2">Smart attendance insights for all subjects</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mt-1 shrink-0 w-20 h-20 rounded-full bg-[#a8bfff] text-[#0c2f69] flex items-center justify-center"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-8 h-8" />
                    </button>
                </div>

                <div className="bg-[#171a23] rounded-[2rem] p-6 border border-slate-800 mb-6">
                    <h2 className="text-5xl/none sm:text-3xl font-bold text-slate-200 mb-6">Subject Performance</h2>
                    <div className="flex gap-4 items-end h-72 overflow-x-auto pb-2">
                        {chartData.map((sub, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 min-w-[6rem] flex-1">
                                <span className="text-5xl/none sm:text-4xl font-bold text-[#a8bfff]">{sub.percentage}%</span>
                                <div className="w-full bg-[#2a2f3a] rounded-3xl h-48 flex items-end overflow-hidden">
                                    <div
                                        className="w-full rounded-3xl transition-all duration-700 bg-[#9fb3e5]"
                                        style={{ height: `${Math.max(10, sub.percentage)}%` }}
                                    ></div>
                                </div>
                                <span className="text-xl sm:text-sm font-medium text-slate-400 truncate w-full text-center">{sub.shortName}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    {uniqueSubjects.map((sub, idx) => {
                        const insight = getInsight(sub);
                        const ring = getRingStyle(insight.percentage);

                        return (
                            <div key={idx} className="bg-[#171a23] rounded-3xl px-5 py-4 border border-slate-800">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="text-2xl sm:text-xl font-bold text-slate-200 truncate">{sub.name}</h3>
                                        <p className="text-slate-500 text-sm mt-1">Code: {sub.code}</p>
                                        <p className="text-[#a8bfff] text-sm mt-1 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {getNextClass(sub.name, sub.code)}
                                        </p>
                                    </div>

                                    <div className="relative w-16 h-16 shrink-0">
                                        <svg viewBox="0 0 44 44" className="w-16 h-16 -rotate-90">
                                            <circle cx="22" cy="22" r={ring.radius} stroke="#30384a" strokeWidth="4" fill="none" />
                                            <circle
                                                cx="22"
                                                cy="22"
                                                r={ring.radius}
                                                stroke={ring.progressColor}
                                                strokeWidth="4"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={ring.circumference}
                                                strokeDashoffset={ring.dashOffset}
                                            />
                                        </svg>
                                        <span className="absolute inset-0 grid place-items-center text-sm font-bold text-[#b5c6ff]">{insight.percentage}%</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-[#171a23] rounded-3xl p-5 border border-slate-800 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#a8bfff]" />
                            Today&apos;s Classes
                        </h2>
                        <span className="text-xs font-semibold bg-[#202839] text-[#a8bfff] px-3 py-1 rounded-full capitalize">{todayStr}</span>
                    </div>

                    {todaysClasses.length > 0 ? (
                        <div className="space-y-3">
                            {todaysClasses.map((slot, idx) => {
                                const status = getStatusForTodaySlot(slot);
                                return (
                                    <div key={idx} className="bg-[#202431] rounded-2xl p-4">
                                        <p className="font-semibold text-slate-200 text-sm">{slot.subject}</p>
                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5" />
                                            {slot.time}
                                        </p>
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => markAttendance(slot, 'present')}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                                                    status === 'present'
                                                        ? 'bg-emerald-500/20 text-emerald-300'
                                                        : 'bg-[#171a23] text-slate-300 hover:bg-[#252c3f]'
                                                }`}
                                            >
                                                Present
                                            </button>
                                            <button
                                                onClick={() => markAttendance(slot, 'absent')}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                                                    status === 'absent'
                                                        ? 'bg-rose-500/20 text-rose-300'
                                                        : 'bg-[#171a23] text-slate-300 hover:bg-[#252c3f]'
                                                }`}
                                            >
                                                Absent
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No classes scheduled for today.</p>
                    )}
                </div>

                <div className="bg-[#171a23] rounded-3xl p-5 border border-slate-800 mb-4">
                    <h2 className="text-base font-bold text-slate-200 mb-3">Recent Attendance</h2>
                    {recentAttendanceHistory.length > 0 ? (
                        <div className="space-y-2">
                            {recentAttendanceHistory.map((entry, idx) => (
                                <div key={`${entry.date}_${entry.time}_${entry.subject}_${idx}`} className="bg-[#202431] rounded-xl px-3 py-2 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-200 truncate">{entry.subject}</p>
                                        <p className="text-[11px] text-slate-400">{formatHistoryDate(entry.date)} | {entry.time}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                        entry.status === 'present'
                                            ? 'bg-emerald-500/20 text-emerald-300'
                                            : 'bg-rose-500/20 text-rose-300'
                                    }`}>
                                        {entry.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500">No attendance logs yet.</p>
                    )}
                </div>

                <div className="fixed left-4 right-4 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-20 mx-auto max-w-2xl">
                    <button
                        type="button"
                        onClick={() => navigate('/timetable')}
                        className="w-full h-20 rounded-full bg-[#a8bfff] text-[#0b3678] text-2xl sm:text-xl font-bold flex items-center justify-center gap-3 shadow-lg"
                    >
                        <Plus className="w-8 h-8 sm:w-6 sm:h-6" />
                        Add Subject
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
