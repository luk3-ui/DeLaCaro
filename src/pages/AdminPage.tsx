import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import ConfirmDialog from '../components/ConfirmDialog';
import PageCard from '../components/ui/PageCard';
import { subpageContentClass } from '../components/layout/subpageContent';
import * as productService from '../services/productService';
import type { Product, CreateProductInput } from '../types';
import { formatCurrency } from '../utils/format';

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = search
        ? await productService.searchProducts(search)
        : await productService.getAllProducts();
      setProducts(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const handleCreate = async (data: CreateProductInput) => {
    try {
      await productService.createProduct(data);
      setShowCreate(false);
      loadProducts();
    } catch {
      alert('Error al crear producto');
    }
  };

  const handleUpdate = async (data: CreateProductInput) => {
    if (!editProduct) return;
    try {
      await productService.updateProduct(editProduct.id, data);
      setEditProduct(null);
      loadProducts();
    } catch {
      alert('Error al actualizar producto');
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    try {
      await productService.deactivateProduct(deactivateId);
      setDeactivateId(null);
      loadProducts();
    } catch {
      alert('Error al desactivar producto');
    }
  };

  return (
    <>
    <div className={`${subpageContentClass} w-full max-w-4xl`}>
    <PageCard className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-pos-ink">Productos</h2>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-2xl bg-gradient-to-br from-[#5b6bf5] to-[#818cf8] px-4 py-2.5 font-medium text-white shadow-sm hover:opacity-95 sm:shrink-0"
        >
          + Nuevo
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o código..."
          className="flex-1 rounded-2xl border border-[#e5e7eb] px-4 py-2.5 focus:border-[#818cf8] focus:outline-none focus:ring-2 focus:ring-[#e0e7ff]"
        />
        <button
          type="submit"
          className="rounded-2xl bg-[#f3f4f6] px-4 py-2.5 font-medium text-pos-ink hover:bg-[#e5e7eb] sm:shrink-0"
        >
          Buscar
        </button>
      </form>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <p className="py-8 text-center text-pos-muted">No hay productos</p>
      ) : (
        <div className="divide-y divide-[#f0f0f8] overflow-hidden rounded-2xl border border-[#f0f0f8]">
          {products.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-3 ${!p.active ? 'opacity-50' : ''}`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-pos-ink">{p.name}</p>
                <p className="font-mono text-xs text-pos-muted">{p.barcode}</p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-pos-ink">{formatCurrency(Number(p.price))}</p>
                  <p
                    className={`text-xs ${
                      p.stock_current <= p.stock_minimum
                        ? 'font-bold text-[#ef4444]'
                        : 'text-pos-muted'
                    }`}
                  >
                    Stock: {p.stock_current}
                  </p>
                </div>
                {p.active ? (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditProduct(p)}
                      className="rounded-lg px-2 py-1 text-sm text-[#5b6bf5] hover:bg-[#f5f7ff]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeactivateId(p.id)}
                      className="rounded-lg px-2 py-1 text-sm text-[#ef4444] hover:bg-[#fef2f2]"
                    >
                      Desactivar
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-pos-muted">Inactivo</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageCard>
    </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Producto">
        <ProductForm
          barcode=""
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Editar Producto">
        {editProduct && (
          <ProductForm
            barcode={editProduct.barcode}
            initialData={{
              barcode: editProduct.barcode,
              name: editProduct.name,
              category: editProduct.category ?? undefined,
              price: Number(editProduct.price),
              stock_current: editProduct.stock_current,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditProduct(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deactivateId}
        title="Desactivar Producto"
        message="El producto no se eliminará, solo se desactivará. ¿Continuar?"
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateId(null)}
        confirmLabel="Desactivar"
        danger
      />
    </>
  );
}
