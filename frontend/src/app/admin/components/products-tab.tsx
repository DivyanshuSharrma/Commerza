'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Types ─────────────────────────────────────────── */
interface MediaItem {
  id?: string;
  url: string;
  isPrimary: boolean;
  position: number;
  /** Local preview only – not yet uploaded */
  previewUrl?: string;
  uploading?: boolean;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  features?: string;
  specifications?: string;
  whatsIncluded?: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  deliveryType: 'INTERNAL_FILE' | 'EXTERNAL_URL';
  deliveryConfig: any;
  seoTitle?: string;
  seoDescription?: string;
  media?: MediaItem[];
}

interface ProductsTabProps {
  products: Product[];
  onCreate: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => void;
}

/* ─── Helpers ────────────────────────────────────────── */
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

const EMPTY_FORM = {
  title: '',
  description: '',
  shortDescription: '',
  price: '' as number | string,
  salePrice: '' as number | string,
  features: '',
  specifications: '',
  whatsIncluded: '',
  deliveryType: 'INTERNAL_FILE' as 'INTERNAL_FILE' | 'EXTERNAL_URL',
  filePath: '',
  url: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
};

/* ─── Sub-component: FileUploadButton ───────────────── */
function FileUploadButton({
  label,
  accept,
  onUploaded,
  uploading,
}: {
  label: string;
  accept: string;
  onUploaded: (result: { filePath: string; originalName: string; fileSize: number; mimeType: string }) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setProgress(0);

    const token = localStorage.getItem('commerza_admin_token');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();
      const isPublic = accept.includes('image/');
      xhr.open('POST', `${API_BASE}/uploads/${isPublic ? 'public' : 'private'}`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
      };

      xhr.onload = () => {
        setProgress(null);
        if (xhr.status >= 200 && xhr.status < 300) {
          const body = JSON.parse(xhr.responseText);
          const data = body.data ?? body;
          onUploaded(data);
        } else {
          setError('Upload failed. Please try again.');
        }
      };

      xhr.onerror = () => {
        setProgress(null);
        setError('Network error during upload.');
      };

      xhr.send(formData);
    } catch {
      setProgress(null);
      setError('Upload failed.');
    }
  };

  return (
    <div>
      <button
        type="button"
        disabled={uploading || progress !== null}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {progress !== null ? `${progress}%` : label}
      </button>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

/* ─── Sub-component: GalleryUploader ────────────────── */
function GalleryUploader({
  items,
  onChange,
}: {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const handleImageUploaded = useCallback(
    (result: { filePath: string }) => {
      const url = `${API_BASE.replace('/v1', '')}/storage/local/${result.filePath}`;
      const newItem: MediaItem = {
        url: result.filePath,          // stored path
        previewUrl: url,               // display URL
        isPrimary: items.length === 0, // first image is primary
        position: items.length,
      };
      onChange([...items, newItem]);
    },
    [items, onChange]
  );

  const setPrimary = (idx: number) => {
    onChange(items.map((m, i) => ({ ...m, isPrimary: i === idx })));
  };

  const remove = (idx: number) => {
    const next = items.filter((_, i) => i !== idx).map((m, i) => ({ ...m, position: i }));
    // If removed item was primary, make first one primary
    if (items[idx].isPrimary && next.length > 0) next[0].isPrimary = true;
    onChange(next);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setOverIdx(idx); };
  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...items];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    onChange(next.map((m, i) => ({ ...m, position: i })));
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-foreground/70">
          Product Images &amp; Gallery
          <span className="text-foreground/40 font-normal ml-1">(drag to reorder · first = thumbnail)</span>
        </label>
        <FileUploadButton
          label="Add Image"
          accept="image/*"
          onUploaded={handleImageUploaded}
          uploading={false}
        />
      </div>

      {items.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center text-xs text-foreground/40">
          No images added yet. Upload the product thumbnail first.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
              className={`relative group w-24 h-24 rounded-xl overflow-hidden border-2 transition-all cursor-grab ${
                item.isPrimary ? 'border-primary shadow-md shadow-primary/20' : 'border-border'
              } ${overIdx === idx ? 'scale-105 opacity-70' : ''}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl || item.url}
                alt={`gallery-${idx}`}
                className="w-full h-full object-cover"
              />
              {item.isPrimary && (
                <span className="absolute top-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  COVER
                </span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                {!item.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className="text-[10px] text-white bg-primary/80 px-2 py-0.5 rounded cursor-pointer"
                  >
                    Set Cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-[10px] text-white bg-red-500/80 px-2 py-0.5 rounded cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────── */
export function ProductsTab({ products, onCreate, onUpdate, onDelete }: ProductsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [digitalFile, setDigitalFile] = useState<{ filePath: string; originalName: string; fileSize: number; mimeType: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  /* ── Dirty-check ── */
  useEffect(() => {
    const empty = !form.title && !form.description;
    setIsDirty(!empty);
  }, [form]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  /* ── Reset form ── */
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setGallery([]);
    setDigitalFile(null);
    setEditingId(null);
    setIsDirty(false);
  };

  /* ── Edit populate ── */
  const handleEditClick = (p: Product) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      shortDescription: p.shortDescription || '',
      price: Number(p.price),
      salePrice: p.salePrice !== undefined && p.salePrice !== null ? Number(p.salePrice) : '',
      features: p.features || '',
      specifications: p.specifications || '',
      whatsIncluded: p.whatsIncluded || '',
      deliveryType: p.deliveryType,
      filePath: p.deliveryConfig?.filePath || '',
      url: p.deliveryConfig?.url || '',
      seoTitle: p.seoTitle || '',
      seoDescription: p.seoDescription || '',
      seoKeywords: p.seoDescription || '',
    });
    setGallery(
      (p.media || []).map((m, i) => ({
        ...m,
        position: i,
        previewUrl: m.url.startsWith('http') ? m.url : `${API_BASE.replace('/v1', '')}/storage/local/${m.url}`,
      }))
    );
    setDigitalFile(null);
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const filePath =
        digitalFile?.filePath ||
        (form.deliveryType === 'INTERNAL_FILE' ? form.filePath : undefined);

      const deliveryConfig =
        form.deliveryType === 'INTERNAL_FILE'
          ? { filePath, originalName: digitalFile?.originalName, fileSize: digitalFile?.fileSize, mimeType: digitalFile?.mimeType }
          : { url: form.url };

      const payload: any = {
        title: form.title,
        description: form.description,
        shortDescription: form.shortDescription || undefined,
        price: Number(form.price),
        salePrice: form.salePrice !== '' ? Number(form.salePrice) : undefined,
        features: form.features || undefined,
        specifications: form.specifications || undefined,
        whatsIncluded: form.whatsIncluded || undefined,
        deliveryType: form.deliveryType,
        deliveryConfig,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        seoKeywords: form.seoKeywords || undefined,
        media: gallery.map((m, i) => ({ url: m.url, isPrimary: m.isPrimary, position: i })),
      };

      if (editingId) {
        await onUpdate(editingId, payload);
      } else {
        await onCreate(payload);
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  /* ── Copy URL ── */
  const copyProductUrl = (slug: string) => {
    const url = `${window.location.origin}/products/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    });
  };

  const openProductUrl = (slug: string) => {
    window.open(`/products/${slug}`, '_blank');
  };

  const toggleStatus = async (p: Product) => {
    const next = p.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    await onUpdate(p.id, { status: next });
  };

  /* ── Input helper ── */
  const inp = (
    field: keyof typeof EMPTY_FORM,
    props: React.InputHTMLAttributes<HTMLInputElement> & { as?: 'input' } = {}
  ) => ({
    value: form[field] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [field]: e.target.value }),
    className:
      'w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm',
    ...props,
  });

  const textarea = (field: keyof typeof EMPTY_FORM, rows = 3) => ({
    value: form[field] as string,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setForm({ ...form, [field]: e.target.value }),
    rows,
    className:
      'w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-y',
  });

  return (
    <div className="space-y-8">
      {/* ── Product Form ─────────────────────────────────────────── */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">
            {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
          </h2>
          {isDirty && (
            <span className="text-[10px] font-semibold text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded">
              ⚠️ Unsaved Changes
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Section: Basic Info ── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-bold text-foreground/50 uppercase tracking-widest pb-1 border-b border-border w-full">
              Basic Information
            </legend>

            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">Product Title *</label>
              <input type="text" required placeholder="e.g. Complete Next.js Course" {...inp('title')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="999.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1">
                  Sale Price (₹)
                  <span className="text-foreground/40 font-normal ml-1">optional</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="799.00"
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">Short Description</label>
              <textarea placeholder="1-2 sentences shown in product card previews..." {...textarea('shortDescription', 2)} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">Full Description *</label>
              <textarea required placeholder="Detailed product description shown on the product page..." {...textarea('description', 5)} />
            </div>
          </fieldset>

          {/* ── Section: Gallery ── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-bold text-foreground/50 uppercase tracking-widest pb-1 border-b border-border w-full">
              Product Images
            </legend>
            <GalleryUploader items={gallery} onChange={setGallery} />
          </fieldset>

          {/* ── Section: Features & Specs ── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-bold text-foreground/50 uppercase tracking-widest pb-1 border-b border-border w-full">
              Features &amp; Specifications
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1">
                  Key Features
                  <span className="text-foreground/40 font-normal ml-1">(one per line)</span>
                </label>
                <textarea placeholder={"Lifetime access\n100+ exercises\nCertificate included"} {...textarea('features', 5)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1">
                  Specifications
                  <span className="text-foreground/40 font-normal ml-1">(one per line)</span>
                </label>
                <textarea placeholder={"Format: PDF\nPages: 250\nLanguage: English"} {...textarea('specifications', 5)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                What&apos;s Included
                <span className="text-foreground/40 font-normal ml-1">(one per line)</span>
              </label>
              <textarea placeholder={"Main e-book PDF\nBonus cheatsheet\nExercise files ZIP"} {...textarea('whatsIncluded', 4)} />
            </div>
          </fieldset>

          {/* ── Section: Digital Delivery ── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-bold text-foreground/50 uppercase tracking-widest pb-1 border-b border-border w-full">
              Digital Delivery
            </legend>

            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">Delivery Method</label>
              <select
                value={form.deliveryType}
                onChange={(e) => setForm({ ...form, deliveryType: e.target.value as any })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm cursor-pointer"
              >
                <option value="INTERNAL_FILE">📁 Internal File Storage (Upload File)</option>
                <option value="EXTERNAL_URL">🔗 External Redirect URL</option>
              </select>
            </div>

            {form.deliveryType === 'INTERNAL_FILE' ? (
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-foreground/70 mb-1">
                      Upload Digital Product File
                    </label>
                    <FileUploadButton
                      label="Upload File (PDF, ZIP, MP4, MP3…)"
                      accept=".pdf,.zip,.rar,.mp4,.mp3,.docx,.pptx,.epub,.png,.jpg"
                      onUploaded={(result) => {
                        setDigitalFile(result);
                        setForm({ ...form, filePath: result.filePath });
                      }}
                      uploading={saving}
                    />
                  </div>
                </div>

                {digitalFile && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-600 px-3 py-2 rounded-lg text-xs">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span className="font-bold">{digitalFile.originalName}</span>
                      <span className="text-green-600/60 ml-2">({(digitalFile.fileSize / 1024).toFixed(1)} KB · {digitalFile.mimeType})</span>
                    </div>
                  </div>
                )}

                {!digitalFile && form.filePath && (
                  <div className="text-xs text-foreground/50 bg-foreground/5 px-3 py-2 rounded-lg">
                    Current file: <code className="text-primary">{form.filePath}</code>
                    <span className="ml-2 text-foreground/40">(Upload a new file to replace)</span>
                  </div>
                )}

                {!digitalFile && !form.filePath && (
                  <p className="text-xs text-amber-600 bg-amber-500/10 px-3 py-2 rounded-lg">
                    ⚠️ No file uploaded yet. Product cannot be delivered without a file.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1">External Redirect URL</label>
                <input type="url" placeholder="https://drive.google.com/your-file" {...inp('url')} />
              </div>
            )}
          </fieldset>

          {/* ── Section: SEO ── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-bold text-foreground/50 uppercase tracking-widest pb-1 border-b border-border w-full">
              SEO (Optional)
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1">SEO Title</label>
                <input type="text" placeholder="Product title for search engines..." {...inp('seoTitle')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1">SEO Keywords</label>
                <input type="text" placeholder="ebook, pdf, course, design..." {...inp('seoKeywords')} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">SEO Description</label>
              <textarea placeholder="Search engine snippet (140-160 chars)..." {...textarea('seoDescription', 2)} />
            </div>
          </fieldset>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-lg transition-opacity cursor-pointer text-sm"
            >
              {saving ? 'Saving…' : editingId ? '✅ Save Changes' : '🚀 Create Product'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-border hover:bg-foreground/5 text-foreground font-bold py-2.5 px-5 rounded-lg transition-colors cursor-pointer text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Digital Catalog Table ─────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">Digital Catalog</h3>
          <span className="text-xs text-foreground/50">{products.length} product{products.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 text-xs font-semibold text-foreground/75 border-b border-border">
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm text-foreground/75">
              {products.map((p) => {
                const thumb = p.media?.find((m) => m.isPrimary) ?? p.media?.[0];
                const thumbUrl = thumb
                  ? thumb.url.startsWith('http')
                    ? thumb.url
                    : `${API_BASE.replace('/v1', '')}/storage/local/${thumb.url}`
                  : null;

                return (
                  <tr key={p.id} className="hover:bg-foreground/5 transition-colors">
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      {thumbUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumbUrl} alt={p.title} className="w-10 h-10 object-cover rounded-lg border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3 min-w-[180px]">
                      <div className="font-semibold text-foreground">{p.title}</div>
                      <div className="text-xs text-foreground/40 font-mono">{p.slug}</div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.salePrice ? (
                        <div>
                          <span className="font-bold text-foreground">₹{Number(p.salePrice).toFixed(2)}</span>
                          <span className="text-xs text-foreground/40 line-through ml-1">₹{Number(p.price).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-foreground">₹{Number(p.price).toFixed(2)}</span>
                      )}
                    </td>

                    {/* Delivery */}
                    <td className="px-4 py-3">
                      <span className="bg-foreground/5 px-2 py-0.5 rounded text-foreground/70 font-mono text-xs">
                        {p.deliveryType === 'INTERNAL_FILE' ? '📁 File' : '🔗 URL'}
                      </span>
                    </td>

                    {/* Status toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(p)}
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                          p.status === 'ACTIVE'
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>

                    {/* URL copy + open */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyProductUrl(p.slug)}
                          title="Copy URL"
                          className="text-xs bg-foreground/5 hover:bg-foreground/10 text-foreground/60 px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          {copiedSlug === p.slug ? '✅' : '📋'}
                        </button>
                        <button
                          onClick={() => openProductUrl(p.slug)}
                          title="Open in new tab"
                          className="text-xs bg-foreground/5 hover:bg-foreground/10 text-foreground/60 px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          🔗
                        </button>
                      </div>
                    </td>

                    {/* Edit / Delete */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 rounded transition-colors font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
                          className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 px-2.5 py-1 rounded transition-colors font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-foreground/40">
                    No products in catalog yet. Add your first digital product above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
