import React, { useState } from 'react';
import { CheckCircle, XCircle, ClipboardCheck, RotateCcw } from 'lucide-react';
import { mockClassroom } from '../../data/mockData';
import { Card } from '../ui/Card';

const Attendance = () => {
    const { students } = mockClassroom;
    // Sort students alphabetically for the list
    const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name));

    // Initialize all students as present (true)
    const [attendanceState, setAttendanceState] = useState(
        sortedStudents.reduce((acc, student) => {
            acc[student.auid] = true;
            return acc;
        }, {})
    );

    const [isSubmitted, setIsSubmitted] = useState(false);

    const toggleAttendance = (auid) => {
        if (isSubmitted) return;
        setAttendanceState(prev => ({
            ...prev,
            [auid]: !prev[auid]
        }));
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
    };

    const handleReset = () => {
        setIsSubmitted(false);
        setAttendanceState(
            sortedStudents.reduce((acc, student) => {
                acc[student.auid] = true;
                return acc;
            }, {})
        );
    };

    const presentCount = Object.values(attendanceState).filter(status => status).length;
    const absentCount = sortedStudents.length - presentCount;

    const absentees = sortedStudents.filter(student => !attendanceState[student.auid]);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold text-slate-900">Daily Attendance</h1>
                {!isSubmitted ? (
                    <button
                        onClick={handleSubmit}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md font-medium"
                    >
                        <ClipboardCheck className="w-5 h-5 mr-2" />
                        Submit Attendance
                    </button>
                ) : (
                    <button
                        onClick={handleReset}
                        className="flex items-center px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-medium"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Reset
                    </button>
                )}
            </div>

            {isSubmitted ? (
                <div className="space-y-6 animate-slideUp">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-emerald-50 border border-emerald-100 shadow-md">
                            <div className="text-center py-4">
                                <h3 className="text-lg font-bold text-emerald-800 uppercase tracking-wider">Present</h3>
                                <p className="text-5xl font-extrabold text-emerald-600 mt-2">{presentCount}</p>
                            </div>
                        </Card>
                        <Card className="bg-rose-50 border border-rose-100 shadow-md">
                            <div className="text-center py-4">
                                <h3 className="text-lg font-bold text-rose-800 uppercase tracking-wider">Absent</h3>
                                <p className="text-5xl font-extrabold text-rose-600 mt-2">{absentCount}</p>
                            </div>
                        </Card>
                    </div>

                    <Card className="border border-slate-100 shadow-lg">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Absentees List</h3>
                        {absentees.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">AUID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-50">
                                        {absentees.map((student) => (
                                            <tr key={student.auid} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{student.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{student.auid}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <CheckCircle className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Everyone is present!</p>
                            </div>
                        )}
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedStudents.map((student) => (
                        <button
                            key={student.auid}
                            onClick={() => toggleAttendance(student.auid)}
                            className={`p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group hover:shadow-md ${attendanceState[student.auid]
                                ? 'bg-white border-emerald-400 hover:bg-emerald-50'
                                : 'bg-rose-50 border-rose-400'
                                }`}
                        >
                            <div className="text-left overflow-hidden">
                                <p className={`font-bold truncate ${attendanceState[student.auid] ? 'text-slate-800' : 'text-rose-900'}`}>{student.name}</p>
                                <p className="text-xs text-slate-500 font-mono mt-1">{student.auid}</p>
                            </div>
                            <div className="flex-shrink-0 ml-3">
                                {attendanceState[student.auid] ? (
                                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-rose-500" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Attendance;
