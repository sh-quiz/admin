'use client';

import Link from 'next/link';
import HoneycombBackground from '@/components/ui/HoneycombBackground';
import BlitzButton from '@/components/ui/BlitzButton';
import { BarChart3, Users, Layout, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const cards = [
    {
      title: 'Quiz Management',
      description: 'Create, edit, and manage quizzes. Upload bulk quizzes via JSON, track questions, and organize learning materials.',
      icon: BarChart3,
      href: '/quiz',
      color: 'blitz-yellow',
      stats: 'Full CRUD Operations',
    },
    {
      title: 'User Analytics',
      description: 'Monitor user activity, track engagement metrics, and view real-time statistics on platform usage.',
      icon: Users,
      href: '/user',
      color: 'voltage-blue',
      stats: 'Real-time Stats',
    },
  ];

  return (
    <div className="min-h-screen bg-deep-void text-white relative flex flex-col">
      <HoneycombBackground />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blitz-yellow/10 p-3 rounded-xl border border-blitz-yellow/30">
              <Layout className="w-6 h-6 text-blitz-yellow" />
            </div>
            <div>
              <h1 className="text-2xl font-michroma font-bold text-blitz-yellow">Admin Portal</h1>
              <p className="text-sm text-gray-400">Sharks Quiz Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400 font-medium">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl w-full">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-blitz-yellow/10 border border-blitz-yellow/30 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-blitz-yellow" />
              <span className="text-sm font-medium text-blitz-yellow">Admin Control Center</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-michroma mb-6 bg-gradient-to-r from-white via-blitz-yellow to-voltage-blue bg-clip-text text-transparent">
              Welcome to the Dashboard
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              Manage your quiz platform with powerful tools and real-time analytics. Choose a module below to get started.
            </p>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {cards.map((card, index) => {
              const Icon = card.icon;
              const isYellow = card.color === 'blitz-yellow';

              return (
                <motion.div
                  key={card.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={card.href}>
                    <div className={`group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-${card.color}/50 transition-all duration-300 hover:shadow-2xl hover:shadow-${card.color}/20 cursor-pointer overflow-hidden h-full flex flex-col`}>
                      {/* Gradient overlay on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${isYellow ? 'from-blitz-yellow/5 via-transparent to-transparent' : 'from-voltage-blue/5 via-transparent to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                      {/* Content */}
                      <div className="relative z-10 flex-1 flex flex-col">
                        {/* Icon and Stats Badge */}
                        <div className="flex items-start justify-between mb-6">
                          <div className={`bg-${card.color}/10 border border-${card.color}/30 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`w-8 h-8 text-${card.color}`} />
                          </div>
                          <div className={`bg-${card.color}/10 border border-${card.color}/30 rounded-full px-3 py-1`}>
                            <span className={`text-xs font-medium text-${card.color}`}>{card.stats}</span>
                          </div>
                        </div>

                        {/* Title and Description */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold font-michroma mb-3 text-white group-hover:text-blitz-yellow transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-gray-400 leading-relaxed">
                            {card.description}
                          </p>
                        </div>

                        {/* Action Button */}
                        <div className="mt-6 flex items-center justify-between">
                          <span className={`text-sm font-medium text-${card.color} group-hover:translate-x-1 transition-transform`}>
                            View Module
                          </span>
                          <div className={`bg-${card.color}/20 p-2 rounded-lg group-hover:bg-${card.color}/30 transition-colors`}>
                            <ArrowRight className={`w-5 h-5 text-${card.color} group-hover:translate-x-1 transition-transform`} />
                          </div>
                        </div>
                      </div>

                      {/* Decorative elements */}
                      <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-${card.color}/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`}></div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <p className="text-3xl font-bold font-michroma text-blitz-yellow">2</p>
                  <p className="text-sm text-gray-400 uppercase tracking-wider">Active Modules</p>
                </div>
                <div className="space-y-2 border-x border-white/10">
                  <p className="text-3xl font-bold font-michroma text-voltage-blue">∞</p>
                  <p className="text-sm text-gray-400 uppercase tracking-wider">Possibilities</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold font-michroma text-success-mint">100%</p>
                  <p className="text-sm text-gray-400 uppercase tracking-wider">System Health</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2025 Sharks Quiz Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Made with <span className="text-blitz-yellow">⚡</span> by Admin Team</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
