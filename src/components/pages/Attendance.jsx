import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockClassroom } from '../../data/mockData';
import { syncNativeAttendanceToLocalStorage } from '../../services/erpNotifications';

const ATTENDANCE_STORAGE_KEY = 'self_attendance_records_v2';
const ATTENDANCE_TARGETS_KEY = 'self_attendance_targets_v1';
const DEFAULT_TARGET = 85;

const Attendance = () => {
    const navigate = useNavigate();
    const [attendanceRecords, setAttendanceRecords] = useState({});
    const [subjectTargets, setSubjectTargets] = useState({});
    const [selectedSubjectKey, setSelectedSubjectKey] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [isTargetSheetOpen, setIsTargetSheetOpen] = useState(false);

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date();
    const todayStr = days[today.getDay()];
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
                    shortName: slot.subject.replace(/[^A-Z]/g, '').slice(0, 5) || (slot.code ? slot.code.slice(-4) : 'SUBJ')
                };
            }
        });

        return Object.values(grouped);
    }, [trackableSlots]);

    const selectedSubject = useMemo(
        () => uniqueSubjects.find((subject) => subject.key === selectedSubjectKey) || null,
        [uniqueSubjects, selectedSubjectKey]
    );

    useEffect(() => {
        const loadAttendanceData = async () => {
            await syncNativeAttendanceToLocalStorage();

            const savedRecords = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
            if (savedRecords) {
                try {
                    setAttendanceRecords(JSON.parse(savedRecords));
                } catch {
                    setAttendanceRecords({});
                }
            }

            const savedTargets = localStorage.getItem(ATTENDANCE_TARGETS_KEY);
            if (savedTargets) {
                try {
                    setSubjectTargets(JSON.parse(savedTargets));
                } catch {
                    setSubjectTargets({});
                }
            }
        };

        loadAttendanceData();
    }, []);

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

    const setTargetForSubject = (subjectKey, target) => {
        setSubjectTargets((prev) => {
            const updated = {
                ...prev,
                [subjectKey]: target
            };
            localStorage.setItem(ATTENDANCE_TARGETS_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const getTargetForSubject = (subjectKey) => subjectTargets[subjectKey] || DEFAULT_TARGET;

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

    const getInsight = (subject) => {
        const data = statsBySubject[subject.key] || { total: 0, attended: 0 };
        const target = getTargetForSubject(subject.key);

        if (data.total === 0) {
            return { text: 'No classes tracked yet', percentage: 100, target };
        }

        const percentage = Math.round((data.attended / data.total) * 100);
        const targetRatio = target / 100;

        if (percentage >= target) {
            const canBunk = Math.floor((data.attended / targetRatio) - data.total);
            if (canBunk > 0) {
                return {
                    text: `You can bunk ${canBunk} more class${canBunk > 1 ? 'es' : ''} and stay above ${target}%`,
                    percentage,
                    target
                };
            }
            return {
                text: `You're just safe at ${target}%. Don't miss the next class`,
                percentage,
                target
            };
        }

        const needed = Math.ceil((targetRatio * data.total - data.attended) / (1 - targetRatio));
        return {
            text: `Attend the next ${needed} class${needed > 1 ? 'es' : ''} to reach ${target}%`,
            percentage,
            target
        };
    };

    const chartData = uniqueSubjects.map((subject) => ({
        ...subject,
        percentage: getInsight(subject).percentage
    }));

    const getNextClass = (subjectName, subjectCode) => {
        const todayIndex = today.getDay();

        for (let i = 0; i < 7; i++) {
            const checkDayIndex = (todayIndex + i) % 7;
            const checkDayStr = days[checkDayIndex];
            const classes = timetable[checkDayStr] || [];
            const found = classes.find((entry) => !isBreak(entry.subject) && entry.subject === subjectName && (entry.code || 'N/A') === subjectCode);

            if (found) {
                if (i === 0) return `Today at ${found.time.split('-')[0]}`;
                if (i === 1) return `Tomorrow at ${found.time.split('-')[0]}`;
                return `${checkDayStr.slice(0, 3)} ${found.time.split('-')[0]}`;
            }
        }

        return 'Not scheduled';
    };

    const subjectEntries = useMemo(() => {
        if (!selectedSubject) return [];

        const entries = [];
        Object.entries(attendanceRecords).forEach(([date, dateRecord]) => {
            Object.values(dateRecord || {}).forEach((entry) => {
                const key = `${entry.subject}|${entry.code || 'N/A'}`;
                if (key === selectedSubject.key) {
                    entries.push({ ...entry, date });
                }
            });
        });

        entries.sort((a, b) => {
            if (a.date !== b.date) return b.date.localeCompare(a.date);
            return a.time.localeCompare(b.time);
        });

        return entries;
    }, [attendanceRecords, selectedSubject]);

    const todaysSubjectSlots = useMemo(() => {
        if (!selectedSubject) return [];

        return (timetable[todayStr] || [])
            .filter((slot) => !isBreak(slot.subject))
            .filter((slot) => `${slot.subject}|${slot.code || 'N/A'}` === selectedSubject.key)
            .map((slot) => ({ ...slot, day: todayStr, slotId: buildSlotId(slot, todayStr) }));
    }, [selectedSubject, timetable, todayStr]);

    const getStatusForTodaySlot = (slot) => attendanceRecords[todayDate]?.[slot.slotId]?.status;

    const monthCalendar = useMemo(() => {
        if (!selectedSubject) return { weeks: [], title: '' };

        const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const totalDays = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
        const firstWeekdayMondayIndex = (firstDay.getDay() + 6) % 7;

        const statusByDay = {};
        subjectEntries.forEach((entry) => {
            const entryDate = new Date(`${entry.date}T00:00:00`);
            if (
                entryDate.getFullYear() === selectedMonth.getFullYear() &&
                entryDate.getMonth() === selectedMonth.getMonth()
            ) {
                const day = entryDate.getDate();
                const prev = statusByDay[day];
                if (!prev || prev === 'present') {
                    statusByDay[day] = entry.status;
                }
            }
        });

        const cells = [];
        for (let i = 0; i < firstWeekdayMondayIndex; i++) {
            cells.push(null);
        }
        for (let day = 1; day <= totalDays; day++) {
            cells.push({ day, status: statusByDay[day] });
        }
        while (cells.length % 7 !== 0) {
            cells.push(null);
        }

        const weeks = [];
        for (let i = 0; i < cells.length; i += 7) {
            weeks.push(cells.slice(i, i + 7));
        }

        const title = firstDay.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

        return { weeks, title };
    }, [selectedMonth, selectedSubject, subjectEntries]);

    if (selectedSubject) {
        const insight = getInsight(selectedSubject);
        const targetValue = getTargetForSubject(selectedSubject.key);

        return (
            <div className="min-h-[calc(100vh-6rem)] -mx-4 sm:-mx-6 lg:-mx-8 bg-black text-slate-100 animate-fadeIn font-sans">
            <div className="mx-auto w-full max-w-2xl px-5 sm:px-6 pt-5 pb-[calc(3rem+env(safe-area-inset-bottom,0px))]">
                        <div className="flex items-center justify-between mb-5">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedSubjectKey(null);
                                setIsTargetSheetOpen(false);
                            }}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300"
                            aria-label="Back to overview"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-[clamp(1.5rem,5vw,2rem)] leading-tight font-extrabold text-slate-200 truncate px-2">{selectedSubject.name}</h1>
                        <button
                            type="button"
                            onClick={() => setIsTargetSheetOpen(true)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300"
                            aria-label="Open subject settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mb-5">
                        <h2 className="text-[clamp(1.35rem,6vw,1.9rem)] leading-tight font-light text-slate-200">{monthCalendar.title.replace(' ', ', ')}</h2>
                    </div>

                    <div className="h-px bg-slate-700 mb-6"></div>

                    <div className="bg-[#171a23] rounded-3xl p-5 border border-slate-800 mb-7">
                        <div className="grid grid-cols-7 gap-2 mb-3">
                            {dayLabels.map((label) => (
                                <div key={label} className="text-center text-[#d4a6d9] font-medium text-sm sm:text-base">
                                    {label}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            {monthCalendar.weeks.map((week, weekIndex) => (
                                <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-2">
                                    {week.map((cell, dayIndex) => {
                                        if (!cell) {
                                            return <div key={`empty-${weekIndex}-${dayIndex}`} className="h-10"></div>;
                                        }

                                        const markerClass =
                                            cell.status === 'present'
                                                ? 'bg-[#a8bfff] text-[#0b3678]'
                                                : cell.status === 'absent'
                                                    ? 'bg-[#2f3342] text-slate-200'
                                                    : 'text-slate-300';

                                        return (
                                            <div key={`day-${weekIndex}-${dayIndex}`} className="h-10 flex items-center justify-center">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm sm:text-base ${markerClass}`}>
                                                    {cell.day}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 mb-7">
                        <button type="button" className="w-full h-14 rounded-full bg-[#a8bfff] text-[#0b3678] text-base sm:text-lg font-semibold flex items-center justify-center gap-2">
                            Attendance overview
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button type="button" className="w-full h-14 rounded-full bg-[#a8bfff] text-[#0b3678] text-base sm:text-lg font-semibold flex items-center justify-center gap-2">
                            Monthly Attendance
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {todaysSubjectSlots.length > 0 && (
                        <div className="bg-[#171a23] rounded-3xl p-5 border border-slate-800 mb-4">
                            <h3 className="text-base font-bold text-slate-200 mb-3">Mark Today</h3>
                            <div className="space-y-2">
                                {todaysSubjectSlots.map((slot) => {
                                    const status = getStatusForTodaySlot(slot);
                                    return (
                                        <div key={slot.slotId} className="bg-[#202431] rounded-xl p-3">
                                            <p className="text-sm text-slate-200 font-semibold">{slot.time}</p>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => markAttendance(slot, 'present')}
                                                    className={`px-3 py-2 rounded-lg text-xs font-bold ${
                                                        status === 'present'
                                                            ? 'bg-emerald-500/20 text-emerald-300'
                                                            : 'bg-[#171a23] text-slate-300'
                                                    }`}
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => markAttendance(slot, 'absent')}
                                                    className={`px-3 py-2 rounded-lg text-xs font-bold ${
                                                        status === 'absent'
                                                            ? 'bg-rose-500/20 text-rose-300'
                                                            : 'bg-[#171a23] text-slate-300'
                                                    }`}
                                                >
                                                    Absent
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="bg-[#171a23] rounded-3xl p-6 border border-slate-800 flex items-start gap-3">
                        <div className="w-9 h-9 mt-1 rounded-full bg-[#222739] text-[#a8bfff] flex items-center justify-center text-lg">!</div>
                        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">{insight.text}</p>
                    </div>
                </div>

                {isTargetSheetOpen && (
                    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => setIsTargetSheetOpen(false)}>
                        <div
                            className="absolute left-0 right-0 bottom-0 bg-[#171a23] rounded-t-[2rem] border-t border-slate-700 px-6 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="w-14 h-1.5 bg-slate-400 rounded-full mx-auto mb-5"></div>
                            <h3 className="text-[clamp(1.5rem,5.8vw,2rem)] leading-tight font-bold text-slate-200 mb-3">Set Attendance Target</h3>
                            <p className="text-slate-400 text-sm sm:text-base mb-8">Choose the minimum attendance percentage you want to maintain for this subject.</p>

                            <div className="text-center text-[clamp(2.2rem,11vw,3.2rem)] font-extrabold text-[#a8bfff] mb-6">{targetValue}%</div>

                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={targetValue}
                                onChange={(event) => setTargetForSubject(selectedSubject.key, Number(event.target.value))}
                                className="w-full accent-[#a8bfff] h-2"
                            />

                            <div className="flex justify-between text-slate-400 text-xs sm:text-sm mt-2 mb-7">
                                <span>0%</span>
                                <span>100%</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsTargetSheetOpen(false)}
                                className="w-full h-12 rounded-full bg-[#a8bfff] text-[#0b3678] text-base sm:text-lg font-bold"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-6rem)] -mx-4 sm:-mx-6 lg:-mx-8 bg-black text-slate-100 animate-fadeIn font-sans">
            <div className="mx-auto w-full max-w-2xl px-5 sm:px-6 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
                <div className="flex items-start justify-between mb-7">
                    <div>
                        <h1 className="text-[clamp(2rem,8vw,3rem)] leading-none font-extrabold tracking-tight text-slate-200">Self Attendance</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mt-1 shrink-0 w-14 h-14 rounded-full bg-[#a8bfff] text-[#0c2f69] flex items-center justify-center"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </div>

                <div className="bg-[#171a23] rounded-[2rem] p-6 border border-slate-800 mb-7">
                    <h2 className="text-[clamp(1.5rem,6vw,2.1rem)] leading-tight font-bold text-slate-200 mb-5">Subject Performance</h2>
                    <div className="flex gap-3 items-end h-56 overflow-x-auto overflow-y-visible pt-2 pb-2">
                        {chartData.map((subject, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 min-w-[4.75rem] flex-1">
                                <span className="text-base sm:text-lg font-bold text-[#a8bfff]">{subject.percentage}%</span>
                                <div className="w-full bg-[#2a2f3a] rounded-2xl h-36 flex items-end overflow-hidden">
                                    <div className="w-full rounded-3xl transition-all duration-700 bg-[#9fb3e5]" style={{ height: `${Math.max(10, subject.percentage)}%` }}></div>
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-slate-400 truncate w-full text-center">{subject.shortName}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 pb-2">
                    {uniqueSubjects.map((subject) => {
                        const insight = getInsight(subject);
                        return (
                            <button
                                type="button"
                                key={subject.key}
                                onClick={() => {
                                    setSelectedSubjectKey(subject.key);
                                    setSelectedMonth(new Date());
                                }}
                                className="w-full text-left bg-[#171a23] rounded-3xl px-5 py-4 border border-slate-800"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="text-[clamp(1.35rem,5vw,1.8rem)] leading-tight font-bold text-slate-200 truncate">{subject.name}</h3>
                                        <p className="text-slate-500 text-sm mt-1">Code: {subject.code}</p>
                                        <p className="text-[#a8bfff] text-sm mt-1 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {getNextClass(subject.name, subject.code)}
                                        </p>
                                    </div>
                                    <div className="w-14 h-14 rounded-full border-2 border-[#3b445a] text-[#a8bfff] flex items-center justify-center font-bold text-sm shrink-0">
                                        {insight.percentage}%
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default Attendance;
