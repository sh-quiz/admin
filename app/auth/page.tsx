
'use client';

import { useEffect, useState } from 'react';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, ArrowLeft, Settings } from 'lucide-react';
import Image from 'next/image';

import AuthInput from '@/components/Auth/AuthInput';
import HoneycombBackground from '@/components/ui/HoneycombBackground';
import BlitzButton from '@/components/ui/BlitzButton';
import SocialButton from '@/components/Auth/SocialButton';
import AuthSwitcher from '@/components/Auth/AuthSwitcher';

export default function AuthPage() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('signup');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (activeTab === 'login') {
                await authService.login({ email: formData.email, password: formData.password });
            } else {
                await authService.signup(formData);
            }
            router.push('/home');
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${activeTab}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-deep-void text-static-white font-inter selection:bg-voltage-blue/30 relative overflow-hidden flex flex-col items-center justify-center">
            <HoneycombBackground />

            {/* Header Controls */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-20">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-transparent  flex items-center justify-center text-static-white/60 hover:text-static-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </motion.button>
            </div>

            <main className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col items-center">
                {/* Mascot Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center mb-8"
                >
                    <div className="relative w-28 h-28 md:w-32 md:h-32 mb-6">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 rounded-full bg-voltage-blue/20 blur-2xl"
                        />
                        <div >
                            <Image
                                src="/assets/logo.png"
                                alt="logo"
                                width={200}
                                height={200}
                            />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-michroma font-bold italic text-static-white mb-2 tracking-tight text-center">
                        {activeTab === 'login' ? 'Welcome Back!' : 'Create Your Account?'}
                    </h1>
                    <p className="text-static-white/50 text-center text-xs md:text-sm max-w-[280px]">
                        {activeTab === 'login'
                            ? 'Sign in to access smart, personalized quiz plans made for you.'
                            : 'Create your account to explore exciting quiz destinations and adventures.'}
                    </p>
                </motion.div>

                <AuthSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Auth Form */}
                <form className="w-full space-y-2" onSubmit={handleAuth}>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 mb-4 text-sm text-danger-red bg-danger-red/10 border border-danger-red/20 rounded-xl text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'signup' && (
                                <div className="flex gap-4">
                                    <AuthInput
                                        label="First Name*"
                                        type="text"
                                        icon={User}
                                        placeholder="Alex"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                    <AuthInput
                                        label="Last Name*"
                                        type="text"
                                        icon={User}
                                        placeholder="Smith"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            )}

                            <AuthInput
                                label="Email address*"
                                type="email"
                                icon={Mail}
                                placeholder="example@gmail.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <AuthInput
                                label="Password*"
                                type="password"
                                icon={Lock}
                                placeholder="@Sn123hsn#"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {activeTab === 'login' && (
                        <div className="flex items-center justify-between mb-6 px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-carbon-grey text-voltage-blue focus:ring-voltage-blue/20" />
                                <span className="text-[10px] md:text-xs text-static-white/40 group-hover:text-static-white/60 transition-colors">Remember me</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => router.push('/auth/forgot-password')}
                                className="text-[10px] md:text-xs text-static-white/40 hover:text-voltage-blue transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <BlitzButton
                        type="submit"
                        isLoading={isLoading}
                        className="mt-6"
                    >
                        {activeTab === 'login' ? 'Sign In' : 'Register'}
                    </BlitzButton>
                </form>

                {/* Divider */}
                <div className="w-full flex items-center gap-4 my-8">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] uppercase tracking-widest text-static-white/20 font-bold">Or continue with</span>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                {/* Social Logins */}
                <div className="w-full flex gap-4 mb-10">
                    <SocialButton provider="google" />
                </div>


            </main>
        </div>
    );
}
