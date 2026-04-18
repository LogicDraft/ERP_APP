import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { mockClassroom } from '../../data/mockData';
import { Card } from '../ui/Card';


const StudentList = () => {
    // useBackButton(); // Removed
    const { students } = mockClassroom;
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState('All');

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.auid.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGender = genderFilter === 'All' || student.gender === genderFilter;
        return matchesSearch && matchesGender;
    });

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-extrabold text-slate-900">Student List</h1>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by Name or AUID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 w-full sm:w-64 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value)}
                            className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white shadow-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <option value="All">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-hidden border border-white/20 shadow-xl rounded-2xl bg-white/80 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-indigo-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Roll No</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">AUID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mentor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <tr
                                        key={student._id}
                                        className="hover:bg-indigo-50/30 transition-colors group animate-fadeIn"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-400 group-hover:text-indigo-500 transition-colors">{student.roll}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{student.auid}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${student.gender === 'Female'
                                                ? 'bg-pink-100 text-pink-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {student.gender}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 max-w-xs truncate" title={student.mentor}>
                                            {student.mentor}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        No students found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-indigo-50/30 px-6 py-3 border-t border-slate-100 text-sm text-slate-500 font-medium backdrop-blur-sm">
                    Showing {filteredStudents.length} of {students.length} students
                </div>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                        <div
                            key={student._id}
                            className="p-4 bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl active:scale-98 transition-all animate-slideUp"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{student.name}</h3>
                                    <p className="text-xs font-mono text-slate-500">{student.auid}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${student.gender === 'Female'
                                    ? 'bg-pink-100 text-pink-600'
                                    : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {student.roll}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="text-slate-500">Gender</span>
                                    <span className="font-medium text-slate-700">{student.gender}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="text-slate-500">Mentor</span>
                                    <span className="font-medium text-slate-700 text-right max-w-[60%] truncate">{student.mentor}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-slate-400 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-100 border-dashed">
                        No students found.
                    </div>
                )}
                <div className="text-center text-xs text-slate-400 mt-4">
                    Showing {filteredStudents.length} of {students.length} students
                </div>
            </div>
        </div>
    );
};

export default StudentList;
