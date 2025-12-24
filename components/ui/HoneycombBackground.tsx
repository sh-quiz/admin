'use client';

import { motion } from 'framer-motion';

export default function HoneycombBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-deep-void pointer-events-none">
            {/* Radial Gradient Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(28,33,43,0.4),rgba(11,14,20,1))]" />

            {/* Honeycomb Pattern - Top Left */}
            <div
                className="absolute top-0 left-0 w-1/3 h-1/3 opacity-[0.05]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='60' viewBox='0 0 52 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M26 0l26 15v30L26 60 0 45V15z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
                    backgroundSize: '52px 60px',
                    maskImage: 'radial-gradient(circle at top left, black, transparent 80%)',
                    WebkitMaskImage: 'radial-gradient(circle at top left, black, transparent 80%)'
                }}
            />

            {/* Honeycomb Pattern - Bottom Right */}
            <div
                className="absolute bottom-0 right-0 w-1/3 h-1/3 opacity-[0.05]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='60' viewBox='0 0 52 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M26 0l26 15v30L26 60 0 45V15z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
                    backgroundSize: '52px 60px',
                    maskImage: 'radial-gradient(circle at bottom right, black, transparent 80%)',
                    WebkitMaskImage: 'radial-gradient(circle at bottom right, black, transparent 80%)'
                }}
            />

            {/* Subtle Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-voltage-blue/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blitz-yellow/5 blur-[120px] rounded-full" />
        </div>
    );
}
