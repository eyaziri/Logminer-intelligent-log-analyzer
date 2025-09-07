'use client';

import React, { useState, useEffect } from 'react';
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne, { User } from "@/components/tables/BasicTableOne";
import ErrorPage from '@/components/error/errorPage';

export default function UserManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    role: '',
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | undefined>(undefined);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const API_BASE = "http://localhost:8080/user";

  const fetchUsers = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Authentication token missing.");
      setErrorCode(401);
      setAlert({ type: 'error', message: "Authentication token missing." });
      return;
    }

    setLoading(true);
    setError(null);
    setErrorCode(undefined);

    try {
      const res = await fetch(`${API_BASE}/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        throw { code: 401, message: "You are not authorized. Please login again." };
      } else if (res.status === 403) {
        throw { code: 403, message: "Access forbidden. You do not have permission." };
      } else if (res.status === 404) {
        throw { code: 404, message: "Users not found." };
      } else if (res.status === 503) {
        throw { code: 503, message: "Service temporarily unavailable. Please try later." };
      } else if (res.status >= 500) {
        throw { code: 500, message: "Server error. Please try again later." };
      } else if (!res.ok) {
        throw { code: res.status, message: "Failed to fetch users." };
      }

     const data = await res.json();
    setUsers(data);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err
      ) {
        const errorMessage = (err as { message: string }).message;
        const errorCode = (err as { code?: number }).code;

        setError(errorMessage);
        setErrorCode(errorCode);
        setAlert({ type: "error", message: errorMessage });
      } else {
        setError("Error fetching users");
        setErrorCode(undefined);
        setAlert({ type: "error", message: "Error fetching users" });
      }
    } finally {
      setLoading(false);
    }
    };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [alert]);

  const toggleForm = () => {
    setShowForm((prev) => !prev);
    if (showForm) {
      setEditMode(false);
      setEditUserId(null);
      setFormData({ name: '', lastName: '', email: '', role: '' });
      setError(null);
      setErrorCode(undefined);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = editMode ? `${API_BASE}/update` : `${API_BASE}/create`;
    const method = editMode ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify({
          ...formData,
          idUser: editUserId,
        }),
      });

      if (res.ok) {
        setAlert({
          type: 'success',
          message: editMode ? "User updated successfully!" : "User added successfully!",
        });
        setFormData({ name: '', lastName: '', email: '', role: '' });
        setEditMode(false);
        setEditUserId(null);
        setShowForm(false);
        fetchUsers();
      } else {
        setAlert({ type: 'error', message: "Error while saving user." });
      }
    } catch (err) {
      console.error("Error:", err);
      setAlert({ type: 'error', message: "An unexpected error occurred." });
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`${API_BASE}/delete/${userToDelete.idUser}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setAlert({ type: 'success', message: "User deleted successfully!" });
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setAlert({ type: 'error', message: "Failed to delete user." });
    }
  };

  const cancelDelete = () => {
    setUserToDelete(null);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  };

  const handleEditUser = (user: User) => {
    setFormData({
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    setEditMode(true);
    setEditUserId(user.idUser);
    setShowForm(true);
    setError(null);
    setErrorCode(undefined);
  };

  const Alert = ({ type, message }: { type: 'success' | 'error'; message: string }) => {
    const styles =
      type === 'success'
        ? 'bg-green-100 text-green-800 border-green-300'
        : 'bg-red-100 text-red-800 border-red-300';

    return (
      <div className={`border ${styles} rounded-md px-4 py-3 text-sm mb-4`}>
        {message}
      </div>
    );
  };

  return (
    <div>
      <PageBreadcrumb
        items={[
          { title: "Home", path: "/" },
          { title: "User Management", path: "/usermanagement" },
        ]}
        pageTitle="User Management"
      />
      <div className="space-y-6">
        <ComponentCard
          title="User List"
          action={
            !error && (
              <button
                onClick={toggleForm}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                {showForm ? 'Back to List' : 'Add User'}
              </button>
            )
          }

        >
          {alert && <Alert type={alert.type} message={alert.message} />}

          {loading && <p>Loading users...</p>}

          {/* Si erreur, afficher ta page ErrorPage personnalisée */}
          {error ? (
            <ErrorPage code={errorCode} message={error} />
          ) : (
            !showForm ? (
              <>
                {userToDelete && (
                  <div className="bg-white border border-gray-300 rounded-md p-4 mt-4 shadow-md max-w-md mx-auto text-center">
                    <p className="text-gray-700 mb-4">
                      Are you sure you want to delete <strong>{userToDelete.name} {userToDelete.lastName}</strong>?
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={confirmDeleteUser}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <BasicTableOne
                  users={users}
                  onDelete={handleDeleteClick}
                  onEdit={handleEditUser}
                />
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-4 py-2"
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-4 py-2"
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    className="w-full rounded-md border border-gray-300 px-4 py-2"
                    placeholder="info@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-4 py-2"
                    required
                  >
                    <option value="">Select role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="ANALYST">Analyst</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                >
                  {editMode ? "Update User" : "Save User"}
                </button>
              </form>
            )
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
