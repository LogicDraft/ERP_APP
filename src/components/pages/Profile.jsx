import React, { useEffect, useState, useRef } from 'react';
import { User, BookOpen, Hash, Users, Award, Calendar, ArrowLeft, Phone, Mail, Cake, Camera, Edit2, Save, X, Droplet } from 'lucide-react';
import { mockClassroom } from '../../data/mockData';
import { Card } from '../ui/Card';

const Profile = () => {
    const [student, setStudent] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [profilePhoto, setProfilePhoto] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const userAuid = localStorage.getItem('userAuid');
        if (userAuid) {
            const foundStudent = mockClassroom.students.find(s => s.auid === userAuid);
            setStudent(foundStudent);

            const storedData = localStorage.getItem(`profile_${userAuid}`);
            if (storedData) {
                setProfileData(JSON.parse(storedData));
                setEditedData(JSON.parse(storedData));
            }

            const storedPhoto = localStorage.getItem(`photo_${userAuid}`);
            if (storedPhoto) {
                setProfilePhoto(storedPhoto);
            }
        }
    }, []);

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const photo = reader.result;
                setProfilePhoto(photo);
                localStorage.setItem(`photo_${student.auid}`, photo);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (editedData.collegeEmail && !editedData.collegeEmail.endsWith('@acharya.ac.in')) {
            alert('College email must end with @acharya.ac.in');
            return;
        }
        localStorage.setItem(`profile_${student.auid}`, JSON.stringify(editedData));
        setProfileData(editedData);
        setIsEditing(false);
    };

    if (!student) return <div className="p-6">Loading...</div>;

    const { institutionDetails } = mockClassroom;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 pb-20">
            {/* Header with Profile Photo */}
            {/* Header with Profile Photo */}
            <div className="relative h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                <div className="flex flex-col items-center">
                    {/* Profile Photo */}
                    <div className="relative group mb-4">
                        <div className="w-40 h-40 rounded-full bg-white p-1.5 shadow-2xl">
                            {profilePhoto ? (
                                <img src={profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center border-4 border-white">
                                    <User className="w-20 h-20 text-white" />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-2 right-2 bg-white p-2.5 rounded-full shadow-lg hover:bg-indigo-50 transition-colors border border-slate-100 group-hover:scale-110 active:scale-95"
                            title="Upload Photo"
                        >
                            <Camera className="w-5 h-5 text-indigo-600" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Name and Basic Info */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-1">{student.name}</h2>
                        <div className="flex items-center justify-center gap-3 text-slate-500 font-medium text-lg mb-4">
                            <span>USN: <span className="text-indigo-600 font-bold">{student.usn}</span></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            <span>AUID: {student.auid}</span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 mb-6">
                            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-sm font-semibold text-slate-700">Active Student</span>
                            </div>
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all shadow-sm ${isEditing
                                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                                    }`}
                            >
                                {isEditing ? <><Save size={18} /> Save Profile</> : <><Edit2 size={18} /> Edit Profile</>}
                            </button>
                        </div>

                        <div className="max-w-2xl mx-auto">
                            <p className="text-slate-600 text-sm font-medium italic bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 inline-block">
                                " {(() => {
                                    const quotes = [
                                        "The best way to predict the future is to invent it.",
                                        "Innovation distinguishes between a leader and a follower.",
                                        "Technology is best when it brings people together.",
                                        "First, solve the problem. Then, write the code.",
                                        "Quality is not an act, it is a habit."
                                    ];
                                    const hour = new Date().getHours();
                                    return quotes[hour % quotes.length];
                                })()} "
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-12 space-y-6">
                {/* Personal Information */}
                {profileData && (
                    <Card className="bg-white border border-slate-100 shadow-md rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                            <User className="w-5 h-5 mr-2 text-indigo-500" />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date of Birth</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <Cake className="w-5 h-5 text-pink-500" />
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editedData.dateOfBirth}
                                            onChange={(e) => setEditedData({ ...editedData, dateOfBirth: e.target.value })}
                                            className="bg-transparent outline-none w-full font-medium text-slate-900"
                                        />
                                    ) : (
                                        <span className="font-medium text-slate-900">{profileData.dateOfBirth}</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <Phone className="w-5 h-5 text-indigo-500" />
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editedData.phoneNumber}
                                            onChange={(e) => setEditedData({ ...editedData, phoneNumber: e.target.value })}
                                            className="bg-transparent outline-none w-full font-medium text-slate-900"
                                        />
                                    ) : (
                                        <span className="font-medium text-slate-900">{profileData.phoneNumber}</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal Email</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <Mail className="w-5 h-5 text-purple-500" />
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={editedData.emailId}
                                            onChange={(e) => setEditedData({ ...editedData, emailId: e.target.value })}
                                            className="bg-transparent outline-none w-full font-medium text-slate-900"
                                        />
                                    ) : (
                                        <span className="font-medium text-slate-900">{profileData.emailId}</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">College Email</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <Mail className="w-5 h-5 text-blue-500" />
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            placeholder="example@acharya.ac.in"
                                            value={editedData.collegeEmail || ''}
                                            onChange={(e) => setEditedData({ ...editedData, collegeEmail: e.target.value })}
                                            className="bg-transparent outline-none w-full font-medium text-slate-900"
                                        />
                                    ) : (
                                        <span className="font-medium text-slate-900">{profileData.collegeEmail || 'Not Provided'}</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blood Group</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <Droplet className="w-5 h-5 text-red-500" />
                                    {isEditing ? (
                                        <select
                                            value={editedData.bloodGroup || ''}
                                            onChange={(e) => setEditedData({ ...editedData, bloodGroup: e.target.value })}
                                            className="bg-transparent outline-none w-full font-medium text-slate-900"
                                        >
                                            <option value="">Select</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                    ) : (
                                        <span className="font-medium text-slate-900">{profileData.bloodGroup || 'Not Provided'}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Academic Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-white border border-slate-100 shadow-md rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                            <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
                            Academic Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-slate-500">Department</span>
                                <span className="font-medium text-slate-900 text-right break-words whitespace-normal max-w-[60%]">{institutionDetails.department}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-slate-500">Semester</span>
                                <span className="font-medium text-slate-900">{institutionDetails.semester}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-slate-500">Section</span>
                                <span className="font-medium text-slate-900">{institutionDetails.section}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-slate-500">USN</span>
                                <span className="font-bold text-indigo-600">{student.usn}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-slate-500">Roll Number</span>
                                <span className="font-medium text-slate-900">{student.roll}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white border border-slate-100 shadow-md rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-indigo-500" />
                            Mentorship
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-slate-500">Mentor Name</span>
                                <span className="font-medium text-slate-900 text-right break-words whitespace-normal max-w-[60%]">{student.mentor}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-slate-500">Cycle</span>
                                <span className="font-medium text-slate-900">{institutionDetails.cycle}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
