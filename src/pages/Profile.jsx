import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/useUserStore";
import ProfileSection from "../component/ProfileSection";

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    isLoggedIn,
    loginWithUsername,
    loginWithEmail,
    signupWithUsername,
    signupWithEmail,
  } = useUserStore();
  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  const [loginType, setLoginType] = useState("username"); // 'username' or 'email'
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    let success = false;

    if (loginType === "username") {
      if (!username || !password) {
        setError("نام کاربری و رمز عبور را وارد کنید");
        return;
      }
      success = await loginWithUsername(username, password);
    } else {
      if (!email || !password) {
        setError("ایمیل و رمز عبور را وارد کنید");
        return;
      }
      success = await loginWithEmail(email, password);
    }

    if (!success) {
      setError("خطا در ورود. اطلاعات درست نیست یا کاربر ثبت‌نام نشده است.");
      return;
    }

    // Clear form
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const handleSignup = async () => {
    setError("");
    let success = false;

    if (loginType === "username") {
      if (!username || !password || !confirmPassword) {
        setError("تمام فیلدها را پر کنید");
        return;
      }
      if (password !== confirmPassword) {
        setError("رمز عبور مطابقت ندارد");
        return;
      }
      success = await signupWithUsername(username, password);
    } else {
      if (!email || !password || !confirmPassword) {
        setError("تمام فیلدها را پر کنید");
        return;
      }
      if (password !== confirmPassword) {
        setError("رمز عبور مطابقت ندارد");
        return;
      }
      success = await signupWithEmail(email, password);
    }

    if (!success) {
      setError("خطا در ثبت‌نام. ممکن است نام کاربری یا ایمیل تکراری باشد.");
      return;
    }

    // Clear form
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen p-3">
      <button
        onClick={() => navigate(-1)}
        className="flex flex-row-reverse items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 mb-6"
      >
        <span className="text-lg leading-none">🔙</span>
        <span className="font-medium">بازگشت</span>
      </button>

      {/* If not logged in, show login/signup form */}
      {!isLoggedIn ? (
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <h1 className="text-xl font-bold mb-2 text-center">
            {mode === "login" ? "ورود" : "ثبت‌نام"}
          </h1>
          <p className="text-gray-500 text-sm text-center mb-6">
            {mode === "login"
              ? "برای دسترسی به پروفایل ابتدا وارد حساب خود شوید"
              : "حساب جدید بسازید"}
          </p>

          {/* Mode Switcher */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-3 text-sm rounded-lg transition-all duration-200 ${
                mode === "login"
                  ? "bg-orange-500 text-white"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ورود
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-3 rounded-lg transition-all duration-200 ${
                mode === "signup"
                  ? "bg-orange-500 text-white"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ثبت‌نام
            </button>
          </div>

          {/* Login Type Selector */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setLoginType("username")}
              className={`flex-1 py-3 text-sm rounded-lg transition-all duration-200 ${
                loginType === "username"
                  ? "bg-blue-500 text-white"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              نام کاربری
            </button>
            <button
              onClick={() => setLoginType("email")}
              className={`flex-1 py-3 rounded-lg  transition-all duration-200 ${
                loginType === "email"
                  ? "bg-blue-500 text-white"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ایمیل
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-xs p-1 bg-red-100 text-red-800 rounded-md mb-4 text-right border border-red-300">
              {error}
            </div>
          )}

          {/* Username Login/Signup */}
          {loginType === "username" && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  نام کاربری
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-sm px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  placeholder="نام کاربری را وارد کنید"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  رمز عبور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  placeholder="رمز عبور را وارد کنید"
                  onKeyPress={(e) => {
                    if (e.key === "Enter")
                      mode === "login" ? handleLogin() : handleSignup();
                  }}
                />
              </div>
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    تکرار رمز عبور
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-sm px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    placeholder="رمز عبور را تکرار کنید"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSignup();
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Email Login/Signup */}
          {loginType === "email" && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  ایمیل
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full  text-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  placeholder="ایمیل را وارد کنید"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  رمز عبور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  placeholder="رمز عبور را وارد کنید"
                  onKeyPress={(e) => {
                    if (e.key === "Enter")
                      mode === "login" ? handleLogin() : handleSignup();
                  }}
                />
              </div>
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    تکرار رمز عبور
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    placeholder="رمز عبور را تکرار کنید"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSignup();
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={mode === "login" ? handleLogin : handleSignup}
            className="w-full px-4 py-3 bg-lime-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 font-bold text-sm"
          >
            {mode === "login" ? "ورود" : "ثبت‌نام"}
          </button>
        </div>
      ) : (
        /* If logged in, show profile section */
        <ProfileSection />
      )}
    </div>
  );
}
