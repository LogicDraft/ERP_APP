import React from 'react';
import { Card } from '../ui/Card';
import { User, MapPin, Users, Award } from 'lucide-react';

const InfoCard = ({ institutionDetails, studentCount }) => {
    return (
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Class Teacher</p>
                        <p className="font-semibold text-slate-900 text-sm">{institutionDetails.classTeacher}</p>
                    </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-pink-100 text-pink-600 rounded-full">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Room</p>
                        <p className="font-semibold text-slate-900 text-sm">{institutionDetails.roomNumber}</p>
                    </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Students</p>
                        <p className="font-semibold text-slate-900 text-sm">{studentCount}</p>
                    </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">CRs</p>
                        <p className="font-semibold text-slate-900 text-xs">
                            {institutionDetails.classRepresentative.boy} & {institutionDetails.classRepresentative.girl}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default InfoCard;
