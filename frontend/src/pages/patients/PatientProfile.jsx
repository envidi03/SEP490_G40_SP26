import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import PublicLayout from "../../components/layout/PublicLayout";
import { Save, X, ArrowLeft } from "lucide-react";

// Import các components con
import ProfileHeader from "./components/ProfileHeader";
import ProfileForm from "./components/ProfileForm";
import PasswordChangeSection from "./components/PasswordChangeSection";
import { getProfile, updateProfile } from "../../services/profileService";

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
  const { user } = useAuth();
  const navigate = useNavigate();

  // State quản lý chế độ edit
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Password data state
  const [passwordData, setPasswordData] = useState({
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

        setFormData({
          name: profile?.full_name || "",
          email: profile?.account_id?.email || "",
          phone: profile?.phone || "",
          dateOfBirth: profile?.dob ? profile.dob.split("T")[0] : "",
          gender: profile?.gender || "",
          address: profile?.address || "",
        });
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
   * Handler: Hủy chỉnh sửa và reset form
   */
  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dateOfBirth: user?.dateOfBirth || "",
      gender: user?.gender || "",
      address: user?.address || "",
    });
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
      };

      const res = await updateProfile(payload);

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

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({
        show: true,
        type: "error",
        message: "❌ Mật khẩu xác nhận không khớp!",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setToast({
        show: true,
        type: "error",
        message: "❌ Mật khẩu phải có ít nhất 6 ký tự!",
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordSection(false);
      setLoading(false);
      setToast({
        show: true,
        type: "success",
        message: "✅ Đổi mật khẩu thành công!",
      });
    }, 800);
  };

  /**
   * Handler: Toggle password section
   */
  const handleTogglePasswordSection = () => {
    if (showPasswordSection) {
      // Reset password form khi đóng
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setShowPasswordSection(!showPasswordSection);
  };

  // ========== RENDER ==========

  return (
    <PublicLayout>
      {/* Toast Notification */}
      {toast.show && (
        <Toast
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
