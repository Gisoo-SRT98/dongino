import { create } from "zustand";

const useUserStore = create((set) => ({
  // User authentication state
  user: null,
  isLoggedIn: false,
  profileImage: localStorage.getItem("profileImage") || null,

  // Login with username and password
  loginWithUsername: (username, password) => {
    if (username && password) {
      set({
        user: { username, email: null, loginType: "username" },
        isLoggedIn: true,
      });
      localStorage.setItem(
        "user",
        JSON.stringify({ username, email: null, loginType: "username" }),
      );
      return true;
    }
    return false;
  },

  // Login with email
  loginWithEmail: (email, password) => {
    if (email && password) {
      set({
        user: { username: null, email, loginType: "email" },
        isLoggedIn: true,
      });
      localStorage.setItem(
        "user",
        JSON.stringify({ username: null, email, loginType: "email" }),
      );
      return true;
    }
    return false;
  },

  // Update password
  updatePassword: (oldPassword, newPassword) => {
    // In a real app, verify oldPassword first
    if (oldPassword && newPassword) {
      localStorage.setItem("password", newPassword);
      return true;
    }
    return false;
  },

  // Update profile image
  updateProfileImage: (imageData) => {
    set({ profileImage: imageData });
    localStorage.setItem("profileImage", imageData);
  },

  // Logout
  logout: () => {
    set({ user: null, isLoggedIn: false, profileImage: null });
    localStorage.removeItem("user");
    localStorage.removeItem("profileImage");
  },

  // Load user from localStorage on app start
  loadUser: () => {
    const savedUser = localStorage.getItem("user");
    const savedImage = localStorage.getItem("profileImage");
    if (savedUser) {
      set({
        user: JSON.parse(savedUser),
        isLoggedIn: true,
        profileImage: savedImage,
      });
    }
  },
}));

export default useUserStore;
