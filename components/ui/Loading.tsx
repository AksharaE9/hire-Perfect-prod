'use client';

import React from 'react';

interface LoadingProps {
    variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'orbit';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fullScreen?: boolean;
    text?: string;
    className?: string;
}

export default function Loading({
    variant = 'spinner',
    size = 'md',
    fullScreen = false,
    text,
    className = '',
}: LoadingProps) {
    const sizeConfig = {
        sm: { box: 'w-6 h-6', stroke: 3, radius: 9, center: 12, dot: 'w-1.5 h-1.5' },
        md: { box: 'w-10 h-10', stroke: 3.5, radius: 15, center: 20, dot: 'w-2 h-2' },
        lg: { box: 'w-14 h-14', stroke: 4, radius: 21, center: 28, dot: 'w-2.5 h-2.5' },
        xl: { box: 'w-20 h-20', stroke: 4.5, radius: 30, center: 40, dot: 'w-3.5 h-3.5' },
    };

    const current = sizeConfig[size] || sizeConfig.md;

    // Smooth Dual-Arc Spinner with subtle brand node
    const Spinner = () => (
        <div className="flex flex-col items-center justify-center gap-3.5" role="status" aria-live="polite">
            <div className={`relative ${current.box} flex items-center justify-center`}>
                <svg
                    className="w-full h-full animate-smooth-spin"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Background track circle */}
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-line opacity-60"
                    />
                    {/* Smooth glowing active gradient arc */}
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="95 150"
                        className="text-navy"
                    />
                </svg>
                {/* Center brand pulse dot for visual polish */}
                <div className="absolute w-2 h-2 rounded-full bg-navy/30 animate-pulse-ring" />
            </div>
            {text && (
                <p className="text-slate text-xs font-semibold tracking-wide animate-pulse">
                    {text}
                </p>
            )}
            <span className="sr-only">{text || 'Loading...'}</span>
        </div>
    );

    // Smooth Flowing Dots
    const Dots = () => (
        <div className="flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
            <div className="flex items-center gap-2">
                <div className={`${current.dot} bg-navy rounded-full animate-bounce`} style={{ animationDuration: '0.9s', animationDelay: '0ms' }} />
                <div className={`${current.dot} bg-navy/80 rounded-full animate-bounce`} style={{ animationDuration: '0.9s', animationDelay: '150ms' }} />
                <div className={`${current.dot} bg-navy/60 rounded-full animate-bounce`} style={{ animationDuration: '0.9s', animationDelay: '300ms' }} />
            </div>
            {text && <p className="text-slate text-xs font-semibold">{text}</p>}
            <span className="sr-only">{text || 'Loading...'}</span>
        </div>
    );

    // Smooth Breathing Pulse Orb
    const Pulse = () => (
        <div className="flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
            <div className={`relative ${current.box} flex items-center justify-center`}>
                <div className="absolute inset-0 rounded-full bg-blue-tint animate-pulse-ring" />
                <div className="w-1/2 h-1/2 rounded-full bg-navy shadow-sm animate-pulse" />
            </div>
            {text && <p className="text-slate text-xs font-semibold">{text}</p>}
            <span className="sr-only">{text || 'Loading...'}</span>
        </div>
    );

    // Shimmer Skeleton
    const Skeleton = () => (
        <div className="w-full space-y-3" role="status" aria-live="polite">
            <div className="h-4 rounded-lg skeleton-shimmer w-3/4" />
            <div className="h-4 rounded-lg skeleton-shimmer w-full" />
            <div className="h-4 rounded-lg skeleton-shimmer w-5/6" />
            <span className="sr-only">Loading content...</span>
        </div>
    );

    const renderLoading = () => {
        switch (variant) {
            case 'dots':
                return <Dots />;
            case 'pulse':
                return <Pulse />;
            case 'skeleton':
                return <Skeleton />;
            default:
                return <Spinner />;
        }
    };

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-paper/85 backdrop-blur-md flex items-center justify-center z-[150] p-6 transition-all duration-300">
                <div className="bg-white border border-line rounded-2xl p-8 sm:p-10 shadow-md flex flex-col items-center max-w-sm w-full mx-auto text-center animate-in fade-in zoom-in-95 duration-200">
                    {renderLoading()}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            {renderLoading()}
        </div>
    );
}

// Pre-built Smooth Skeleton Cards for Data Tables & Grids
export function SkeletonCard() {
    return (
        <div className="bg-white border border-line rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <div className="h-4 rounded-md skeleton-shimmer w-1/3" />
                <div className="h-5 rounded-md skeleton-shimmer w-16" />
            </div>
            <div className="h-7 rounded-md skeleton-shimmer w-2/3" />
            <div className="space-y-2 pt-2 border-t border-line">
                <div className="h-3.5 rounded-md skeleton-shimmer w-full" />
                <div className="h-3.5 rounded-md skeleton-shimmer w-4/5" />
            </div>
        </div>
    );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2.5">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-3.5 rounded-md skeleton-shimmer"
                    style={{ width: i === lines - 1 ? '70%' : '100%' }}
                />
            ))}
        </div>
    );
}
