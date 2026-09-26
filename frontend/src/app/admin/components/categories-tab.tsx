'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { products: number };
}

interface CategoriesTabProps {
  categories: Category[];
  brandId: string;
  onCreateCategory: (data: { brandId: string; name: string; slug?: string; description?: string }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export function CategoriesTab({
  categories,
  brandId,
  onCreateCategory,
  onDeleteCategory,
}: CategoriesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onCreateCategory({
        brandId,
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
      });
      setName('');
      setSlug('');
      setDescription('');
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground">Categories</h2>
          <p className="text-sm text-foreground/75 mt-1">
            Organize digital products into browsable catalog categories.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          + Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-foreground/60 text-sm">No categories found. Create your first category to organize your products.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-primary/50 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg text-foreground">{cat.name}</h3>
                  <Badge variant="primary">
                    {cat._count?.products || 0} Products
                  </Badge>
                </div>
                <p className="text-xs font-mono text-foreground/60 mb-2">/{cat.slug}</p>
                {cat.description && (
                  <p className="text-sm text-foreground/75 line-clamp-2">{cat.description}</p>
                )}
              </div>
              <div className="pt-3 border-t border-border flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => onDeleteCategory(cat.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/30 text-xs py-1.5 px-3"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Category">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1">Category Name *</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                }
              }}
              placeholder="e.g. Design Systems"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1">Slug (URL identifier)</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
              placeholder="e.g. design-systems"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for catalog filter"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
