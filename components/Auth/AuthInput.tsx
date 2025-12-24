'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface Props {
    label: string;
    type: string;
    icon: LucideIcon;
    placeholder: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    delay?: number;
}

export default function AuthInput({ label, type, icon: Icon, placeholder, value, onChange, delay = 0 }: Props) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className="w-full mb-6"
        >
            <label className="block text-static-white/60 text-sm font-medium mb-2 ml-1">
                {label}
            </label>
            <div className="relative group">
                <div className={`
                    absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300
                    ${isFocused ? 'text-voltage-blue' : 'text-zinc-500'}
                `}>
                    <Icon className="w-5 h-5" />
                </div>

                <input
                    type={inputType}
                    className={`
                        w-full h-14 pl-14 pr-12 bg-carbon-grey border rounded-xl text-static-white placeholder-zinc-600 
                        focus:outline-none transition-all duration-300
                        ${isFocused ? 'border-voltage-blue/50 ring-1 ring-voltage-blue/20' : 'border-white/5'}
                    `}
                    placeholder={placeholder}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={onChange}
                    value={value}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-static-white transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>
        </motion.div>
    );
}
