'use client';

import { motion } from 'framer-motion';

interface Props {
    activeTab: 'login' | 'signup';
    onTabChange: (tab: 'login' | 'signup') => void;
}

export default function AuthSwitcher({ activeTab, onTabChange }: Props) {
    return (
        <div className="relative w-full max-w-[300px] h-14 bg-carbon-grey rounded-2xl p-1 flex items-center mb-10 border border-white/5">
            {/* Sliding Pill */}
            <motion.div
                className="absolute h-12 bg-blitz-yellow rounded-[14px] z-0 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                initial={false}
                animate={{
                    width: activeTab === 'login' ? '48%' : '48%',
                    x: activeTab === 'login' ? '104%' : '0%', // This depends on the order
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            {/* I'll swap the order to match the image: Sign Up on left, Log In on right */}
            <button
                onClick={() => onTabChange('signup')}
                className={`flex-1 relative z-10 text-sm font-michroma font-bold italic transition-colors duration-300 ${activeTab === 'signup' ? 'text-deep-void' : 'text-static-white/40'
                    }`}
            >
                Sign Up
            </button>
            <button
                onClick={() => onTabChange('login')}
                className={`flex-1 relative z-10 text-sm font-michroma font-bold italic transition-colors duration-300 ${activeTab === 'login' ? 'text-deep-void' : 'text-static-white/40'
                    }`}
            >
                Log In
            </button>
        </div>
    );
}
