'use client';

import { useState, useEffect, useRef } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

export interface MediaItem {
  id?: string;
  url: string;
  isPrimary: boolean;
  position: number;
  previewUrl?: string;
  uploading?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductFormValues {
  id?: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number | string;
  salePrice?: number | string;
  features?: string;
  specifications?: string;
  whatsIncluded?: string;
  deliveryType: 'INTERNAL_FILE' | 'EXTERNAL_URL';
  filePath?: string;
  url?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  categoryIds?: string[];
  media?: MediaItem[];
}

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  editingProduct: any | null;
  brandId: string;
  categories?: Category[];
}

export function ProductEditorModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  brandId,
  categories = [],
}: ProductEditorModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductFormValues>({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    salePrice: '',
    features: '',
    specifications: '',
    whatsIncluded: '',
    deliveryType: 'INTERNAL_FILE',
    filePath: '',
    url: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    categoryIds: [],
  });

  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        id: editingProduct.id,
        title: editingProduct.title || '',
        description: editingProduct.description || '',
        shortDescription: editingProduct.shortDescription || '',
        price: editingProduct.price || '',
        salePrice: editingProduct.salePrice || '',
        features: editingProduct.features || '',
        specifications: editingProduct.specifications || '',
        whatsIncluded: editingProduct.whatsIncluded || '',
        deliveryType: editingProduct.deliveryType || 'INTERNAL_FILE',
        filePath: editingProduct.deliveryConfig?.filePath || '',
        url: editingProduct.deliveryConfig?.url || '',
        seoTitle: editingProduct.seoTitle || '',
        seoDescription: editingProduct.seoDescription || '',
        seoKeywords: editingProduct.seoKeywords || '',
      });
      setSelectedCategoryIds((editingProduct.categories || []).map((c: any) => c.id));
      setGallery(editingProduct.media || []);
      setUploadedFileName(editingProduct.deliveryConfig?.filePath || '');
    } else {
      setForm({
        title: '',
        description: '',
        shortDescription: '',
        price: '',
        salePrice: '',
        features: '',
        specifications: '',
        whatsIncluded: '',
        deliveryType: 'INTERNAL_FILE',
        filePath: '',
        url: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
      });
      setSelectedCategoryIds([]);
      setGallery([]);
      setUploadedFileName('');
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('commerza_admin_token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/uploads/public`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Image upload failed');
      const body = await res.json();
      const relativePath = body.data?.filePath;

      setGallery((prev) => [
        ...prev,
        {
          url: relativePath,
          isPrimary: prev.length === 0,
          position: prev.length,
        },
      ]);
    } catch (err: any) {
      alert(err.message || 'Image upload error');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleUploadDigitalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const token = localStorage.getItem('commerza_admin_token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/uploads/private`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Digital asset upload failed');
      const body = await res.json();
      const relativePath = body.data?.filePath;

      setForm((prev) => ({ ...prev, filePath: relativePath }));
      setUploadedFileName(file.name);
    } catch (err: any) {
      alert(err.message || 'Digital file upload error');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.description) {
      alert('Please fill in Title, Price, and Description.');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        brandId,
        title: form.title,
        price: parseFloat(form.price.toString()),
        salePrice: form.salePrice ? parseFloat(form.salePrice.toString()) : undefined,
        description: form.description,
        shortDescription: form.shortDescription || undefined,
        features: form.features || undefined,
        specifications: form.specifications || undefined,
        whatsIncluded: form.whatsIncluded || undefined,
        deliveryType: form.deliveryType,
        deliveryConfig:
          form.deliveryType === 'INTERNAL_FILE'
            ? { filePath: form.filePath }
            : { url: form.url },
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        seoKeywords: form.seoKeywords || undefined,
        categoryIds: selectedCategoryIds,
        media: gallery.map((item, idx) => ({
          url: item.url,
          isPrimary: idx === 0,
          position: idx,
        })),
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-3xl rounded-2xl shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
          <h2 className="text-xl font-extrabold text-foreground">
            {editingProduct ? '✏️ Edit Product' : '➕ Create New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-border rounded-lg text-foreground/75 cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-widest">
              General Information
            </h3>
            <div>
              <label className="block text-xs font-semibold text-foreground/80 mb-1">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Master Clean Architecture E-Book"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="49.00"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Sale Price (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                  placeholder="29.00"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/80 mb-1">Short Summary</label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                placeholder="High conversion snippet for cards"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/80 mb-1">Full Description *</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Comprehensive details, modules, instructions..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
              />
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="block text-xs font-semibold text-foreground/80 mb-1">Assign Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-background border border-border text-foreground/75 hover:bg-border/60'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Product Media Gallery */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Product Images</h3>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-md hover:bg-primary/20 transition-colors cursor-pointer"
              >
                {uploadingImage ? 'Uploading...' : '+ Upload Image'}
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleUploadImage}
                className="hidden"
              />
            </div>
            {gallery.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {gallery.map((img, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-border bg-background">
                    <img src={img.url.startsWith('http') ? img.url : `/api/storage/local/${img.url}`} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGallery((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-foreground/50 italic">No images added yet.</p>
            )}
          </div>

          {/* Digital Delivery Configuration */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Digital Asset Delivery</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="deliveryType"
                  value="INTERNAL_FILE"
                  checked={form.deliveryType === 'INTERNAL_FILE'}
                  onChange={() => setForm({ ...form, deliveryType: 'INTERNAL_FILE' })}
                />
                Hosted File (ZIP, PDF, Audio)
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="deliveryType"
                  value="EXTERNAL_URL"
                  checked={form.deliveryType === 'EXTERNAL_URL'}
                  onChange={() => setForm({ ...form, deliveryType: 'EXTERNAL_URL' })}
                />
                External Link (Google Drive, Notion, Figma)
              </label>
            </div>

            {form.deliveryType === 'INTERNAL_FILE' ? (
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="w-full border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {uploadingFile ? 'Uploading Asset...' : uploadedFileName ? `✅ ${uploadedFileName}` : '📁 Click to Upload Downloadable File'}
                  </p>
                  <p className="text-[11px] text-foreground/50 mt-1">Accepts ZIP, PDF, RAR, EPUB up to 100MB</p>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,.pdf,.rar,.epub,.mp3,.mp4"
                  onChange={handleUploadDigitalFile}
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Target Redirect URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border hover:bg-border text-foreground text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
