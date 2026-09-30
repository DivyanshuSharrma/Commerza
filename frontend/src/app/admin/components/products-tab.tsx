'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductEditorModal } from './product-editor-modal';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  deliveryType: 'INTERNAL_FILE' | 'EXTERNAL_URL';
  deliveryConfig: any;
  categories?: { id: string; name: string; slug: string }[];
  media?: any[];
  createdAt?: string;
}

interface ProductsTabProps {
  products: Product[];
  categories?: any[];
  brandId: string;
  onCreateProduct: (data: any) => Promise<void>;
  onDeleteProduct: (id: string) => void;
  onTogglePublish: (id: string, currentStatus: string) => Promise<void>;
  onFetchPaginated?: (params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: string;
  }) => Promise<{
    items: Product[];
    total: number;
    totalPages: number;
  }>;
}

export function ProductsTab({
  products,
  categories = [],
  brandId,
  onCreateProduct,
  onDeleteProduct,
  onTogglePublish,
  onFetchPaginated,
}: ProductsTabProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Server-side pagination state
  const [serverProducts, setServerProducts] = useState<Product[] | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [totalPagesCount, setTotalPagesCount] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Debounced server-side query
  useEffect(() => {
    if (!onFetchPaginated) return;

    let isCancelled = false;
    const timer = setTimeout(async () => {
      setIsFetching(true);
      try {
        const res = await onFetchPaginated({
          page: currentPage,
          limit: pageSize,
          search: search.trim() || undefined,
          categoryId: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        });
        if (!isCancelled && res) {
          setServerProducts(res.items || []);
          setTotalCount(res.total ?? 0);
          setTotalPagesCount(res.totalPages ?? 1);
        }
      } catch (err) {
        console.error('Failed to fetch paginated products:', err);
      } finally {
        if (!isCancelled) setIsFetching(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [currentPage, search, selectedCategory, statusFilter, refreshTrigger, onFetchPaginated]);

  // Client-side fallback
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === 'ALL' ||
        (p.categories && p.categories.some((c) => c.id === selectedCategory));

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [products, search, selectedCategory, statusFilter]);

  const displayedProducts = onFetchPaginated && serverProducts !== null
    ? serverProducts
    : filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalProducts = onFetchPaginated && totalCount !== null
    ? totalCount
    : filteredProducts.length;

  const totalPages = onFetchPaginated && totalPagesCount !== null
    ? totalPagesCount
    : (Math.ceil(filteredProducts.length / pageSize) || 1);

  const handleCreateWrapper = async (data: any) => {
    await onCreateProduct(data);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTogglePublishWrapper = async (id: string, currentStatus: string) => {
    await onTogglePublish(id, currentStatus);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDeleteWrapper = (id: string) => {
    onDeleteProduct(id);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground">Digital Products</h2>
          <p className="text-sm text-foreground/75 mt-1">
            Manage your digital catalog, assets, pricing, and fulfillment.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          + Add Product
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-card border-border">
        <div className="w-full md:w-72 flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search products by title or description..."
            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {isFetching && (
            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium animate-pulse whitespace-nowrap">
              Syncing...
            </span>
          )}
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-primary text-white'
                  : 'bg-background border border-border text-foreground/75 hover:bg-border'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCategory(c.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-primary text-white'
                    : 'bg-background border border-border text-foreground/75 hover:bg-border'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Product List */}
      {displayedProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-foreground/60 text-sm">No products found matching your search.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-150 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
            {displayedProducts.map((p) => {
              const primaryMedia = p.media?.find((m) => m.isPrimary) || p.media?.[0];
              const mediaUrl = primaryMedia?.url
                ? primaryMedia.url.startsWith('http') || primaryMedia.url.startsWith('/')
                  ? primaryMedia.url
                  : `/api/storage/local/${primaryMedia.url}`
                : null;

              return (
                <Card
                  key={p.id}
                  className="overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-all duration-200"
                >
                  {/* Product Thumbnail Banner */}
                  <div className="relative h-44 bg-border/40 overflow-hidden">
                    {mediaUrl ? (
                      <img src={mediaUrl} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/40 font-bold text-sm">
                        📦 Digital Asset
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge variant={p.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {p.status}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-white font-bold text-xs">
                      {p.salePrice ? (
                        <span className="flex items-center gap-1.5">
                          <span>${Number(p.salePrice).toFixed(2)}</span>
                          <span className="line-through text-white/60 text-[10px]">${Number(p.price).toFixed(2)}</span>
                        </span>
                      ) : (
                        <span>${Number(p.price).toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-extrabold text-base text-foreground line-clamp-1 mb-1">{p.title}</h3>
                      <p className="text-xs text-foreground/65 line-clamp-2">
                        {p.shortDescription || p.description}
                      </p>
                    </div>

                    {/* Badges / Info */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
                      <span className="text-[10px] font-mono text-foreground/50 bg-background px-2 py-0.5 rounded border border-border">
                        {p.deliveryType === 'INTERNAL_FILE' ? 'Hosted File' : 'External Link'}
                      </span>
                      {p.categories?.map((cat) => (
                        <span key={cat.id} className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded">
                          {cat.name}
                        </span>
                      ))}
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleTogglePublishWrapper(p.id, p.status)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          p.status === 'ACTIVE'
                            ? 'border-yellow-500/40 text-yellow-600 hover:bg-yellow-500/10'
                            : 'border-green-500/40 text-green-600 hover:bg-green-500/10'
                        }`}
                      >
                        {p.status === 'ACTIVE' ? 'Unpublish' : 'Publish'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-border/60 hover:bg-border text-foreground transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteWrapper(p.id)}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between text-xs text-foreground/70">
              <span>
                Page <strong className="text-foreground">{currentPage}</strong> of{' '}
                <strong className="text-foreground">{totalPages}</strong> ({totalProducts} items total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-30 hover:bg-foreground/5 cursor-pointer font-medium"
                >
                  ← Prev
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-30 hover:bg-foreground/5 cursor-pointer font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      <ProductEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateWrapper}
        editingProduct={editingProduct}
        brandId={brandId}
        categories={categories}
      />
    </div>
  );
}
