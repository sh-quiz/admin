'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';
import BlitzButton from '@/components/ui/BlitzButton';
import HoneycombBackground from '@/components/ui/HoneycombBackground';
import { Upload, CheckCircle, AlertCircle, FileJson, Trash2, Edit2, X, Save, Plus, ArrowLeft, GripVertical, ChevronDown, ChevronUp, Copy, Info } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface Choice {
    id?: number;
    text: string;
    isCorrect: boolean;
    order: number;
    _delete?: boolean;
}

interface Question {
    id?: number;
    text: string;
    explanation?: string;
    points: number;
    order: number;
    choices: Choice[];
    _delete?: boolean;
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    subject: string;
    timeLimit: number | null;
    passingScore: number | null;
    maxAttempts: number | null;
    questions?: Question[];
    _count?: {
        questions: number;
    };
}

export default function QuizPage() {
    const [activeTab, setActiveTab] = useState<'manage' | 'upload'>('manage');
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);

    // Edit Modal State
    const [editTab, setEditTab] = useState<'details' | 'questions'>('details');
    // We keep track of deleted IDs to send _delete flags to backend
    const [deletedQuestionIds, setDeletedQuestionIds] = useState<number[]>([]);
    const [deletedChoiceIds, setDeletedChoiceIds] = useState<{ [questionId: number]: number[] }>({});

    // Upload state
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showJsonFormat, setShowJsonFormat] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeTab === 'manage') {
            fetchQuizzes();
        }
    }, [activeTab]);

    const fetchQuizzes = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/quizzes');
            setQuizzes(response.data);
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = async (quiz: Quiz) => {
        setIsFetchingDetails(true);
        try {
            // Fetch full details including questions
            const response = await api.get(`/admin/quizzes/${quiz.id}`);
            const detailedQuiz = response.data;

            // Transform backend structure if needed (e.g. map choices)
            // Backend sends simple objects, we need to ensure local state has what we need
            // Assuming backend sends questions ordered and choices ordered.

            // Map questions to ensure defaults
            const mappedQuestions = (detailedQuiz.questions || []).map((q: any) => ({
                ...q,
                choices: (q.choices || []).map((c: any) => ({
                    ...c,
                    isCorrect: q.questions ? false : c.isCorrect // Backend might not expose isCorrect directly on choice if it's protected? 
                    // Actually our findOneAdmin includes choices. Prisma usually returns boolean fields.
                    // Wait, our backend logic uses correctChoiceIndexes. 
                    // Let's assume the GET endpoint returns choices with `isCorrect` if we update the service to include it?
                    // The service `findOneAdmin` includes `isCorrect` implicitly because it finds choices.
                    // Let's verify if `Choice` model has `isCorrect`. Yes it does.
                }))
            }));

            setEditingQuiz({ ...detailedQuiz, questions: mappedQuestions });
            setDeletedQuestionIds([]);
            setDeletedChoiceIds({});
            setEditTab('details');
        } catch (error) {
            console.error('Failed to fetch quiz details:', error);
            setStatus({ type: 'error', message: 'Failed to load quiz details' });
        } finally {
            setIsFetchingDetails(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this quiz?')) return;

        setIsDeleting(id);
        try {
            await api.delete(`/admin/quizzes/${id}`);
            setQuizzes(quizzes.filter(q => q.id !== id));
            setStatus({ type: 'success', message: 'Quiz deleted successfully' });
        } catch (error) {
            console.error('Failed to delete quiz:', error);
            setStatus({ type: 'error', message: 'Failed to delete quiz' });
        } finally {
            setIsDeleting(null);
            setTimeout(() => setStatus(null), 3000);
        }
    };

    const handleUpdate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!editingQuiz) return;
        setIsLoading(true);

        try {
            // Prepare payload
            const questionsPayload = [
                ...(editingQuiz.questions || []).map((q, idx) => {
                    const choices = q.choices.map((c, cIdx) => ({
                        ...c,
                        order: cIdx, // Ensure order is based on current array index
                    }));

                    // Calculate correctChoiceIndexes for this question
                    const correctChoiceIndexes = choices
                        .map((c, i) => c.isCorrect ? i : -1)
                        .filter(i => i !== -1);

                    return {
                        ...q,
                        order: idx,
                        choices,
                        correctChoiceIndexes,
                    };
                }),
                // Add deleted questions with _delete flag
                ...deletedQuestionIds.map(id => ({ id, _delete: true, text: '', choices: [] }))
            ];

            // For deleted choices, we need to find which question they belonged to, 
            // OR if the question is still present, add them to that question's choices list with _delete: true
            // If the parent question was deleted, we don't need to explicitly delete choices (cascade usually handles it or ignored).
            // Let's iterate through active questions and append deleted choices to them if applicable.
            const finalQuestionsPayload = questionsPayload.map(q => {
                if (q._delete || !q.id) return q;

                const deletedChoicesForThisQ = deletedChoiceIds[q.id] || [];
                if (deletedChoicesForThisQ.length > 0) {
                    return {
                        ...q,
                        choices: [
                            ...q.choices,
                            ...deletedChoicesForThisQ.map(cid => ({ id: cid, text: '', order: 0, isCorrect: false, _delete: true }))
                        ]
                    };
                }
                return q;
            });

            await api.put(`/admin/quizzes/${editingQuiz.id}`, {
                title: editingQuiz.title,
                description: editingQuiz.description,
                subject: editingQuiz.subject,
                timeLimit: editingQuiz.timeLimit,
                passingScore: editingQuiz.passingScore,
                maxAttempts: editingQuiz.maxAttempts,
                questions: finalQuestionsPayload.map((q: any) => ({
                    id: q.id,
                    text: q.text,
                    explanation: q.explanation,
                    points: Number(q.points),
                    order: Number(q.order),
                    choices: q.choices?.map((c: any) => ({
                        id: c.id,
                        text: c.text,
                        order: Number(c.order),
                        _delete: c._delete
                    })),
                    correctChoiceIndexes: q.correctChoiceIndexes,
                    _delete: q._delete
                })),
            });

            setQuizzes(quizzes.map(q => q.id === editingQuiz.id ? editingQuiz : q)); // Optimistic update of list (partial)
            setEditingQuiz(null);
            setStatus({ type: 'success', message: 'Quiz updated successfully' });
            fetchQuizzes(); // Refresh to be sure
        } catch (error) {
            console.error('Failed to update quiz:', error);
            setStatus({ type: 'error', message: 'Failed to update quiz' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatus(null), 3000);
        }
    };

    // Question Management helpers
    const addQuestion = () => {
        if (!editingQuiz) return;
        const newQuestion: Question = {
            text: 'New Question',
            points: 1,
            order: (editingQuiz.questions?.length || 0),
            choices: [
                { text: 'Choice 1', isCorrect: true, order: 0 },
                { text: 'Choice 2', isCorrect: false, order: 1 }
            ]
        };
        setEditingQuiz({
            ...editingQuiz,
            questions: [...(editingQuiz.questions || []), newQuestion]
        });
    };

    const removeQuestion = (index: number) => {
        if (!editingQuiz || !editingQuiz.questions) return;
        const qToDelete = editingQuiz.questions[index];
        if (qToDelete.id) {
            setDeletedQuestionIds([...deletedQuestionIds, qToDelete.id]);
        }
        const newQuestions = [...editingQuiz.questions];
        newQuestions.splice(index, 1);
        setEditingQuiz({ ...editingQuiz, questions: newQuestions });
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        if (!editingQuiz || !editingQuiz.questions) return;
        const newQuestions = [...editingQuiz.questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setEditingQuiz({ ...editingQuiz, questions: newQuestions });
    };

    // Choice management
    const addChoice = (qIndex: number) => {
        if (!editingQuiz || !editingQuiz.questions) return;
        const questions = [...editingQuiz.questions];
        questions[qIndex].choices.push({
            text: `Option ${questions[qIndex].choices.length + 1}`,
            isCorrect: false,
            order: questions[qIndex].choices.length
        });
        setEditingQuiz({ ...editingQuiz, questions });
    };

    const removeChoice = (qIndex: number, cIndex: number) => {
        if (!editingQuiz || !editingQuiz.questions) return;
        const questions = [...editingQuiz.questions];
        const q = questions[qIndex];
        const cToDelete = q.choices[cIndex];

        if (cToDelete.id && q.id) {
            setDeletedChoiceIds(prev => ({
                ...prev,
                [q.id!]: [...(prev[q.id!] || []), cToDelete.id!]
            }));
        }

        q.choices.splice(cIndex, 1);
        setEditingQuiz({ ...editingQuiz, questions });
    };

    const updateChoice = (qIndex: number, cIndex: number, field: keyof Choice, value: any) => {
        if (!editingQuiz || !editingQuiz.questions) return;
        const questions = [...editingQuiz.questions];
        questions[qIndex].choices[cIndex] = {
            ...questions[qIndex].choices[cIndex],
            [field]: value
        };
        setEditingQuiz({ ...editingQuiz, questions });
    };

    // --- Standard file upload logic ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'application/json' && !selectedFile.name.endsWith('.json')) {
                setStatus({ type: 'error', message: 'Please upload a valid JSON file.' });
                return;
            }
            setFile(selectedFile);
            setStatus(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsLoading(true);
        setStatus(null);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await api.post('/quizzes/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const count = Array.isArray(response.data) ? response.data.length : 0;
            setStatus({ type: 'success', message: `Successfully uploaded ${count} quizzes!` });
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setTimeout(() => setActiveTab('manage'), 1500);
        } catch (error: any) {
            console.error('Upload failed:', error);
            const errorMessage = error.response?.data?.message || 'Failed to upload quizzes.';
            setStatus({ type: 'error', message: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-deep-void text-white relative flex flex-col items-center p-4 sm:p-8">
            <HoneycombBackground />

            <div className="w-full max-w-6xl relative z-10">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-michroma font-bold text-blitz-yellow">Quiz Management</h1>
                        <p className="text-gray-400">Create, manage, and track quizzes</p>
                    </div>

                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        <button onClick={() => setActiveTab('manage')} className={`px-4 py-2 rounded-md transition-all ${activeTab === 'manage' ? 'bg-blitz-yellow text-black font-bold' : 'text-gray-400 hover:text-white'}`}>Manage Quizzes</button>
                        <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 rounded-md transition-all ${activeTab === 'upload' ? 'bg-blitz-yellow text-black font-bold' : 'text-gray-400 hover:text-white'}`}>Upload JSON</button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`mb-6 p-4 rounded-xl flex items-center gap-3 w-full backdrop-blur-md border ${status.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                        >
                            {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <p className="font-medium">{status.message}</p>
                            <button onClick={() => setStatus(null)} className="ml-auto hover:opacity-75"><X className="w-4 h-4" /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {activeTab === 'upload' ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Bulk Upload</h2>
                            <p className="text-gray-400 text-sm">Import quizzes via JSON file</p>
                        </div>
                        <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center cursor-pointer transition-all ${file ? 'border-blitz-yellow/50 bg-blitz-yellow/5' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                            <AnimatePresence mode="wait">
                                {file ? (
                                    <motion.div key="file-selected" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-2">
                                        <FileJson className="w-12 h-12 text-blitz-yellow" />
                                        <p className="font-medium text-white break-all">{file.name}</p>
                                        <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                                    </motion.div>
                                ) : (
                                    <motion.div key="no-file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-2">
                                        <Upload className="w-12 h-12 text-gray-500" />
                                        <p className="text-gray-300 font-medium">Click to select file</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <BlitzButton onClick={handleUpload} disabled={!file} isLoading={isLoading} icon={Upload} className="w-full">Upload Quizzes</BlitzButton>

                        <div className="mt-8 border-t border-white/10 pt-6">
                            <button
                                onClick={() => setShowJsonFormat(!showJsonFormat)}
                                className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-400 hover:text-white transition-colors group"
                            >
                                <span className="flex items-center gap-2">
                                    <Info className="w-4 h-4 text-blitz-yellow" />
                                    Expected JSON Format
                                </span>
                                {showJsonFormat ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            <AnimatePresence>
                                {showJsonFormat && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 bg-black/40 rounded-xl border border-white/10 p-4 font-mono text-xs text-gray-300 relative group/code">
                                            <button
                                                onClick={() => navigator.clipboard.writeText(`[
  {
    "title": "Quiz Title (Required, string)",
    "description": "Quiz Description (Optional, string)",
    "subject": "maths",
    "timeLimit": 120,
    "passingScore": 7,
    "maxAttempts": 3,
    "questions": [
      {
        "text": "Question Text (Required)",
        "explanation": "Optional explanation",
        "points": 1,
        "choices": [
          { "text": "Choice 1" },
          { "text": "Choice 2" }
        ],
        "correctChoiceIndexes": [0]
      }
    ]
  }
]`)}
                                                className="absolute top-3 right-3 p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors opacity-0 group-hover/code:opacity-100"
                                                title="Copy to clipboard"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            <pre className="whitespace-pre-wrap break-all">
                                                <span className="text-gray-500">{'['}</span>{'\n'}
                                                {'  '}<span className="text-gray-500">{'{'}</span>{'\n'}
                                                {'    '}<span className="text-blue-400">"title"</span>: <span className="text-green-400">"Quiz Title"</span>,<span className="text-gray-600"> // Required</span>{'\n'}
                                                {'    '}<span className="text-blue-400">"description"</span>: <span className="text-green-400">"Optional..."</span>,{'\n'}
                                                {'    '}<span className="text-blue-400">"subject"</span>: <span className="text-green-400">"maths"</span>,<span className="text-gray-600"> // random, science, etc.</span>{'\n'}
                                                {'    '}<span className="text-blue-400">"timeLimit"</span>: <span className="text-yellow-400">120</span>,<span className="text-gray-600"> // seconds</span>{'\n'}
                                                {'    '}<span className="text-blue-400">"passingScore"</span>: <span className="text-yellow-400">7</span>,{'\n'}
                                                {'    '}<span className="text-blue-400">"maxAttempts"</span>: <span className="text-yellow-400">3</span>,{'\n'}
                                                {'    '}<span className="text-blue-400">"questions"</span>: <span className="text-gray-500">{'['}</span>{'\n'}
                                                {'      '}<span className="text-gray-500">{'{'}</span>{'\n'}
                                                {'        '}<span className="text-blue-400">"text"</span>: <span className="text-green-400">"Question Text"</span>,{'\n'}
                                                {'        '}<span className="text-blue-400">"points"</span>: <span className="text-yellow-400">1</span>,{'\n'}
                                                {'        '}<span className="text-blue-400">"choices"</span>: <span className="text-gray-500">{'['}</span>{'\n'}
                                                {'          '}<span className="text-gray-500">{'{'}</span> <span className="text-blue-400">"text"</span>: <span className="text-green-400">"Option A"</span> <span className="text-gray-500">{'}'}</span>,{'\n'}
                                                {'          '}<span className="text-gray-500">{'{'}</span> <span className="text-blue-400">"text"</span>: <span className="text-green-400">"Option B"</span> <span className="text-gray-500">{'}'}</span>{'\n'}
                                                {'        '}<span className="text-gray-500">{']'}</span>,{'\n'}
                                                {'        '}<span className="text-blue-400">"correctChoiceIndexes"</span>: <span className="text-gray-500">{'['}</span><span className="text-yellow-400">0</span><span className="text-gray-500">{']'}</span><span className="text-gray-600"> // 0-based index</span>{'\n'}
                                                {'      '}<span className="text-gray-500">{'}'}</span>{'\n'}
                                                {'    '}<span className="text-gray-500">{']'}</span>{'\n'}
                                                {'  '}<span className="text-gray-500">{'}'}</span>{'\n'}
                                                <span className="text-gray-500">{']'}</span>
                                            </pre>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Title</th>
                                        <th className="px-6 py-4 font-semibold">Subject</th>
                                        <th className="px-6 py-4 font-semibold text-center">Questions</th>
                                        <th className="px-6 py-4 font-semibold text-center">Time (min)</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {quizzes.map((quiz) => (
                                        <tr key={quiz.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{quiz.title}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{quiz.description}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300"><span className="bg-white/10 px-2 py-1 rounded text-xs">{quiz.subject}</span></td>
                                            <td className="px-6 py-4 text-center text-gray-300">{quiz._count?.questions || 0}</td>
                                            <td className="px-6 py-4 text-center text-gray-300">{quiz.timeLimit}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEditClick(quiz)} disabled={isFetchingDetails} className="p-2 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors" title="Edit">
                                                        {isFetchingDetails && editingQuiz?.id === quiz.id ? <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /> : <Edit2 className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => handleDelete(quiz.id)} disabled={isDeleting === quiz.id} className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50" title="Delete">
                                                        {isDeleting === quiz.id ? <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {quizzes.length === 0 && !isLoading && (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No quizzes found. Upload a JSON file to get started.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Edit Modal / Fullscreen Edit View */}
                <AnimatePresence>
                    {editingQuiz && (
                        <div className="fixed inset-0 z-50 flex flex-col bg-deep-void/95 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
                            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setEditingQuiz(null)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                        <ArrowLeft className="w-6 h-6" />
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-bold font-michroma text-white">Edit Quiz</h2>
                                        <p className="text-sm text-gray-400">{editingQuiz.title}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                                        <button onClick={() => setEditTab('details')} className={`px-4 py-1.5 text-sm rounded-md transition-all ${editTab === 'details' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white'}`}>Details</button>
                                        <button onClick={() => setEditTab('questions')} className={`px-4 py-1.5 text-sm rounded-md transition-all ${editTab === 'questions' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white'}`}>Questions ({editingQuiz.questions?.length})</button>
                                    </div>
                                    <BlitzButton onClick={handleUpdate} isLoading={isLoading} icon={Save} className="h-10 text-sm px-6">Save Changes</BlitzButton>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                <div className="max-w-4xl mx-auto pb-20">
                                    {editTab === 'details' ? (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                                <h3 className="text-lg font-bold text-white mb-4">Quiz Settings</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                                                        <input type="text" value={editingQuiz.title} onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blitz-yellow/50 transition-colors" required />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                                        <textarea value={editingQuiz.description || ''} onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blitz-yellow/50 h-32 resize-none transition-colors" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                                                        <input type="text" value={editingQuiz.subject} onChange={(e) => setEditingQuiz({ ...editingQuiz, subject: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blitz-yellow/50 transition-colors" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-400 mb-2">Time Limit (min)</label>
                                                        <input type="number" value={editingQuiz.timeLimit ?? ''} onChange={(e) => setEditingQuiz({ ...editingQuiz, timeLimit: e.target.value === '' ? null : Number(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blitz-yellow/50 transition-colors" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-400 mb-2">Passing Score</label>
                                                        <input type="number" value={editingQuiz.passingScore ?? ''} onChange={(e) => setEditingQuiz({ ...editingQuiz, passingScore: e.target.value === '' ? null : Number(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blitz-yellow/50 transition-colors" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-400 mb-2">Max Attempts</label>
                                                        <input type="number" value={editingQuiz.maxAttempts ?? ''} onChange={(e) => setEditingQuiz({ ...editingQuiz, maxAttempts: e.target.value === '' ? null : Number(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blitz-yellow/50 transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                            {editingQuiz.questions?.map((question, qIndex) => (
                                                <div key={qIndex} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                                                    <div className="p-4 bg-white/5 flex justify-between items-start gap-4">
                                                        <div className="flex gap-3 flex-1">
                                                            <div className="mt-2 text-blitz-yellow font-bold font-michroma">Q{qIndex + 1}</div>
                                                            <div className="flex-1 space-y-4">
                                                                <input
                                                                    type="text"
                                                                    value={question.text}
                                                                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                                                    className="w-full bg-transparent border-b border-transparent hover:border-white/20 focus:border-blitz-yellow focus:outline-none text-lg font-medium text-white px-0 py-1 transition-colors"
                                                                    placeholder="Enter question text..."
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={question.explanation || ''}
                                                                    onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                                                    className="w-full bg-transparent text-sm text-gray-400 border-b border-transparent hover:border-white/20 focus:border-blitz-yellow focus:outline-none px-0 py-1 transition-colors"
                                                                    placeholder="Explanation (optional)..."
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-500 uppercase">Points</span>
                                                                <input
                                                                    type="number"
                                                                    value={question.points}
                                                                    onChange={(e) => updateQuestion(qIndex, 'points', Number(e.target.value))}
                                                                    className="w-16 bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-sm text-center text-white focus:border-blitz-yellow/50 outline-none"
                                                                />
                                                            </div>
                                                            <button onClick={() => removeQuestion(qIndex)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Question">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Choices */}
                                                    <div className="p-4 bg-black/20 space-y-3">
                                                        {question.choices.map((choice, cIndex) => (
                                                            <div key={cIndex} className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => updateChoice(qIndex, cIndex, 'isCorrect', !choice.isCorrect)}
                                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${choice.isCorrect ? 'bg-green-500 border-green-500 text-black' : 'border-gray-600 hover:border-gray-400'}`}
                                                                >
                                                                    {choice.isCorrect && <CheckCircle className="w-4 h-4" />}
                                                                </button>
                                                                <input
                                                                    type="text"
                                                                    value={choice.text}
                                                                    onChange={(e) => updateChoice(qIndex, cIndex, 'text', e.target.value)}
                                                                    className={`flex-1 bg-transparent border border-transparent hover:border-white/10 focus:border-white/30 rounded px-2 py-1 outline-none transition-colors ${choice.isCorrect ? 'text-green-400' : 'text-gray-300'}`}
                                                                    placeholder={`Option ${cIndex + 1}`}
                                                                />
                                                                <button onClick={() => removeChoice(qIndex, cIndex)} className="text-gray-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => addChoice(qIndex)} className="flex items-center gap-2 text-sm text-blitz-yellow/70 hover:text-blitz-yellow mt-2 pl-9 transition-colors">
                                                            <Plus className="w-4 h-4" /> Add Option
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <button onClick={addQuestion} className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-medium">
                                                <Plus className="w-5 h-5" /> Add New Question
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
