import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Breadcrumb Component - Reusable navigation breadcrumb
 * 
 * @param {Array} items - Array of breadcrumb items
 * @example
 * <Breadcrumb items={[
 *   { label: 'Trang chủ', path: '/' },
 *   { label: 'Bảng giá', path: '/pricing' },
 *   { label: 'Chi tiết' } // Last item without path (current page)
 * ]} />
 */
const Breadcrumb = ({ items = [] }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="bg-white border-b border-gray-200 mb-8">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <nav className="flex items-center gap-2 text-sm">
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;

                        return (
                            <div key={index} className="flex items-center gap-2">
                                {item.path ? (
                                    <Link
                                        to={item.path}
                                        className="text-gray-600 hover:text-primary-600 transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className="text-primary-600 font-medium">
                                        {item.label}
                                    </span>
                                )}

                                {!isLast && (
                                    <ChevronRight size={14} className="text-gray-400" />
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default Breadcrumb;
