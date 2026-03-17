import React from 'react';
import { Clock, CheckCheck, Trash2, MoreVertical } from 'lucide-react';

const NotificationItem = ({ 
    notification, 
    onToggleRead, 
    onDelete, 
    onClick,
    isCompact = false 
}) => {
    const { 
        id, 
        title, 
        content, 
        time, 
        isRead, 
        icon: Icon, 
        iconClass 
    } = notification;

    return (
        <div 
            onClick={() => onClick && onClick(notification)}
            className={`p-4 transition-all hover:bg-gray-50/50 flex gap-4 items-start relative group cursor-pointer ${
                !isRead ? 'bg-primary-50/20' : ''
            } ${isCompact ? 'p-3' : 'p-4'}`}
        >
            {!isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600"></div>
            )}

            <div className={`rounded-2xl shrink-0 ${notification.iconClass} ${isCompact ? 'p-2' : 'p-3'}`}>
                <Icon size={isCompact ? 18 : 24} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={`text-sm truncate ${
                        !isRead ? 'text-gray-900 font-bold' : 'text-gray-700 font-semibold'
                    } ${isCompact ? 'text-[13px]' : 'text-base'}`}>
                        {title}
                    </h3>
                    {!isCompact && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock size={12} />
                            {time}
                        </div>
                    )}
                </div>
                <p 
                    className={`text-sm leading-relaxed ${
                        !isRead ? 'text-gray-800 font-medium' : 'text-gray-600'
                    } ${isCompact ? 'text-xs line-clamp-2' : ''}`}
                    dangerouslySetInnerHTML={{ __html: content }}
                ></p>
                
                {isCompact && (
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                        <Clock size={10} />
                        {time}
                    </div>
                )}

                {!isCompact && (
                    <div className="mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleRead(id); }}
                            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                            <CheckCheck size={14} />
                            {isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                            <Trash2 size={14} />
                            Xóa
                        </button>
                    </div>
                )}
            </div>

            {!isRead && (
                <div className="w-2.5 h-2.5 bg-primary-600 rounded-full mt-2 shrink-0"></div>
            )}
            
            {isCompact && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bottom-2">
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-400">
                        <MoreVertical size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationItem;
