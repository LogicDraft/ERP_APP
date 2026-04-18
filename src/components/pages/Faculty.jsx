import React from 'react';
import { Phone, Mail, User } from 'lucide-react';
import { mockClassroom } from '../../data/mockData';
import { Card } from '../ui/Card';

const Faculty = () => {
    const { facultyContactInfo } = mockClassroom;

    return (
        <div className="space-y-8 animate-fadeIn">
            <h1 className="text-3xl font-extrabold text-slate-900">Faculty Directory</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(facultyContactInfo).map(([key, faculty]) => (
                    <Card key={key} className="border border-slate-100 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white mb-4 border-2 border-white/20 shadow-inner">
                                <User size={40} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{faculty.name}</h3>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100 group/item">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover/item:text-indigo-500 group-hover/item:border-indigo-200 transition-colors">
                                    <Phone size={18} />
                                </div>
                                <div className="ml-3">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mobile</p>
                                    <p className="text-sm font-semibold text-slate-700 group-hover/item:text-indigo-700">{faculty.mobile}</p>
                                </div>
                            </div>

                            <a href={`mailto:${faculty.email}`} className="flex items-center p-3 bg-slate-50 rounded-xl hover:bg-purple-50 transition-colors group/item">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover/item:text-purple-500 group-hover/item:border-purple-200 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <div className="ml-3 overflow-hidden">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email</p>
                                    <p className="text-sm font-semibold text-slate-700 truncate group-hover/item:text-purple-700">{faculty.email}</p>
                                </div>
                            </a>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Faculty;
