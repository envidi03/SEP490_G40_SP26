import React from 'react';
import PropTypes from 'prop-types';
import { User, Mail, Camera, Edit2 } from 'lucide-react';

/**
 * ProfileHeader - Component header của trang profile
 * Hiển thị avatar, tên, email và nút chỉnh sửa
 * 
 * @param {Object} user - Thông tin user
 * @param {boolean} isEditing - Có đang ở chế độ edit hay không
 * @param {function} onEdit - Callback khi click nút chỉnh sửa
 */
const ProfileHeader = ({ user, isEditing, onEdit }) => {
    return (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-12 relative">
            <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <User size={48} className="text-primary-600" />
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors">
                        <Camera size={16} className="text-gray-600" />
                    </button>
                </div>

                {/* User Info */}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
                    <p className="text-white/90 flex items-center gap-2">
                        <Mail size={16} />
                        {user?.email}
                    </p>
                </div>

                {/* Edit Button */}
                {!isEditing && (
                    <button
                        onClick={onEdit}
                        className="px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <Edit2 size={18} />
                        Chỉnh sửa
                    </button>
                )}
            </div>
        </div>
    );
};

ProfileHeader.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
    }),
    isEditing: PropTypes.bool.isRequired,
    onEdit: PropTypes.func.isRequired,
};

export default ProfileHeader;
