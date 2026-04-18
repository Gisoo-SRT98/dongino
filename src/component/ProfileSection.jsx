import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/useUserStore";

export default function ProfileSection() {
  const navigate = useNavigate();
  const {
    user,
    isLoggedIn,
    profileImage,
    updateProfileImage,
    updatePassword,
    logout,
  } = useUserStore();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateProfileImage(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordUpdate = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("تمام فیلدها را پر کنید");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("رمز عبور جدید مطابقت ندارد");
      return;
    }
    if (updatePassword(oldPassword, newPassword)) {
      setPasswordMessage("رمز عبور با موفقیت تغییر کرد");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setIsEditingPassword(false), 1500);
    } else {
      setPasswordMessage("خطا در تغییر رمز عبور");
    }
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="text-center text-gray-500 py-8">کاربر وارد نشده است</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Image Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-right"> پروفایل</h2>
        <div className="flex flex-col items-center gap-4">
          <div className="w-25 h-25 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden border-4 border-gray-300">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-5xl">👤</span>
            )}
          </div>
          <label className="cursor-pointer">
            <div className="text-md px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 font-medium">
              انتخاب عکس
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* User Information Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-right">ℹ️ اطلاعات کاربری</h2>
        <div className="space-y-3 text-right">
          {user.username && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">نام کاربری</p>
              <p className="font-semibold text-gray-800">{user.username}</p>
            </div>
          )}
          {user.email && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">ایمیل</p>
              <p className="font-semibold text-gray-800">{user.email}</p>
            </div>
          )}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">نوع ورود</p>
            <p className="font-semibold text-gray-800">
              {user.loginType === "username"
                ? "نام کاربری و رمز عبور"
                : "ایمیل"}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsEditingPassword(!isEditingPassword)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 font-medium"
          >
            {isEditingPassword ? "لغو" : "تغییر رمز عبور"}
          </button>
          <h2 className="text-xl font-bold"> رمز عبور</h2>
        </div>

        {isEditingPassword && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                رمز عبور فعلی
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="text-sm w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-right"
                placeholder="رمز عبور فعلی را وارد کنید"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                رمز عبور جدید
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="text-sm w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-right"
                placeholder="رمز عبور جدید را وارد کنید"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                تایید رمز عبور جدید
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="text-sm w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-right"
                placeholder="رمز عبور جدید را دوباره وارد کنید"
              />
            </div>

            {passwordMessage && (
              <div
                className={`p-3 rounded-lg text-right font-medium ${
                  passwordMessage.includes("موفقیت")
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                {passwordMessage}
              </div>
            )}

            <button
              onClick={handlePasswordUpdate}
              className="w-full px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg transition-all duration-200 font-medium"
            >
              ذخیره تغییرات
            </button>
          </div>
        )}
      </div>

      {/* Logout Section */}
      <button
        onClick={logout}
        className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium"
      >
        خروج از حساب
      </button>
    </div>
  );
}
