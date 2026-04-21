import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, GraduationCap, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockClassroom } from '../../data/mockData';

const ATTENDANCE_STORAGE_KEY = 'self_attendance_records_v2';

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
            const canBunk = Math.floor((data.attended / 0.85) - data.total);
            if (canBunk > 0) {
                return { text: `You can bunk ${canBunk} more class${canBunk > 1 ? 'es' : ''} and stay above 85%`, type: 'safe', percentage };
            } else {
                return { text: "You're just safe at 85%. Don't miss the next class", type: 'warning', percentage };
            }
        } else {
            // How many do they need to attend?
            // (attended + x) / (total + x) = 0.85 => x = (0.85 * total - attended) / 0.15
            const needed = Math.ceil((0.85 * data.total - data.attended) / 0.15);
            return { text: `Attend the next ${needed} class${needed > 1 ? 'es' : ''} to reach 85%`, type: 'danger', percentage };
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

    return (
        <div className="min-h-[calc(100vh-6rem)] -mx-4 sm:-mx-6 lg:-mx-8 -my-6 bg-[#0f1115] text-slate-100 p-4 sm:p-6 lg:p-8 animate-fadeIn font-sans">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Self Attendance</h1>
                    <p className="text-slate-400 text-sm mt-1">Smart insights for all subjects</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Chart & Today's Actions */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    
                    {/* Bar Chart Panel */}
                    <div className="bg-[#1c1f26] rounded-3xl p-6 shadow-2xl border border-slate-800">
                        <h2 className="text-lg font-bold text-white mb-6">Subject Performance</h2>
                        <div className="flex gap-2 sm:gap-4 items-end h-48 overflow-x-auto pb-2 scrollbar-hide">
                            {chartData.map((sub, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-2 flex-1 min-w-[3.5rem]">
                                    <span className="text-xs font-bold text-slate-300">{sub.percentage}%</span>
                                    <div className="w-full bg-[#2a2f3a] rounded-xl h-32 flex items-end overflow-hidden relative group">
                                        <div 
                                            className={`w-full rounded-xl transition-all duration-1000 ${
                                                sub.percentage >= 85 ? 'bg-indigo-400' : 'bg-rose-400'
                                            }`} 
                                            style={{ height: `${sub.percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center tracking-wider">{sub.shortName}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Today's Classes Actions */}
                    <div className="bg-[#1c1f26] rounded-3xl p-6 shadow-2xl border border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-400" />
                                Today's Classes
                            </h2>
                            <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full capitalize">
                                {todayStr}
                            </span>
                        </div>

                        {todaysClasses.length > 0 ? (
                            <div className="space-y-4">
                                {todaysClasses.map((slot, idx) => {
                                    const status = getStatusForTodaySlot(slot);
                                    return (
                                        <div key={idx} className="bg-[#2a2f3a] p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <div className="font-bold text-slate-200 text-sm">{slot.subject}</div>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {slot.time}
                                                </div>
                                            </div>
                                            <div className="flex bg-[#1c1f26] rounded-xl p-1 w-full sm:w-auto shrink-0">
                                                <button
                                                    onClick={() => markAttendance(slot, 'present')}
                                                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                                        status === 'present' 
                                                        ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' 
                                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                                    }`}
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    onClick={() => markAttendance(slot, 'absent')}
                                                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                                        status === 'absent' 
                                                        ? 'bg-rose-500/20 text-rose-400 shadow-sm' 
                                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
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
                            <div className="text-center py-8 text-slate-500 text-sm font-medium">
                                No classes scheduled for today. Enjoy!
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Detailed Insight Cards */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-[#1c1f26] rounded-3xl p-5 shadow-lg border border-slate-800">
                        <h2 className="text-sm font-bold text-white mb-3 px-1">Recent Attendance</h2>
                        {recentAttendanceHistory.length > 0 ? (
                            <div className="space-y-2">
                                {recentAttendanceHistory.map((entry, idx) => (
                                    <div key={`${entry.date}_${entry.time}_${entry.subject}_${idx}`} className="bg-[#2a2f3a] rounded-xl px-3 py-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-200 truncate">{entry.subject}</p>
                                                <p className="text-[11px] text-slate-400">
                                                    {formatHistoryDate(entry.date)} | {entry.time}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                                entry.status === 'present'
                                                    ? 'bg-emerald-500/20 text-emerald-300'
                                                    : 'bg-rose-500/20 text-rose-300'
                                            }`}>
                                                {entry.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 px-1">No attendance logs yet.</p>
                        )}
                    </div>

                    <h2 className="text-lg font-bold text-white mb-2 px-2">All Subjects</h2>
                    
                    {uniqueSubjects.map((sub, idx) => {
                        const insight = getInsight(sub);
                        return (
                            <div key={idx} className="bg-[#1c1f26] rounded-3xl p-5 shadow-lg border border-slate-800 flex flex-col gap-3 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-16 h-16" />
                                </div>
                                
                                <div className="flex justify-between items-start">
                                    <div className="pr-12">
                                        <h3 className="font-bold text-slate-200 text-sm leading-tight">{sub.name}</h3>
                                        <div className="text-[10px] text-slate-500 font-mono mt-1">{sub.code}</div>
                                    </div>
                                    <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#2a2f3a] relative z-10">
                                        <span className={`text-xs font-bold ${insight.percentage >= 85 ? 'text-indigo-400' : 'text-rose-400'}`}>
                                            {insight.percentage}%
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    {getNextClass(sub.name, sub.code)}
                                </div>
                                
                                <div className={`mt-2 p-3 rounded-xl flex items-start gap-3 ${
                                    insight.type === 'safe' ? 'bg-emerald-500/10 text-emerald-300' :
                                    insight.type === 'warning' ? 'bg-amber-500/10 text-amber-300' :
                                    'bg-rose-500/10 text-rose-300'
                                }`}>
                                    {insight.type === 'safe' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> :
                                     insight.type === 'warning' ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> :
                                     <GraduationCap className="w-4 h-4 mt-0.5 shrink-0" />}
                                    <p className="text-xs font-medium leading-relaxed">{insight.text}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
            </div>
        </div>
    );
};

export default Attendance;
