'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const conditions = ['new', 'like new', 'good', 'fair', 'used'];
const categories = ['books', 'electronics', 'furniture', 'clothing', 'misc'];

const inputCls = 'field-control';
const labelCls = 'text-sm font-bold text-slate-700 dark:text-slate-200';

export default function ListingForm() {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [condition, setCondition] = useState(conditions[0]);
  const [images, setImages] = useState<string[]>([]);
  const [campus, setCampus] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'uploading'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if ((session?.user as any)?.college) setCampus((session!.user as any).college);
  }, [session]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (!files) return;
    for (const file of Array.from(files).slice(0, 5 - images.length)) {
      setStatus('uploading');
      setUploadProgress(0);
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (res.ok) {
          const data = await res.json();
          setImages((prev) => [...prev, data.url]);
          setUploadProgress(100);
          setTimeout(() => setStatus('idle'), 500);
        } else {
          const err = await res.json();
          alert(`Upload failed: ${err.error}`);
          setStatus('idle');
        }
      } catch {
        alert('Upload error. Please try again.');
        setStatus('idle');
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (images.length === 0) { alert('Please upload at least one image.'); return; }
    setStatus('saving');
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, price: Number(price), category, condition, images, campus, tags: [] })
      });
      if (res.ok) {
        alert('Listing created! Awaiting admin approval.');
        window.location.href = '/listings';
      } else {
        const err = await res.json();
        alert(`Error: ${typeof err.error === 'string' ? err.error : JSON.stringify(err.error)}`);
      }
    } catch {
      alert('Error creating listing. Please try again.');
    }
    setStatus('idle');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Product title" required />
        </label>
        <label className="block">
        <span className={labelCls}>Price (Rs)</span>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="1" step="0.01" className={inputCls} placeholder="0" required />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>Condition</span>
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputCls}>
            {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <label className="block">
        <span className={labelCls}>Campus</span>
        <input value={campus} readOnly className="field-control cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-white/[0.03] dark:text-slate-400" />
      </label>

      <label className="block">
        <span className={labelCls}>Description (min 20 characters)</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className={inputCls} placeholder="Describe the item, condition, and pickup details." required />
      </label>

      <div className="space-y-3">
        <label className="block">
          <span className={labelCls}>Images ({images.length}/5)</span>
          <div className="mt-2 flex flex-col gap-3 rounded-lg border border-dashed border-teal-300 bg-teal-50/50 px-6 py-8 sm:flex-row sm:items-center dark:border-teal-300/30 dark:bg-teal-300/10">
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={status === 'uploading' || images.length >= 5} className="block text-sm text-slate-600 dark:text-slate-300" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Max 5 images, 5MB each</span>
          </div>
        </label>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="rounded-lg border border-slate-200 bg-slate-100 p-3 dark:border-white/10 dark:bg-white/5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full bg-teal-600 transition-all dark:bg-teal-300" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Uploading... {uploadProgress}%</p>
          </div>
        )}

        {images.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {images.map((img, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
                <img src={img} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition group-hover:bg-opacity-50">
                  <span className="text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">Remove</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" disabled={status !== 'idle'} className="btn-primary">
        {status === 'saving' ? 'Publishing...' : status === 'uploading' ? 'Uploading...' : 'Publish listing'}
      </button>
    </form>
  );
}
