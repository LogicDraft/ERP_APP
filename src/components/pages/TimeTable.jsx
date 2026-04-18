import React from 'react';
import { Calendar, Clock, Laptop } from 'lucide-react';
import { mockClassroom } from '../../data/mockData';
import { Card } from '../ui/Card';

const TimeTable = () => {
    const { timetable } = mockClassroom;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // Helper to check if a subject is a break
    const isBreak = (subject) => {
        const upper = subject.toUpperCase();
        return upper.includes('BREAK') || upper.includes('LUNCH');
    };

    // Helper to check if a slot requires a laptop
    const isLaptopClass = (slot) => {
        return slot.requiresLaptop === true;
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900">Weekly Timetable</h1>
                <span className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                    {mockClassroom.institutionDetails.cycle}
                </span>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-6">
                {days.map((day) => {
                    const subjects = timetable[day];
                    if (!subjects || subjects.length === 0) return null;

                    return (
                        <Card key={day} className="overflow-hidden border border-slate-100 shadow-lg rounded-2xl">
                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2 capitalize">
                                    <Calendar className="w-5 h-5" />
                                    {day}
                                </h2>
                            </div>
                            <div className="p-4 space-y-3">
                                {subjects.map((slot, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-xl border-l-4 shadow-sm ${isBreak(slot.subject)
                                            ? 'bg-amber-50 border-amber-400'
                                            : isLaptopClass(slot)
                                                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-500'
                                                : 'bg-white border-indigo-500'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {isLaptopClass(slot) ? (
                                                <Laptop className="w-5 h-5 mt-0.5 flex-shrink-0 text-purple-600" />
                                            ) : (
                                                <Clock className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isBreak(slot.subject) ? 'text-amber-600' : 'text-indigo-500'
                                                    }`} />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-xs font-bold mb-1 uppercase tracking-wide ${isBreak(slot.subject)
                                                    ? 'text-amber-700'
                                                    : isLaptopClass(slot)
                                                        ? 'text-purple-700'
                                                        : 'text-indigo-600'
                                                    }`}>
                                                    {slot.time}
                                                </div>
                                                <div className={`text-sm font-bold ${isBreak(slot.subject)
                                                    ? 'text-amber-900'
                                                    : isLaptopClass(slot)
                                                        ? 'text-purple-900'
                                                        : 'text-slate-800'
                                                    }`}>
                                                    {slot.subject}
                                                    {isLaptopClass(slot) && (
                                                        <span className="ml-2 text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                                            Bring Laptop
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block">
                <Card className="overflow-hidden border border-slate-100 shadow-xl rounded-2xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-32 sticky left-0 bg-slate-50 z-10">Day</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {days.map((day) => {
                                    const subjects = timetable[day];
                                    if (!subjects || subjects.length === 0) return null;

                                    return (
                                        <tr key={day} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-6 whitespace-nowrap text-sm font-bold text-slate-900 border-r border-slate-100 bg-slate-50/50 sticky left-0 capitalize">
                                                {day}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-wrap gap-3">
                                                    {subjects.map((slot, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`flex flex-col p-3 rounded-xl border text-sm w-48 shrink-0 transition-all duration-200 ${isBreak(slot.subject)
                                                                ? 'bg-amber-50 border-amber-200 text-amber-900'
                                                                : isLaptopClass(slot)
                                                                    ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:border-purple-400 hover:shadow-md'
                                                                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className={`font-bold text-xs ${isBreak(slot.subject)
                                                                    ? 'text-amber-700'
                                                                    : isLaptopClass(slot)
                                                                        ? 'text-purple-700'
                                                                        : 'text-indigo-600'
                                                                    }`}>
                                                                    {slot.time}
                                                                </span>
                                                                {isLaptopClass(slot) && (
                                                                    <Laptop className="w-3.5 h-3.5 text-purple-600" />
                                                                )}
                                                            </div>
                                                            <span className={`font-semibold leading-tight ${isBreak(slot.subject) ? 'text-amber-900' : 'text-slate-800'
                                                                }`}>
                                                                {slot.subject}
                                                            </span>
                                                            {isLaptopClass(slot) && (
                                                                <span className="mt-2 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full inline-block w-fit font-bold uppercase tracking-wider">
                                                                    💻 Bring Laptop
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TimeTable;
