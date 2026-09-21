import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Moon, Sun, LogOut, Check } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [isSaving, setIsSaving] = useState(false);

  // Dark mode toggle simulation
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await userService.updateProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
        department: department.trim(),
        location: location.trim(),
        website: website.trim()
      });
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
        showToast('Settings saved successfully', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-5 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Account Settings
        </h2>
        <p className="text-xs text-slate-400">
          Manage your personal information, department affiliation, and preferences
        </p>
      </div>

      {/* Edit Profile Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-slate-100 font-bold text-sm">
          <User className="w-4 h-4 text-indigo-600" />
          <span>Profile Details</span>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Department / Faculty"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <Input
              label="Campus Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Academic Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm p-3 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <Input
            label="Website or Portfolio"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="sm"
              variant="primary"
              isLoading={isSaving}
              icon={Check}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Preferences & Theme Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Interface Appearance
              </h4>
              <p className="text-xs text-slate-400">
                {darkMode ? 'Dark campus dashboard' : 'Clean light dashboard'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
          >
            {darkMode ? 'Switch to Light' : 'Switch to Dark'}
          </Button>
        </div>
      </div>

      {/* Security & Logout Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>Account & Security</span>
        </div>

        <div className="text-xs text-slate-500 space-y-1">
          <p>
            Username: <span className="font-semibold text-slate-800 dark:text-slate-200">@{user?.username}</span>
          </p>
          <p>
            Email: <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>
          </p>
          <p>
            Account Role: <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">{user?.role}</span>
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400">End your current session</span>
          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            icon={LogOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
