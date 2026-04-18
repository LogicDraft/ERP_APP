import React, { useMemo } from 'react';
import { Phone, Mail, Users } from 'lucide-react';
import { mockClassroom } from '../../data/mockData';
import { Card } from '../ui/Card';

const MentorAllocation = () => {
    const { students, facultyContactInfo } = mockClassroom;

    // Group students by mentor
    const mentorGroups = useMemo(() => {
        const groups = {};
        students.forEach(student => {
            if (!groups[student.mentor]) {
                groups[student.mentor] = [];
            }
            groups[student.mentor].push(student);
        });
        return groups;
    }, [students]);

    // Helper to find mentor details (fuzzy match or direct lookup)
    const getMentorDetails = (mentorName) => {
        // Try to find matching faculty info
        const faculty = Object.values(facultyContactInfo).find(f =>
            mentorName.includes(f.name) || f.name.includes(mentorName)
        );
        return faculty || { mobile: '', email: '' };
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900">Mentor Allocation</h1>
                <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                    Section {mockClassroom.institutionDetails.section}
                </span>
            </div>

            <div className="grid gap-8">
                {Object.entries(mentorGroups).map(([mentorName, groupStudents], index) => {
                    const mentorDetails = getMentorDetails(mentorName);

                    return (
                        <Card key={index} className="overflow-hidden border border-slate-100 shadow-lg rounded-2xl">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Users className="w-6 h-6 text-indigo-100" />
                                    {mentorName}
                                </h2>
                                <div className="flex flex-wrap gap-6 mt-3 text-sm text-indigo-50">
                                    <div className="flex items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                        <Phone size={14} className="mr-2 opacity-75" />
                                        {mentorDetails.mobile}
                                    </div>
                                    <div className="flex items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                        <Mail size={14} className="mr-2 opacity-75" />
                                        {mentorDetails.email}
                                    </div>
                                    <div className="ml-auto font-bold bg-white text-indigo-600 px-3 py-1 rounded-full shadow-sm">
                                        {groupStudents.length} Students
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sl. No</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">AUID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-50">
                                        {groupStudents.map((student, idx) => (
                                            <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-400">{idx + 1}</td>
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default MentorAllocation;
