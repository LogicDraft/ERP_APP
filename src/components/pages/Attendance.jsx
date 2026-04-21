import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Circle, Save, Users, AlertCircle } from 'lucide-react';
import { mockClassroom } from '../../data/mockData';
import { Card } from '../ui/Card';

const Attendance = () => {
    const { timetable, students } = mockClassroom;
    
    // Get current date details
    const todayObj = new Date();
    const dateKey = todayObj.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIndex = todayObj.getDay();
    const today = days[todayIndex];
    
    // Filter out breaks to get actual classes
    const isBreak = (subject) => {
        const upper = subject.toUpperCase();
        return upper.includes('BREAK') || upper.includes('LUNCH');
    };
    
    const todaysClasses = (timetable[today] || []).filter(cls => !isBreak(cls.subject));

    const [selectedClassIdx, setSelectedClassIdx] = useState(0);
    const [attendanceData, setAttendanceData] = useState({});
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // Load attendance from localStorage on mount
    useEffect(() => {
        const storedData = localStorage.getItem('erp_attendance_data');
        if (storedData) {
            try {
                setAttendanceData(JSON.parse(storedData));
            } catch (e) {
                console.error("Failed to parse attendance data", e);
            }
        }
    }, []);

    // Save attendance to localStorage
    const saveToLocalStorage = (data) => {
        localStorage.setItem('erp_attendance_data', JSON.stringify(data));
        setAttendanceData(data);
    };

    const handleMarkAttendance = (studentId, status) => {
        if (!todaysClasses.length) return;
        
        const currentClass = todaysClasses[selectedClassIdx];
        const classId = `${currentClass.code}_${currentClass.time}`; // Unique identifier for the class slot
        
        const newData = { ...attendanceData };
        if (!newData[dateKey]) newData[dateKey] = {};
        if (!newData[dateKey][classId]) newData[dateKey][classId] = {};
        
        newData[dateKey][classId][studentId] = status;
        
        saveToLocalStorage(newData);
    };

    const handleMarkAll = (status) => {
        if (!todaysClasses.length) return;
        
        const currentClass = todaysClasses[selectedClassIdx];
        const classId = `${currentClass.code}_${currentClass.time}`;
        
        const newData = { ...attendanceData };
        if (!newData[dateKey]) newData[dateKey] = {};
        if (!newData[dateKey][classId]) newData[dateKey][classId] = {};
        
        students.forEach(student => {
            newData[dateKey][classId][student._id] = status;
        });
        
        saveToLocalStorage(newData);
    };

    const handleSaveAndNotify = () => {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
    };

    const currentClass = todaysClasses[selectedClassIdx];
    const classId = currentClass ? `${currentClass.code}_${currentClass.time}` : null;
    const currentAttendance = (attendanceData[dateKey] && classId && attendanceData[dateKey][classId]) || {};

    // Calculate stats
    const presentCount = students.filter(s => currentAttendance[s._id] === 'present').length;
    const absentCount = students.filter(s => currentAttendance[s._id] === 'absent').length;
    const unmarkedCount = students.length - presentCount - absentCount;

    return (
        <div className="space-y-6 animate-fadeIn pb-24">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Attendance</h1>
                    <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {todayObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {todaysClasses.length === 0 ? (
                <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-200">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                        <Calendar className="w-12 h-12 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-700">No Classes Today</h2>
                    <p className="text-slate-500 mt-2 max-w-md">There are no valid classes scheduled for today. Take a break and enjoy your day!</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar / Top Nav for Classes */}
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs ml-1">Today's Schedule</h3>
                        <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-3 pb-2 lg:pb-0 hide-scrollbar">
                            {todaysClasses.map((cls, idx) => {
                                const isSelected = selectedClassIdx === idx;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedClassIdx(idx)}
                                        className={`flex-shrink-0 lg:flex-shrink w-64 lg:w-full text-left p-4 rounded-2xl transition-all duration-300 border ${
                                            isSelected 
                                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 border-transparent transform lg:translate-x-2' 
                                            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-100 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className={`w-4 h-4 ${isSelected ? 'text-indigo-200' : 'text-indigo-500'}`} />
                                            <span className={`text-xs font-bold ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                                                {cls.time}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-sm line-clamp-2 leading-tight">
                                            {cls.subject}
                                        </h4>
                                        <p className={`text-xs mt-2 font-medium ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                                            {cls.code}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Attendance Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Class Header & Actions */}
                        <Card className="p-6 bg-white border-slate-100 shadow-md rounded-2xl">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{currentClass.subject}</h2>
                                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 font-medium">
                                        <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                                            <Clock className="w-4 h-4 text-indigo-500" />
                                            {currentClass.time}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                                            <Users className="w-4 h-4 text-emerald-500" />
                                            {students.length} Students
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button 
                                        onClick={() => handleMarkAll('present')}
                                        className="flex-1 md:flex-none px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl text-sm transition-colors"
                                    >
                                        Mark All Present
                                    </button>
                                    <button 
                                        onClick={() => handleMarkAll('absent')}
                                        className="flex-1 md:flex-none px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl text-sm transition-colors"
                                    >
                                        Mark All Absent
                                    </button>
                                </div>
                            </div>
                            
                            {/* Summary Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                                <div className="bg-emerald-50 rounded-xl p-3 flex flex-col items-center justify-center border border-emerald-100">
                                    <span className="text-2xl font-black text-emerald-600">{presentCount}</span>
                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Present</span>
                                </div>
                                <div className="bg-rose-50 rounded-xl p-3 flex flex-col items-center justify-center border border-rose-100">
                                    <span className="text-2xl font-black text-rose-600">{absentCount}</span>
                                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">Absent</span>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-200">
                                    <span className="text-2xl font-black text-slate-600">{unmarkedCount}</span>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Unmarked</span>
                                </div>
                            </div>
                        </Card>

                        {/* Student List */}
                        <div className="space-y-3">
                            {students.map((student) => {
                                const status = currentAttendance[student._id] || 'unmarked';
                                
                                return (
                                    <div key={student._id} className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0">
                                                {student.roll}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 leading-tight">{student.name}</h4>
                                                <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
                                                    <span className="uppercase">{student.usn}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span>{student.gender}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto">
                                            <button
                                                onClick={() => handleMarkAttendance(student._id, 'present')}
                                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                                    status === 'present' 
                                                    ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-200' 
                                                    : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50'
                                                }`}
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Present
                                            </button>
                                            
                                            <button
                                                onClick={() => handleMarkAttendance(student._id, 'absent')}
                                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                                    status === 'absent' 
                                                    ? 'bg-white text-rose-600 shadow-sm ring-1 ring-rose-200' 
                                                    : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50/50'
                                                }`}
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Absent
                                            </button>
                                            
                                            <button
                                                onClick={() => handleMarkAttendance(student._id, 'unmarked')}
                                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                                    status === 'unmarked' 
                                                    ? 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200' 
                                                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/50'
                                                }`}
                                            >
                                                <Circle className="w-4 h-4" />
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button for saving locally or syncing */}
            {todaysClasses.length > 0 && (
                <div className="fixed bottom-6 right-6 z-40">
                    <button 
                        onClick={handleSaveAndNotify}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-full shadow-xl shadow-indigo-200 flex items-center gap-2 font-bold transition-transform hover:scale-105 active:scale-95"
                    >
                        <Save className="w-5 h-5" />
                        Save Records
                    </button>
                </div>
            )}

            {/* Save Success Toast */}
            {showSaveSuccess && (
                <div className="fixed bottom-24 right-6 z-50 animate-slideUp">
                    <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-bold text-sm">Attendance saved locally!</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
