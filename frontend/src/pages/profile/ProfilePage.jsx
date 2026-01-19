import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Edit2, Save, X, Camera, ArrowLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '0901234567',
        dob: user?.dob || '1990-01-01',
        address: user?.address || 'TP. Hồ Chí Minh',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh!');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước ảnh không được vượt quá 5MB!');
                return;
            }
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // TODO: Implement save to backend
        console.log('Saving profile:', formData);
        if (avatarPreview) {
            console.log('New avatar:', avatarPreview);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            full_name: user?.full_name || '',
            email: user?.email || '',
            phone: user?.phone || '0901234567',
            dob: user?.dob || '1990-01-01',
            address: user?.address || 'TP. Hồ Chí Minh',
        });
        setAvatarPreview(null);
        setIsEditing(false);
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin': return 'bg-purple-100 text-purple-700';
            case 'Doctor': return 'bg-blue-100 text-blue-700';
            case 'Receptionist': return 'bg-green-100 text-green-700';
            case 'Pharmacy': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Quay lại</span>
            </button>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Thông Tin Cá Nhân</h1>
                <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản của bạn</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Avatar & Role */}
                <div className="lg:col-span-1">
                    <Card>
                        <div className="text-center">
                            {/* Avatar with Upload */}
                            <div className="relative w-32 h-32 mx-auto mb-4">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar Preview"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                                    />
                                ) : (
                                    <div className="w-32 h-32 bg-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                                        {getInitials(user?.full_name)}
                                    </div>
                                )}

                                {/* Upload Button - Only in edit mode */}
                                {isEditing && (
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-lg"
                                    >
                                        <Camera size={20} className="text-white" />
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            <h2 className="text-xl font-bold text-gray-900">{user?.full_name}</h2>
                            <p className="text-sm text-gray-600 mt-1">{user?.email}</p>

                            {/* Role Badge */}
                            <div className="mt-4">
                                <span className={`inline-block px-4 py-2 rounded-full font-medium ${getRoleColor(user?.role)}`}>
                                    {user?.role}
                                </span>
                            </div>

                            {/* Edit Button */}
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="mt-6 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Edit2 size={18} />
                                    Chỉnh sửa thông tin
                                </button>
                            )}
                        </div>
                    </Card>

                    {/* Stats Card */}
                    <Card className="mt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Thống kê</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Tài khoản từ</span>
                                <span className="text-sm font-medium text-gray-900">Jan 2024</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Trạng thái</span>
                                <Badge variant="success">Đang hoạt động</Badge>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Information */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Thông tin chi tiết</h3>
                            {isEditing && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                    >
                                        <X size={18} />
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-colors"
                                    >
                                        <Save size={18} />
                                        Lưu
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <User size={18} className="mr-2 text-gray-400" />
                                    Họ và tên
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                ) : (
                                    <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{formData.full_name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <Mail size={18} className="mr-2 text-gray-400" />
                                    Email
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                ) : (
                                    <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{formData.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <Phone size={18} className="mr-2 text-gray-400" />
                                    Số điện thoại
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                ) : (
                                    <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{formData.phone}</p>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <Calendar size={18} className="mr-2 text-gray-400" />
                                    Ngày sinh
                                </label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                ) : (
                                    <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{formData.dob}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <MapPin size={18} className="mr-2 text-gray-400" />
                                    Địa chỉ
                                </label>
                                {isEditing ? (
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                ) : (
                                    <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{formData.address}</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Security Card */}
                    <Card className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bảo mật</h3>
                        <div className="space-y-4">
                            <button className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <p className="font-medium text-gray-900">Đổi mật khẩu</p>
                                <p className="text-sm text-gray-600 mt-1">Cập nhật mật khẩu của bạn</p>
                            </button>
                            <button className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <p className="font-medium text-gray-900">Xác thực 2 yếu tố</p>
                                <p className="text-sm text-gray-600 mt-1">Tăng cường bảo mật tài khoản</p>
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
