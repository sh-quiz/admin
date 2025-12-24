'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface Props {
    provider: 'google' | 'apple' | 'facebook';
    onClick?: () => void;
}

const providers = {
    google: {
        name: 'Google',
        icon: 'https://www.svgrepo.com/show/475656/google-color.svg',
    },
    apple: {
        name: 'Apple',
        icon: 'https://www.svgrepo.com/show/475635/apple-color.svg',
    },
    facebook: {
        name: 'Facebook',
        icon: 'https://www.svgrepo.com/show/475647/facebook-color.svg',
    }
};

export default function SocialButton({ provider, onClick }: Props) {
    const { name, icon } = providers[provider];

    return (
        <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#2C313B' }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="flex-1 h-14 bg-carbon-grey border border-white/5 rounded-xl flex items-center justify-center gap-3 transition-colors"
        >
            <img src={icon} alt={name} className="w-5 h-5" />
            <span className="text-static-white text-sm font-medium">{name}</span>
        </motion.button>
    );
}
