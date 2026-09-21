import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

export const EditProfileModal = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const { updateUser } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [coverImage, setCoverImage] = useState(user?.coverImage || '');

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.profileImage || '');
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/i)) {
      showToast('Please select a valid image (JPEG, PNG, WEBP, GIF)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size cannot exceed 5MB', 'error');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let updatedUserData = null;

      // 1. Upload avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const avatarRes = await userService.uploadAvatar(formData);
        if (avatarRes.success && avatarRes.data?.user) {
          updatedUserData = avatarRes.data.user;
        }
      }

      // 2. Update profile text fields
      const profileData = {
        fullName: fullName.trim(),
        bio: bio.trim(),
        location: location.trim(),
        department: department.trim(),
        website: website.trim(),
        coverImage: coverImage.trim()
      };

      const res = await userService.updateProfile(profileData);
      if (res.success && res.data?.user) {
        updatedUserData = res.data.user;
      }

      if (updatedUserData) {
        updateUser(updatedUserData);
        if (onProfileUpdated) {
          onProfileUpdated(updatedUserData);
        }
        showToast('Profile updated successfully!', 'success');
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Upload Preview */}
        <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <Avatar
            src={avatarPreview}
            name={fullName || user?.fullName}
            size="xl"
            className="ring-2 ring-indigo-500/30"
          />

          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Profile Photo
            </p>
            <p className="text-[11px] text-slate-400">
              PNG, JPG, or WEBP up to 5MB
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarSelect}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              id="avatar-file-input"
            />
            <label
              htmlFor="avatar-file-input"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 cursor-pointer shadow-2xs transition"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-500" />
              <span>Change Photo</span>
            </label>
          </div>
        </div>

        {/* Text Fields */}
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Department / Major"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Computer Science"
          />

          <Input
            label="Campus Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Science Library Lab 2"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Academic Bio
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 300))}
            placeholder="Introduce yourself, projects you are building, or research interests..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm p-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500 resize-none"
          />
          <p className="text-right text-[11px] text-slate-400 mt-1">
            {bio.length}/300
          </p>
        </div>

        <Input
          label="Portfolio / Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://yourportfolio.dev"
        />

        <Input
          label="Cover Banner Image URL"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://images.unsplash.com/..."
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
