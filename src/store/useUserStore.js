import { create } from "zustand";
import {
  authStore,
  signIn,
  signUp,
  signOut,
  getCurrentUser,
} from "../services/pocketbase";

const createUserState = () => {
  const currentUser = getCurrentUser();
  return {
    user: currentUser
      ? {
          username: currentUser.username || null,
          email: currentUser.email || null,
          loginType: currentUser.username ? "username" : "email",
        }
      : null,
    isLoggedIn: Boolean(currentUser),
    profileImage: localStorage.getItem("profileImage") || null,
  };
};

const useUserStore = create((set) => ({
  ...createUserState(),

  loginWithUsername: async (username, password) => {
    try {
      const response = await signIn(username, password);
      const record = response.record || response;
      set({
        user: {
          username: record.username || username,
          email: record.email || null,
          loginType: "username",
        },
        isLoggedIn: true,
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  loginWithEmail: async (email, password) => {
    try {
      const response = await signIn(email, password);
      const record = response.record || response;
      set({
        user: {
          username: record.username || null,
          email: record.email || email,
          loginType: "email",
        },
        isLoggedIn: true,
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  signupWithUsername: async (username, password) => {
    try {
      await signUp({ username, password, passwordConfirm: password });
      // After signup, login
      const response = await signIn(username, password);
      const record = response.record || response;
      set({
        user: {
          username: record.username || username,
          email: record.email || null,
          loginType: "username",
        },
        isLoggedIn: true,
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  signupWithEmail: async (email, password) => {
    try {
      await signUp({ email, password, passwordConfirm: password });
      // After signup, login
      const response = await signIn(email, password);
      const record = response.record || response;
      set({
        user: {
          username: record.username || null,
          email: record.email || email,
          loginType: "email",
        },
        isLoggedIn: true,
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  updatePassword: (oldPassword, newPassword) => {
    // Password update is currently not connected to PocketBase in this UI
    if (oldPassword && newPassword) {
      localStorage.setItem("password", newPassword);
      return true;
    }
    return false;
  },

  updateProfileImage: (imageData) => {
    set({ profileImage: imageData });
    localStorage.setItem("profileImage", imageData);
  },

  logout: () => {
    signOut();
    set({ user: null, isLoggedIn: false, profileImage: null });
    localStorage.removeItem("profileImage");
  },

  loadUser: () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      set({
        user: {
          username: currentUser.username || null,
          email: currentUser.email || null,
          loginType: currentUser.username ? "username" : "email",
        },
        isLoggedIn: true,
      });
    }
  },
}));

export default useUserStore;
