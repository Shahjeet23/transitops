"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { User, Shield, Key, Bell, Users as UsersIcon, Check, AlertCircle } from "lucide-react";
import { useUpdateProfile, useChangePassword } from "@/hooks/use-auth";
import { useUsers, useUpdateUserRole, useToggleUserStatus } from "@/hooks/use-users";
import { format } from "date-fns";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "admin">("profile");

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Settings Menu */}
        <div className="space-y-1">
          <TabButton 
            active={activeTab === "profile"} 
            onClick={() => setActiveTab("profile")} 
            icon={<User className="w-4 h-4" />} 
            label="Profile" 
          />
          <TabButton 
            active={activeTab === "security"} 
            onClick={() => setActiveTab("security")} 
            icon={<Key className="w-4 h-4" />} 
            label="Security" 
          />
          <TabButton 
            active={activeTab === "notifications"} 
            onClick={() => setActiveTab("notifications")} 
            icon={<Bell className="w-4 h-4" />} 
            label="Notifications" 
          />
          {user?.role === 'admin' && (
            <TabButton 
              active={activeTab === "admin"} 
              onClick={() => setActiveTab("admin")} 
              icon={<UsersIcon className="w-4 h-4" />} 
              label="Admin Management" 
            />
          )}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "admin" && user?.role === 'admin' && <AdminTab />}
        </div>

      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm text-left transition-colors ${
        active 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ProfileTab() {
  const user = useAuthStore((s) => s.user);
  const { mutate: updateProfile, isPending, error, isSuccess } = useUpdateProfile();
  const [name, setName] = useState(user?.name || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update your account's profile information and email address.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="p-5 space-y-4">
          {isSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4" /> Profile updated successfully.
            </div>
          )}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error.message || "Failed to update profile"}
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "??"}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input
                type="email"
                defaultValue={user?.email || ""}
                disabled
                className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground opacity-70 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Role</label>
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-accent/50 w-full">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm capitalize font-medium text-foreground">
                  {user?.role?.replace(/_/g, " ") || "User"}
                </span>
              </div>
            </div>
          </div>

        </div>
        <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
          <button 
            type="submit" 
            disabled={isPending || name === user?.name || !name.trim()}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SecurityTab() {
  const { mutate: changePassword, isPending, error, isSuccess } = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    if (newPassword !== confirmPassword) {
      setValidationError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setValidationError("Password must be at least 8 characters long.");
      return;
    }
    changePassword(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
      }
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <h2 className="text-lg font-semibold text-foreground">Update Password</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="p-5 space-y-4 max-w-md">
          {isSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4" /> Password changed successfully. Please login again.
            </div>
          )}
          {(error || validationError) && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {validationError || (error as any).message || "Failed to change password"}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isPending}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isPending}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isPending}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
            />
          </div>
        </div>
        <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
          <button 
            type="submit" 
            disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {isPending ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Decide how and when you would like to be notified of fleet events.
        </p>
      </div>
      
      <div className="p-5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">Receive daily summaries and critical alerts via email.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Push Notifications</h3>
            <p className="text-sm text-muted-foreground">Receive real-time alerts in your browser.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

const ROLES = ['admin', 'fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'];

function AdminTab() {
  const { data, isLoading } = useUsers();
  const { mutate: toggleStatus, isPending: toggling } = useToggleUserStatus();
  const { mutate: updateRole, isPending: updatingRole } = useUpdateUserRole();
  const currentUser = useAuthStore(s => s.user);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading users...</div>;
  }

  const users = data?.users || [];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-border/50">
        <h2 className="text-lg font-semibold text-foreground">User Management</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage system access, roles, and privileges for all personnel.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/30 border-b border-border/50">
            <tr>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Last Login</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {users.map((u: any) => (
              <tr key={u._id} className="hover:bg-muted/10 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-medium text-foreground">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-5 py-4">
                  <select 
                    value={u.role}
                    disabled={updatingRole || (u._id === currentUser?.id && u.role === 'admin')}
                    onChange={(e) => updateRole({ userId: u._id, role: e.target.value })}
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary capitalize disabled:opacity-50"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    u.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                  }`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted-foreground text-xs">
                  {u.lastLogin ? format(new Date(u.lastLogin), "MMM d, yyyy") : "Never"}
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => toggleStatus(u._id)}
                    disabled={toggling || u._id === currentUser?.id}
                    className="text-xs font-medium hover:underline disabled:opacity-50 transition-colors text-primary"
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
