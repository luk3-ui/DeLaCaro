import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import ConfirmDialog from '../components/ConfirmDialog';
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
        >
          + Nuevo
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o código..."
          className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
        >
          Buscar
        </button>
      </form>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No hay productos</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg divide-y">
          {products.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-4 py-3 ${!p.active ? 'opacity-50' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-500 font-mono">{p.barcode}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(Number(p.price))}</p>
                <p className={`text-xs ${p.stock_current <= p.stock_minimum ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                  Stock: {p.stock_current}
                </p>
              </div>
              {p.active && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditProduct(p)}
                    className="px-2 py-1 text-blue-600 text-sm hover:bg-blue-50 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeactivateId(p.id)}
                    className="px-2 py-1 text-red-600 text-sm hover:bg-red-50 rounded"
                  >
                    Desactivar
                  </button>
                </div>
              )}
              {!p.active && (
                <span className="text-xs text-gray-400">Inactivo</span>
              )}
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}
