/**
 * Admin User Management
 * ---------------------
 * Halaman manajemen user untuk admin.
 *
 * Fitur:
 * - Daftar user dengan role dan status
 * - Search user by name/email
 * - Create, Edit, Delete user (placeholder)
 *
 * Catatan: Menggunakan data dummy
 */

import React, { useState, ChangeEvent } from "react";
import { Plus, Search, Edit, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import FeatureNotReady from "@/components/common/FeatureNotReady";

// Tipe untuk user data
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  stores: number;
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - will replace with real API
  const users: UserData[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "Active",
      stores: 3,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Manager",
      status: "Active",
      stores: 2,
    },
    {
      id: 3,
      name: "Bob Wilson",
      email: "bob@example.com",
      role: "User",
      status: "Active",
      stores: 1,
    },
  ];

  /**
   * Handler untuk create user (placeholder)
   */
  const handleCreateUser = (): void => {
    toast.success("User creation coming soon");
  };

  /**
   * Handler untuk search input
   */
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <button
          onClick={handleCreateUser}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium"
        >
          <Plus size={20} /> Create User
        </button>
      </div>

      <FeatureNotReady
        message="Manajemen User (Admin) Menggunakan Data Dummy"
        overlay={true}
      >
        {/* Search */}
        <div className="glass-card p-4 rounded-2xl mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Stores
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">
                          {user.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="gap-1">
                        <Shield size={12} /> {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-foreground">{user.stores}</td>
                    <td className="px-6 py-4">
                      <Badge variant="default" className="bg-green-500">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit size={16} className="text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FeatureNotReady>
    </div>
  );
};

export default UserManagement;
