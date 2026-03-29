import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import PublicLayout from "../../components/layout/PublicLayout";
import { Save, X, ArrowLeft } from "lucide-react";

// Import các components con
import ProfileHeader from "./components/ProfileHeader";
import ProfileForm from "./components/ProfileForm";
import { getProfile, updateProfile, uploadAvatar } from "../../services/profileService";
import authService from "../../services/authService";
import PasswordChangeSection from "./components/PasswordChangeSection";

/**
 * PatientProfile - Trang quản lý thông tin cá nhân của bệnh nhân
 *
 * Chức năng:
 * - Xem thông tin cá nhân
 * - Chỉnh sửa thông tin cá nhân
 * - Đổi mật khẩu
 * - Toast notifications
 *
 * @component
 */
const PatientProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // State quản lý chế độ edit
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [loading, setLoading] = useState(false);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Lưu dữ liệu gốc từ API để reset khi hủy chỉnh sửa
  const originalDataRef = useRef(null);

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Effect: Sync form data từ user khi user thay đổi
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();

        const profile = res.data;

        const profileData = {
          name: profile?.full_name || "",
          email: profile?.account_id?.email || "",
          phone: profile?.account_id?.phone_number || "",
          dateOfBirth: profile?.dob ? profile.dob.split("T")[0] : "",
          gender: profile?.gender || "",
          address: profile?.address || "",
        };

        setFormData(profileData);
        originalDataRef.current = profileData;

        // Đồng bộ với AuthContext
        updateUser({
          name: profileData.name,
          full_name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
          gender: profileData.gender,
          dob: profileData.dateOfBirth
        });

        // Set avatar URL from profile
        setAvatarUrl(profile?.avatar_url || "");
      } catch (error) {
        console.error("Lỗi khi tải thông tin hồ sơ:", error);
        setToast({
          show: true,
          type: "error",
          message: "Không thể tải thông tin hồ sơ!",
        });
      }
    };

    fetchProfile();
  }, []);

  // ========== HANDLERS ==========

  /**
   * Handler: Thay đổi thông tin trong form
   */
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Handler: Thay đổi password inputs
   */
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Handler: Bật chế độ edit
   */
  const handleEdit = () => {
    setIsEditing(true);
  };

  /**
   * Handler: Upload avatar mới
   */
  const handleAvatarChange = async (file) => {
    setAvatarLoading(true);
    try {
      const res = await uploadAvatar(file);
      const newUrl = res.data?.avatar_url;
      if (newUrl) {
        setAvatarUrl(newUrl);
      }
      setToast({
        show: true,
        type: "success",
        message: "Cập nhật ảnh đại diện thành công!",
      });
    } catch (error) {
      setToast({
        show: true,
        type: "error",
        message: error.response?.data?.message || "Upload ảnh thất bại!",
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  /**
   * Handler: Hủy chỉnh sửa và reset form
   */
  const handleCancel = () => {
    // Reset về dữ liệu gốc từ API
    if (originalDataRef.current) {
      setFormData(originalDataRef.current);
    }
    setIsEditing(false);
  };

  /**
   * Handler: Lưu thông tin profile
   */
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        full_name: formData.name,
        gender: formData.gender,
        address: formData.address,
        dob: formData.dateOfBirth,
        phone: formData.phone,
      };

      const res = await updateProfile(payload);

      // Đồng bộ với AuthContext
      updateUser({
        name: formData.name,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        dob: formData.dateOfBirth
      });

      setIsEditing(false);

      setToast({
        show: true,
        type: "success",
        message: "Cập nhật thông tin thành công!",
      });
    } catch (error) {
      setToast({
        show: true,
        type: "error",
        message: error.response?.data?.message || "❌ Cập nhật thất bại!",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handler: Đổi mật khẩu
   */
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    // Reset errors
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    setPasswordErrors(newErrors);

    let hasError = false;

    // Validation for empty fields
    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại. (Please enter current password.)";
      hasError = true;
    }
    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới. (Please enter new password.)";
      hasError = true;
    }
    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới. (Please confirm new password.)";
      hasError = true;
    }

    if (hasError) {
      setPasswordErrors(newErrors);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordErrors({
        ...newErrors,
        newPassword: "Mật khẩu mới phải có ít nhất 8 ký tự. (Must be at least 8 characters.)"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({
        ...newErrors,
        confirmPassword: "Mật khẩu xác nhận không khớp. (Passwords do not match.)"
      });
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordSection(false);
      setToast({
        show: true,
        type: "success",
        message: "Đổi mật khẩu thành công! (Password changed successfully!)",
      });
    } catch (error) {
      console.error("DEBUG - Lỗi đổi mật khẩu (Full Error Object):", error);
      
      // Extremely robust extraction to avoid empty backendMessage
      const backendMessage = 
        error?.data?.message || 
        error?.response?.data?.message || 
        (typeof error?.data === 'string' ? error.data : null) ||
        error?.message || 
        error?.statusText ||
        "";

      console.log("DEBUG - Extracted backendMessage:", backendMessage);

      const newErrors = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };

      // Map common backend error messages to fields
      const lowerMsg = backendMessage.toLowerCase();
      if (lowerMsg.includes("current password") || 
          lowerMsg.includes("old password") ||
          backendMessage.includes("mật khẩu hiện tại")) {
        newErrors.currentPassword = "Mật khẩu hiện tại không chính xác. (Incorrect current password.)";
        setPasswordErrors(newErrors);
      } else if (lowerMsg.includes("same as old") || 
                 backendMessage.includes("mật khẩu mới trùng")) {
        newErrors.newPassword = "Mật khẩu mới không được trùng mật khẩu cũ. (New password cannot be same as old.)";
        setPasswordErrors(newErrors);
      } else if (lowerMsg.includes("8 characters") || 
                 lowerMsg.includes("at least 8")) {
        newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự và đủ độ phức tạp. (Must be at least 8 characters.)";
        setPasswordErrors(newErrors);
      } else {
        // Fallback for generic errors
        setToast({
          show: true,
          type: "error",
          message: `❌ ${backendMessage || "Đổi mật khẩu thất bại! (Change password failed!)"}`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handler: Toggle password section
   */
  const handleTogglePasswordSection = () => {
    // Reset password form và errors khi đóng/mở
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordSection(!showPasswordSection);
  };

  // ========== RENDER ==========

  return (
    <PublicLayout>
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          key={toast.message + Date.now()}
          show={toast.show}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
          duration={3000}
        />
      )}

      <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform duration-200"
            />
            <span className="font-medium">Quay lại</span>
          </button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hồ sơ cá nhân
            </h1>
            <p className="text-gray-600">
              Quản lý thông tin cá nhân và cài đặt bảo mật
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            {/* Profile Header Component */}
            <ProfileHeader
              user={user}
              isEditing={isEditing}
              onEdit={handleEdit}
              avatarUrl={avatarUrl}
              onAvatarChange={handleAvatarChange}
              avatarLoading={avatarLoading}
            />

            {/* Profile Form */}
            <form onSubmit={handleSave} className="p-8">
              <ProfileForm
                formData={formData}
                onChange={handleInputChange}
                isEditing={isEditing}
              />

              {/* Action Buttons - Only show in edit mode */}
              {isEditing && (
                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700"
                  >
                    <Save size={18} className="inline mr-2" />
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <X size={18} className="inline mr-2" />
                    Hủy
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Password Section Component */}
          <PasswordChangeSection
            isOpen={showPasswordSection}
            onToggle={handleTogglePasswordSection}
            passwordData={passwordData}
            errors={passwordErrors}
            onChange={handlePasswordChange}
            onSubmit={handlePasswordUpdate}
            loading={loading}
          />
        </div>
      </div>
    </PublicLayout>
  );
};

export default PatientProfile;
