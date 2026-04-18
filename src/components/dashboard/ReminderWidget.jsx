import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

const ReminderWidget = () => {
    const [reminders, setReminders] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newReminder, setNewReminder] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('student_reminders');
        if (saved) {
            setReminders(JSON.parse(saved));
        }
    }, []);

    const saveReminders = (updatedReminders) => {
        setReminders(updatedReminders);
        localStorage.setItem('student_reminders', JSON.stringify(updatedReminders));
    };

    const handleAdd = () => {
        if (!newReminder.trim()) return;
        const updated = [...reminders, { id: Date.now(), text: newReminder, completed: false }];
        saveReminders(updated);
        setNewReminder('');
        setIsAdding(false);
    };

    const handleDelete = (id) => {
        const updated = reminders.filter(r => r.id !== id);
        saveReminders(updated);
    };

    const startEdit = (reminder) => {
        setEditingId(reminder.id);
        setEditText(reminder.text);
    };

    const saveEdit = () => {
        if (!editText.trim()) return;
        const updated = reminders.map(r =>
            r.id === editingId ? { ...r, text: editText } : r
        );
        saveReminders(updated);
        setEditingId(null);
        setEditText('');
    };

    return (
        <Card className="h-full bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-2xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Reminders</h3>
                <button
                    onClick={() => setIsAdding(true)}
                    className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {isAdding && (
                    <div className="flex items-center gap-2 animate-fadeIn mb-2">
                        <input
                            type="text"
                            value={newReminder}
                            onChange={(e) => setNewReminder(e.target.value)}
                            placeholder="Type reminder..."
                            className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <button onClick={handleAdd} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={16} /></button>
                        <button onClick={() => setIsAdding(false)} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={16} /></button>
                    </div>
                )}

                {reminders.length === 0 && !isAdding ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No reminders yet.
                    </div>
                ) : (
                    reminders.map((reminder) => (
                        <div key={reminder.id} className="group flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-200 transition-all">
                            {editingId === reminder.id ? (
                                <div className="flex items-center gap-2 w-full">
                                    <input
                                        type="text"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="flex-1 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                    />
                                    <button onClick={saveEdit} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={14} /></button>
                                    <button onClick={() => setEditingId(null)} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={14} /></button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-sm text-slate-700 font-medium break-all">{reminder.text}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => startEdit(reminder)}
                                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors active:scale-95"
                                            aria-label="Edit reminder"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(reminder.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-95"
                                            aria-label="Delete reminder"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

export default ReminderWidget;
