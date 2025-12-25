'use client';

import { useEffect, useState } from 'react';
import { get } from '../api/query';
import HoneycombBackground from '@/components/ui/HoneycombBackground';
import { Users, Activity, RefreshCw, ArrowLeft, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface UserStats {
    totalUsers: number;
    onlineUsers: number;
}

export default function UserStatsPage() {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await get<UserStats>('/v1/admin/stats/users');
                setStats(data);
                setError(null);
            } catch (err) {
                setError('Failed to load user stats');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const activityRate = stats ? Math.round((stats.onlineUsers / stats.totalUsers) * 100) : 0;

    return (
        <div className="min-h-screen bg-deep-void text-white relative flex flex-col">
            <HoneycombBackground />

            {/* Header */}
            <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-michroma font-bold text-blitz-yellow">User Analytics</h1>
                                <p className="text-sm text-gray-400">Real-time platform usage statistics</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className={`group flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:border-blitz-yellow/50 hover:bg-white/10 transition-all ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            <RefreshCw className={`w-4 h-4 text-blitz-yellow ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                            <span className="text-sm font-medium">{loading ? 'Updating...' : 'Refresh'}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-7xl mx-auto">
                    {/* Error Alert */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-md"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <p className="text-red-400 font-medium">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Total Users Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-voltage-blue/50 transition-all duration-300 hover:shadow-2xl hover:shadow-voltage-blue/20 overflow-hidden"
                        >
                            {/* Decorative gradient */}
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-voltage-blue/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="bg-voltage-blue/10 border border-voltage-blue/30 p-4 rounded-2xl">
                                        <Users className="w-8 h-8 text-voltage-blue" />
                                    </div>
                                    <div className="bg-voltage-blue/10 border border-voltage-blue/30 rounded-full px-3 py-1">
                                        <span className="text-xs font-medium text-voltage-blue uppercase tracking-wider">All Time</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Users</p>
                                    {loading && !stats ? (
                                        <div className="h-16 w-32 bg-white/5 animate-pulse rounded-lg"></div>
                                    ) : (
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                            className="text-5xl font-bold font-michroma text-white"
                                        >
                                            {stats?.totalUsers.toLocaleString() || '0'}
                                        </motion.div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <div className="flex items-center gap-2 text-sm text-voltage-blue">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>Registered users on platform</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Online Users Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-success-mint/50 transition-all duration-300 hover:shadow-2xl hover:shadow-success-mint/20 overflow-hidden"
                        >
                            {/* Decorative gradient */}
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-success-mint/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="bg-success-mint/10 border border-success-mint/30 p-4 rounded-2xl">
                                        <Activity className="w-8 h-8 text-success-mint" />
                                    </div>
                                    <div className="flex items-center gap-2 bg-success-mint/10 border border-success-mint/30 rounded-full px-3 py-1">
                                        <div className="w-2 h-2 bg-success-mint rounded-full animate-pulse"></div>
                                        <span className="text-xs font-medium text-success-mint uppercase tracking-wider">Live</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Online Users</p>
                                    {loading && !stats ? (
                                        <div className="h-16 w-32 bg-white/5 animate-pulse rounded-lg"></div>
                                    ) : (
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                            className="text-5xl font-bold font-michroma text-white"
                                        >
                                            {stats?.onlineUsers.toLocaleString() || '0'}
                                        </motion.div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <div className="flex items-center gap-2 text-sm text-success-mint">
                                        <Clock className="w-4 h-4" />
                                        <span>Active in last 5 minutes</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Activity Rate Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
                    >
                        <h3 className="text-xl font-michroma font-bold mb-6 text-white">Activity Overview</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div className="text-center space-y-3">
                                <div className="text-4xl font-bold font-michroma text-blitz-yellow">
                                    {loading ? '...' : `${activityRate}%`}
                                </div>
                                <p className="text-sm text-gray-400 uppercase tracking-wider">Activity Rate</p>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${activityRate}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-blitz-yellow to-voltage-blue"
                                    />
                                </div>
                            </div>

                            <div className="text-center space-y-3 border-x border-white/10">
                                <div className="text-4xl font-bold font-michroma text-voltage-blue">
                                    {loading ? '...' : stats?.totalUsers || '0'}
                                </div>
                                <p className="text-sm text-gray-400 uppercase tracking-wider">Total Reach</p>
                            </div>

                            <div className="text-center space-y-3">
                                <div className="text-4xl font-bold font-michroma text-success-mint">
                                    {loading ? '...' : stats?.onlineUsers || '0'}
                                </div>
                                <p className="text-sm text-gray-400 uppercase tracking-wider">Current Active</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
