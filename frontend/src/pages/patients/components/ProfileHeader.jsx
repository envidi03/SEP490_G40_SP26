import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { User, Mail, Camera, Edit2, Loader2 } from 'lucide-react';

/**
 * ProfileHeader - Component header của trang profile
 * Hiển thị avatar, tên, email và nút chỉnh sửa
 * Hỗ trợ upload avatar khi click nút Camera
 *
 * @param {Object} user - Thông tin user
 * @param {boolean} isEditing - Có đang ở chế độ edit hay không
 * @param {function} onEdit - Callback khi click nút chỉnh sửa
 * @param {string} avatarUrl - URL ảnh avatar hiện tại
 * @param {function} onAvatarChange - Callback khi chọn file avatar mới
 * @param {boolean} avatarLoading - Trạng thái đang upload avatar
 */
const ProfileHeader = ({ user, isEditing, onEdit, avatarUrl, onAvatarChange, avatarLoading }) => {
    const fileInputRef = useRef(null);

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onAvatarChange(file);
        }
        // Reset input để có thể chọn lại cùng một file
        e.target.value = '';
    };

    return (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-12 relative">
            <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User size={48} className="text-primary-600" />
                        )}

                        {/* Loading overlay */}
                        {avatarLoading && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <Loader2 size={28} className="text-white animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* Camera button - chỉ hiện khi đang ở chế độ chỉnh sửa */}
                    {isEditing && (
                        <>
                            <button
                                type="button"
                                onClick={handleCameraClick}
                                disabled={avatarLoading}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <Camera size={16} className="text-gray-600" />
                            </button>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </>
                    )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">
                        {user?.full_name || user?.name}
                    </h2>
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
    avatarUrl: PropTypes.string,
    onAvatarChange: PropTypes.func.isRequired,
    avatarLoading: PropTypes.bool,
};

ProfileHeader.defaultProps = {
    avatarUrl: '',
    avatarLoading: false,
};

export default ProfileHeader;
