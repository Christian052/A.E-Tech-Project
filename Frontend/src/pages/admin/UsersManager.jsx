import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Trash2,
  CheckCircle,
  XCircle,
  KeyRound,
  Shield,
  Edit,
} from "lucide-react";
import api from "../../api/axios";

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // MODALS STATE
  // =========================================================

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // =========================================================
  // FORM DATA
  // =========================================================

  const [createData, setCreateData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    role: "admin",
  });

  const [newPassword, setNewPassword] = useState("");

  // =========================================================
  // FETCH USERS
  // =========================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await api.get("/users");

      const rawUsers = res.data.users || res.data || [];

      // Filter out super-admins completely
      const filtered = rawUsers.filter(
        (u) =>
          u.role?.toLowerCase() !== "super-admin" &&
          u.role?.toLowerCase() !== "superadmin"
      );

      setUsers(filtered);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================================================
  // CREATE USER
  // =========================================================

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      await api.post("/users", createData);

      setShowCreateModal(false);

      setCreateData({
        name: "",
        email: "",
        password: "",
        role: "admin",
      });

      fetchUsers();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          "Error creating user"
      );
    }
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const handleOpenEditModal = (user) => {
    setSelectedUserId(user._id);

    setEditData({
      name: user.name,
      email: user.email,
      role: user.role || "admin",
    });

    setShowEditModal(true);
  };

  // =========================================================
  // EDIT USER
  // =========================================================

  const handleEditUser = async (e) => {
    e.preventDefault();

    try {
      await api.patch(`/users/${selectedUserId}`, editData);

      setShowEditModal(false);
      setSelectedUserId(null);

      fetchUsers();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to update user details"
      );
    }
  };

  // =========================================================
  // TOGGLE USER STATUS
  // =========================================================

  const handleToggleStatus = async (user) => {
    try {
      await api.patch(`/users/${user._id}`, {
        isActive: !user.isActive,
      });

      fetchUsers();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // =========================================================
  // RESET PASSWORD
  // =========================================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      await api.patch(`/users/${selectedUserId}/password`, {
        password: newPassword,
      });

      setShowPasswordModal(false);
      setNewPassword("");
      setSelectedUserId(null);

      alert("Password updated successfully");
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to update password"
      );
    }
  };

  // =========================================================
  // DELETE USER
  // =========================================================

  const handleDeleteUser = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this staff user?"
      )
    ) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);

      fetchUsers();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to delete user"
      );
    }
  };

  // =========================================================
  // CLOSE ALL MODALS
  // =========================================================

  const closeCreateModal = () => {
    setShowCreateModal(false);

    setCreateData({
      name: "",
      email: "",
      password: "",
      role: "admin",
    });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedUserId(null);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedUserId(null);
    setNewPassword("");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full space-y-6">
      {/* ===================================================== */}
      {/* PAGE HEADER                                           */}
      {/* ===================================================== */}

      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Title */}
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-navy-900 sm:text-2xl">
            Staff Accounts
          </h2>

          <p className="mt-1 text-sm leading-5 text-gray-500">
            Manage administrator and editor access credentials.
          </p>
        </div>

        {/* Add Staff Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 sm:w-auto"
        >
          <UserPlus size={17} />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* ===================================================== */}
      {/* LOADING                                               */}
      {/* ===================================================== */}

      {loading ? (
        <div className="space-y-3">
          {/* Desktop loading */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
            <div className="h-12 animate-pulse bg-gray-50" />

            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-6 border-t border-gray-100 px-6 py-5"
              >
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
                <div className="h-5 w-20 animate-pulse rounded bg-gray-100" />
                <div className="ml-auto h-6 w-24 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>

          {/* Mobile loading */}
          <div className="space-y-3 md:hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex justify-between gap-3">
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-100" />
                    <div className="h-3 w-44 rounded bg-gray-100" />
                  </div>

                  <div className="h-6 w-20 rounded-full bg-gray-100" />
                </div>

                <div className="mt-4 space-y-3">
                  <div className="h-3 w-24 rounded bg-gray-100" />
                  <div className="h-3 w-32 rounded bg-gray-100" />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="h-9 rounded bg-gray-100" />
                  <div className="h-9 rounded bg-gray-100" />
                  <div className="h-9 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* ================================================= */}
          {/* DESKTOP / TABLET TABLE                            */}
          {/* ================================================= */}

          <div className="hidden w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
            <div className="w-full overflow-x-auto">
              <table className="min-w-[800px] w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700">
                  <tr>
                    <th className="whitespace-nowrap px-6 py-3">
                      No
                    </th>
                    <th className="whitespace-nowrap px-6 py-3">
                      Name
                    </th>

                    <th className="whitespace-nowrap px-6 py-3">
                      Email
                    </th>

                    <th className="whitespace-nowrap px-6 py-3">
                      Role
                    </th>

                    <th className="whitespace-nowrap px-6 py-3">
                      Status
                    </th>

                    <th className="whitespace-nowrap px-6 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-sm text-gray-400"
                      >
                        No staff accounts found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u,index) => (
                      <tr
                        key={u._id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        {/* No */}
                        <td className="max-w-[220px] px-6 py-4">
                          <div className="truncate font-medium text-gray-900">
                            {index+1}
                          </div>
                        </td>
                        {/* Name */}
                        <td className="max-w-[220px] px-6 py-4">
                          <div className="truncate font-medium text-gray-900">
                            {u.name}
                          </div>
                        </td>

                        {/* Email */}
                        <td className="max-w-[280px] px-6 py-4">
                          <div className="truncate">
                            {u.email}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-700">
                            <Shield size={12} />
                            {u.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold transition ${
                              u.isActive
                                ? "text-green-600 hover:text-green-700"
                                : "text-red-500 hover:text-red-600"
                            }`}
                          >
                            {u.isActive ? (
                              <CheckCircle size={14} />
                            ) : (
                              <XCircle size={14} />
                            )}

                            {u.isActive ? "Active" : "Disabled"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-3">
                            {/* Edit */}
                            <button
                              onClick={() =>
                                handleOpenEditModal(u)
                              }
                              className="rounded-md p-1.5 text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                              title="Edit User"
                              aria-label="Edit User"
                            >
                              <Edit size={17} />
                            </button>

                            {/* Password */}
                            <button
                              onClick={() => {
                                setSelectedUserId(u._id);
                                setShowPasswordModal(true);
                              }}
                              className="rounded-md p-1.5 text-amber-600 transition hover:bg-amber-50 hover:text-amber-800"
                              title="Reset Password"
                              aria-label="Reset Password"
                            >
                              <KeyRound size={17} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() =>
                                handleDeleteUser(u._id)
                              }
                              className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                              title="Delete User"
                              aria-label="Delete User"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================================================= */}
          {/* MOBILE CARDS                                      */}
          {/* ================================================= */}

          <div className="space-y-3 md:hidden">
            {users.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400 shadow-sm">
                No staff accounts found.
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u._id}
                  className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-gray-900">
                        {u.name}
                      </h3>

                      <p className="mt-1 break-all text-xs text-gray-500">
                        {u.email}
                      </p>
                    </div>

                    {/* Role */}
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold capitalize text-blue-700">
                      <Shield size={11} />
                      {u.role}
                    </span>
                  </div>

                  {/* User Information */}
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                    {/* Email */}
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Email
                      </p>

                      <p className="mt-1 break-all text-xs text-gray-700">
                        {u.email}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Status
                      </p>

                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
                          u.isActive
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {u.isActive ? (
                          <CheckCircle size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}

                        {u.isActive ? "Active" : "Disabled"}
                      </button>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
                    {/* Edit */}
                    <button
                      onClick={() => handleOpenEditModal(u)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 px-2 py-2.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>

                    {/* Password */}
                    <button
                      onClick={() => {
                        setSelectedUserId(u._id);
                        setShowPasswordModal(true);
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 px-2 py-2.5 text-xs font-medium text-amber-600 transition hover:bg-amber-50"
                    >
                      <KeyRound size={14} />
                      <span>Password</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-2 py-2.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ===================================================== */}
      {/* CREATE USER MODAL                                     */}
      {/* ===================================================== */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4">
          <div className="my-auto max-h-[95vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Add Staff Account
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Create a new administrator or editor account.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateUser}
              className="space-y-4"
            >
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  required
                  value={createData.name}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      name: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full bg-navy-100 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  placeholder="Enter full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  required
                  value={createData.email}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      email: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full bg-navy-100 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  placeholder="example@email.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>

                <input
                  type="password"
                  required
                  minLength={8}
                  value={createData.password}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      password: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full bg-navy-100 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  placeholder="Minimum 8 characters"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Minimum 8 characters.
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>

                <select
                  value={createData.role}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      role: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700 sm:w-auto"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* EDIT USER MODAL                                       */}
      {/* ===================================================== */}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4">
          <div className="my-auto max-h-[95vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Edit Staff Account
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Update account information and permissions.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form
              onSubmit={handleEditUser}
              className="space-y-4"
            >
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  required
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      name: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full bg-navy-100 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  required
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      email: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-lg bg-navy-100 border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>

                <select
                  value={editData.role}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      role: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* PASSWORD RESET MODAL                                  */}
      {/* ===================================================== */}

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4">
          <div className="my-auto w-full max-w-sm rounded-xl bg-white p-5 shadow-xl sm:p-6">
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                  <KeyRound
                    size={19}
                    className="text-amber-600"
                  />
                </div>

                <h3 className="text-lg font-bold text-gray-900">
                  Reset User Password
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Enter a new password for this staff account.
                </p>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form
              onSubmit={handleResetPassword}
              className="space-y-4"
            >
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>

                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  className="mt-1.5 w-full rounded-lg bg-navy-100 border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Minimum 8 characters"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Minimum 8 characters.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 sm:w-auto"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}