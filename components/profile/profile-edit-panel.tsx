'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface EditableUser {
  name: string;
  email: string;
  image?: string;
  bio?: string;
  phone?: string;
  location?: string;
  availability?: string;
  preferredContact?: 'messages' | 'email' | 'phone';
  college: string;
  domain: string;
}

function getInitials(name?: string | null) {
  return (name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';
}

export default function ProfileEditPanel({ user }: { user: EditableUser }) {
  const router = useRouter();
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(user.image || '');
  const [form, setForm] = useState({
    bio: user.bio || '',
    phone: user.phone || '',
    location: user.location || '',
    availability: user.availability || '',
    preferredContact: user.preferredContact || 'messages',
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess('');
  };

  const handleFileChange = (file?: File) => {
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setSuccess('');
  };

  const saveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let image = user.image || '';

      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append('file', selectedFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadForm });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Profile picture upload failed');
        image = uploadData.url;
      } else {
        image = preview;
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to save profile');

      setSelectedFile(null);
      setPreview(data.user.image || '');
      setSuccess('Profile saved');
      await update();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="surface-panel rounded-[1.5rem] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Profile editor</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Manage your public details</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Identity fields are locked to protect verified campus accounts.</p>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="btn-primary px-4 py-2.5">
          {open ? 'Close Editor' : 'Edit Profile'}
        </button>
      </div>

      {open && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex flex-col items-center text-center">
              {preview ? (
                <Image src={preview} alt={user.name} width={128} height={128} className="h-32 w-32 rounded-lg object-cover shadow-sm" />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-slate-950 text-4xl font-black text-white shadow-sm dark:bg-teal-300 dark:text-slate-950">
                  {getInitials(user.name)}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => handleFileChange(event.target.files?.[0])}
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary mt-4 w-full px-4 py-2.5">
                Upload Picture
              </button>
              {preview && (
                <button type="button" onClick={() => { setPreview(''); setSelectedFile(null); }} className="mt-2 text-sm font-bold text-rose-600 hover:text-rose-700 dark:text-rose-300">
                  Remove picture
                </button>
              )}
              <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">JPEG, PNG, or WebP. Max 5MB.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['Name', user.name],
                ['Email', user.email],
                ['College', user.college],
                ['College domain', user.domain],
              ].map(([label, value]) => (
                <label key={label} className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</span>
                  <input value={value} disabled className="field-control disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-white/[0.03]" />
                </label>
              ))}
            </div>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Bio</span>
              <textarea
                value={form.bio}
                onChange={(event) => updateField('bio', event.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Add a short intro about what you sell, buy, or study."
                className="field-control resize-none"
              />
              <span className="mt-1 block text-right text-xs font-semibold text-slate-400">{form.bio.length}/500</span>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Phone</span>
                <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} maxLength={32} placeholder="+91 98765 43210" className="field-control" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Location</span>
                <input value={form.location} onChange={(event) => updateField('location', event.target.value)} maxLength={120} placeholder="Hostel block, department, or campus area" className="field-control" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Availability</span>
                <input value={form.availability} onChange={(event) => updateField('availability', event.target.value)} maxLength={160} placeholder="Weekdays after 5 PM" className="field-control" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Preferred contact</span>
                <select value={form.preferredContact} onChange={(event) => updateField('preferredContact', event.target.value)} className="field-control">
                  <option value="messages">CampusMart messages</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </label>
            </div>

            {(error || success) && (
              <div className={`rounded-lg border px-4 py-3 text-sm font-semibold ${error ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-200' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-200'}`}>
                {error || success}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary px-5 py-2.5">Cancel</button>
              <button type="button" onClick={saveProfile} disabled={saving} className="btn-primary px-5 py-2.5 disabled:translate-y-0">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
