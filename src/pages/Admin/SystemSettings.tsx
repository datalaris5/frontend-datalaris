/**
 * System Settings
 * ---------------
 * Halaman pengaturan sistem untuk admin.
 *
 * Sections:
 * - General Settings: Site Name, URL, Admin Email
 * - Notifications: Email & Push notifications toggle
 * - Advanced: Maintenance Mode toggle
 */

import React, { useState, ChangeEvent } from "react";
import { Save, Bell, Globe, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Tipe untuk settings state
interface SystemSettingsState {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  maintenanceMode: boolean;
}

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettingsState>({
    siteName: "Datalaris",
    siteUrl: "https://datalaris.com",
    adminEmail: "admin@datalaris.com",
    emailNotifications: true,
    pushNotifications: false,
    maintenanceMode: false,
  });

  /**
   * Handler untuk save settings (placeholder)
   */
  const handleSave = (): void => {
    toast.success("Settings saved successfully");
  };

  /**
   * Handler untuk update field settings
   */
  const handleChange = (
    field: keyof SystemSettingsState,
    value: string | boolean
  ): void => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure application settings and preferences
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save size={20} className="mr-2" /> Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Globe size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              General Settings
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Site Name
              </label>
              <Input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Site URL
              </label>
              <Input
                type="url"
                value={settings.siteUrl}
                onChange={(e) => handleChange("siteUrl", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Admin Email
              </label>
              <Input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleChange("adminEmail", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Bell
                size={20}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
            <h2 className="text-lg font-bold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-4">
            <ToggleSetting
              label="Email Notifications"
              description="Receive email alerts for important events"
              checked={settings.emailNotifications}
              onChange={(e) =>
                handleChange("emailNotifications", e.target.checked)
              }
            />
            <ToggleSetting
              label="Push Notifications"
              description="Receive browser push notifications"
              checked={settings.pushNotifications}
              onChange={(e) =>
                handleChange("pushNotifications", e.target.checked)
              }
            />
          </div>
        </div>

        {/* Advanced */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Shield size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Advanced</h2>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <div>
              <div className="font-medium text-foreground">
                Maintenance Mode
              </div>
              <div className="text-sm text-muted-foreground">
                Put the site in maintenance mode for all users
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  handleChange("maintenanceMode", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ToggleSetting Component
 * Toggle switch dengan label dan description
 */
interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({
  label,
  description,
  checked,
  onChange,
}) => (
  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
    <div>
      <div className="font-medium text-foreground">{label}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
    </label>
  </div>
);

export default SystemSettings;
