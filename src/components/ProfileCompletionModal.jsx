import React, { useState, useEffect } from 'react';
import { X, Calendar, Phone, Mail } from 'lucide-react';

const ProfileCompletionModal = ({ isOpen, onClose, onComplete }) => {
    const [formData, setFormData] = useState({
        dateOfBirth: '',
        phoneNumber: '',
        emailId: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Save to localStorage
        const userAuid = localStorage.getItem('userAuid');
        const profileKey = `profile_${userAuid}`;
        localStorage.setItem(profileKey, JSON.stringify(formData));
        localStorage.setItem('profileCompleted', 'true');

        onComplete(formData);
        onClose();
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
                    <h2 className="text-2xl font-bold mb-2 relative z-10">Complete Your Profile</h2>
                    <p className="text-purple-100 text-sm relative z-10">Please provide your basic details to continue</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            required
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-purple-600" />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            required
                            pattern="[0-9]{10}"
                            placeholder="10-digit mobile number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                        />
                    </div>

                    {/* Email ID */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-purple-600" />
                            Email ID
                        </label>
                        <input
                            type="email"
                            name="emailId"
                            required
                            placeholder="your.email@example.com"
                            value={formData.emailId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Skip for Now
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileCompletionModal;
