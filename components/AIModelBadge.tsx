import React from 'react';

interface AIModelBadgeProps {
    name: string;
    provider: string;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'light';
    size?: 'sm' | 'md';
}

export default function AIModelBadge({
    name,
    provider,
    variant = 'primary',
    size = 'md',
}: AIModelBadgeProps) {
    const sizeStyles = {
        sm: 'text-theme-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
    };

    const variantStyles = {
        primary: 'bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400',
        success: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
        warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400',
        error: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500',
        light: 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80',
    };

    return (
        <div className="flex items-center gap-2">
            <span
                className={`inline-flex items-center justify-center gap-1 rounded-full font-medium ${sizeStyles[size]} ${variantStyles[variant]}`}
            >
                {name}
            </span>
            <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                {provider}
            </span>
        </div>
    );
}
