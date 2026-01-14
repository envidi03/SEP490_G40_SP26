import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className, title, actions }) => {
    return (
        <div className={clsx('bg-white rounded-lg shadow-md', className)}>
            {title && (
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {actions && <div className="flex items-center space-x-2">{actions}</div>}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
};

export default Card;
