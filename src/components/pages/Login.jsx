import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight } from 'lucide-react';
import { mockClassroom } from '../../data/mockData';
import ProfileCompletionModal from '../ProfileCompletionModal';

const Login = () => {
    const [loginId, setLoginId] = useState('');
    const [error, setError] = useState('');
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        // Find student by exact match or last 3 digits of AUID or USN
        const normalizedInput = loginId.trim().toUpperCase();
        const student = mockClassroom.students.find(s => 
            s.auid.toUpperCase() === normalizedInput || 
            s.usn.toUpperCase() === normalizedInput ||
            s.auid.slice(-3) === normalizedInput ||
            s.usn.slice(-3) === normalizedInput
        );

        if (student) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userAuid', student.auid);
            localStorage.setItem('userUsn', student.usn);
            localStorage.setItem('userName', student.name);

            // Check if profile is completed
            const profileKey = `profile_${student.auid}`;
            const profileData = localStorage.getItem(profileKey);

            if (!profileData) {
                setCurrentStudent(student);
                setShowProfileModal(true);
            } else {
                navigate('/');
            }
        } else {
            setError('No student found with this USN/AUID. Please try again.');
        }
    };

    const handleProfileComplete = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-white/50 backdrop-blur-sm">
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

                    <div className="flex justify-center mb-6 relative z-10">
                        <div className="bg-white p-4 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <img src="/logo.png" alt="Acharya Logo" className="h-16 w-auto" />
                        </div>
                    </div>
                    <div className="space-y-2 relative z-10">
                        <h1 className="text-xl font-bold text-white tracking-wide opacity-90">
                            ACHARYA INSTITUTE OF TECHNOLOGY
                        </h1>
                        <p className="text-indigo-100 text-sm font-medium bg-white/10 inline-block px-3 py-1 rounded-full backdrop-blur-md">
                            AIML Department
                        </p>
                    </div>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-extrabold text-slate-900">Welcome Back</h2>
                        <p className="text-slate-500 text-sm mt-1">Enter your details to access the dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm text-center font-medium animate-shake">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                                Enter USN or AUID (Full or Last 3 Digits)
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-4 text-lg border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-indigo-500 text-center font-bold tracking-widest text-slate-800 transition-all bg-slate-50 focus:bg-white"
                                    placeholder="e.g. 1AY25AI001 or 001"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                />
                            </div>
                            <p className="mt-3 text-xs text-slate-400 text-center font-medium">
                                Example: Enter full USN/AUID or just the last 3 digits
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Sign In to Dashboard
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Profile Completion Modal */}
            <ProfileCompletionModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onComplete={handleProfileComplete}
            />
        </div>
    );
};

export default Login;
