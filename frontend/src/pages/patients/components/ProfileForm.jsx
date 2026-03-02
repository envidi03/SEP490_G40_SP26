import React from 'react';
import PropTypes from 'prop-types';
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import Input from '../../../components/ui/Input';

/**
 * ProfileForm - Component hiển thị form thông tin cá nhân
 * Hỗ trợ cả chế độ view và edit
 * 
 * @param {Object} formData - Dữ liệu form (name, email, phone, dateOfBirth, gender, address)
 * @param {function} onChange - Callback khi thay đổi input
 * @param {boolean} isEditing - Có đang ở chế độ edit hay không
 */
const ProfileForm = ({ formData, onChange, isEditing }) => {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-1" />
                    Họ và tên
                </label>
                <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    disabled={!isEditing}
                    className="w-full"
                    required
                />
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-1" />
                    Email
                </label>
                <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    disabled={!isEditing}
                    className="w-full"
                    required
                />
            </div>

            {/* Phone */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-1" />
                    Số điện thoại
                </label>
                <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={onChange}
                    disabled={!isEditing}
                    className="w-full"
                    required
                />
            </div>

            {/* Date of Birth */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Ngày sinh
                </label>
                <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={onChange}
                    disabled={!isEditing}
                    className="w-full"
                />
            </div>

            {/* Gender */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-1" />
                    Giới tính
                </label>
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={onChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Địa chỉ
                </label>
                <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={onChange}
                    disabled={!isEditing}
                    className="w-full"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                />
            </div>
        </div>
    );
};

ProfileForm.propTypes = {
    formData: PropTypes.shape({
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        phone: PropTypes.string.isRequired,
        dateOfBirth: PropTypes.string,
        gender: PropTypes.string,
        address: PropTypes.string,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    isEditing: PropTypes.bool.isRequired,
};

export default ProfileForm;
