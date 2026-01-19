import React from 'react';
import clsx from 'clsx';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    disabled,
    type = 'button',
    ...props
}) => {
    const baseStyles = 'font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';

    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500',
        ghost: 'text-gray-700 hover:bg-gray-100',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            type={type}
            disabled={disabled}
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
