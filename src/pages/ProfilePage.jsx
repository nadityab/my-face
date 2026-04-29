// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { FiEdit2, FiLogOut } from "react-icons/fi";
import api, { API_URL } from "../api";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Ambil data user dari backend (pakai token, gak perlu userId)
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
      setEditForm({
        username: response.data.user.username || "",
        bio: response.data.user.bio || "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Gagal ambil profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    // Validasi password
    if (editForm.newPassword !== editForm.confirmPassword) {
      alert("Password dan konfirmasi password tidak cocok!");
      return;
    }

    try {
      // 1. Update profil (username, bio, password)
      const dataToSend = {
        username: editForm.username,
        bio: editForm.bio,
      };
      if (editForm.newPassword) {
        dataToSend.password = editForm.newPassword;
      }

      await api.put("/auth/profile", dataToSend);

      // 2. Upload avatar kalau ada file baru
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await api.post("/auth/profile/avatar", formData);
      }

      // 3. Refresh data user
      await fetchUserProfile();

      setIsEditing(false);
      setAvatarFile(null);
      alert("Profil berhasil diupdate!");
    } catch (error) {
      console.error("Gagal update profil:", error);
      alert(error.response?.data?.message || "Gagal update profil");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading profil...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header Profil */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-6">
        {/* Baris 1: Avatar + Username di kiri, Tombol Edit di kanan */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Avatar - bisa diklik hanya saat isEditing */}
            <div className="relative">
              {isEditing ? (
                <>
                  <input
                    type="file"
                    id="avatarUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setAvatarFile(file);
                        // Preview langsung
                        const previewUrl = URL.createObjectURL(file);
                        setUser({ ...user, avatarPreview: previewUrl });
                      }
                    }}
                  />
                  <label
                    htmlFor="avatarUpload"
                    className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0 cursor-pointer hover:opacity-80 transition"
                  >
                    {user?.avatarPreview ? (
                      <img
                        src={user.avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : user?.avatar ? (
                      <img
                        src={`${API_URL}${user.avatar}`}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      user?.username?.charAt(0)?.toUpperCase() || <CgProfile size={32} />
                    )}
                  </label>
                </>
              ) : (
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {user?.avatar ? (
                    <img
                      src={`${API_URL}${user.avatar}`}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    user?.username?.charAt(0)?.toUpperCase() || <CgProfile size={32} />
                  )}
                </div>
              )}
            </div>

            {/* Username */}
            <div className="flex-1">
              {isEditing ? (
                <>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Username
                  </h3>
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditChange}
                    className="w-full text-lg font-semibold bg-gray-100 dark:bg-slate-700 dark:text-white px-3 py-1 rounded-lg"
                    placeholder="Username"
                  />
                </>
              ) : (
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                  @{user?.username || "username"}
                </h1>
              )}
            </div>
          </div>

          {/* Tombol Edit - hanya muncul saat tidak edit */}
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="shrink-0 ml-4">
              <FiEdit2 className="text-white text-xl cursor-pointer hover:scale-110" />
            </button>
          )}
        </div>

        {/* Bio */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Bio
          </h3>
          {isEditing ? (
            <textarea
              name="bio"
              value={editForm.bio}
              onChange={handleEditChange}
              rows="3"
              className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="Ceritakan tentang dirimu..."
            />
          ) : (
            <p className="text-gray-700 dark:text-gray-300">
              {user?.bio || "Belum ada bio"}
            </p>
          )}
        </div>

        {/* Ganti Password - Hanya muncul saat isEditing true */}
        {isEditing && (
          <div className="mt-6 pt-4 border-t dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              Ganti Password
            </h3>

            {/* Password Baru */}
            <div className="mb-3">
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                Password Baru
              </label>
              <input
                type="password"
                name="newPassword"
                value={editForm.newPassword}
                onChange={handleEditChange}
                className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Masukkan password baru"
              />
            </div>

            {/* Konfirmasi Password */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={editForm.confirmPassword}
                onChange={handleEditChange}
                className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Konfirmasi password baru"
              />
            </div>
          </div>
        )}

        {/* Tombol Save & Cancel - Muncul saat isEditing true */}
        {isEditing && (
          <div className="flex gap-3 mt-6 pt-4 border-t dark:border-slate-700">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditForm({
                  username: user?.username || "",
                  bio: user?.bio || "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setAvatarFile(null);
                // Reset preview avatar
                setUser({ ...user, avatarPreview: null });
              }}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition cursor-pointer"
            >
              Batal
            </button>

            <button
              onClick={handleSaveProfile}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition cursor-pointer"
            >
              Simpan
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProfilePage;