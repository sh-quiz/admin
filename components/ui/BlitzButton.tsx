'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Props {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    isLoading?: boolean;
    icon?: LucideIcon;
    className?: string;
}

export default function BlitzButton({
    children,
    onClick,
    type = 'button',
    disabled,
    isLoading,
    icon: Icon,
    className = ''
}: Props) {
    return (
        <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`
                relative w-full h-14 bg-blitz-yellow text-deep-void font-michroma font-bold italic 
                rounded-xl flex items-center justify-center gap-2 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden
                ${className}
            `}
        >
            {/* Shine Effect */}
            <motion.div
                animate={{
                    x: ['-100%', '200%'],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />

            {isLoading ? (
                <div className="w-6 h-6 border-2 border-deep-void/30 border-t-deep-void rounded-full animate-spin" />
            ) : (
                <>
                    {Icon && <Icon className="w-5 h-5" />}
                    <span className="relative z-10">{children}</span>
                </>
            )}
        </motion.button>
    );
}
