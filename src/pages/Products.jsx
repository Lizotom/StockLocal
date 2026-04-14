import React, { useEffect, useMemo, useState } from 'react';
import ProductForm from '../components/ProductForm';
import ProductCard from '../components/ProductCard';
import { showAppNotification } from '../services/notifications.js';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../services/api';

export default function Products({ user, onNavigate, onLogout }) {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const applyMobileView = () => {
      if (window.matchMedia('(max-width: 760px)').matches) {
        setViewMode('cards');
      }
    };

    applyMobileView();
    window.addEventListener('resize', applyMobileView);

    return () => window.removeEventListener('resize', applyMobileView);
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);

      if (!navigator.onLine) {
        setMessage('Modo offline: se muestran los productos guardados en IndexedDB.');
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    }
  };

  const handleSave = async (product) => {
    try {
      let result;

      if (product.id) {
        result = await updateProduct(product.id, product);

        if (result?.offline) {
          setMessage('Sin conexión con el servidor. La actualización quedó pendiente de sincronización.');

          await showAppNotification('Actualización pendiente', {
            body: `${product.name} quedó pendiente de sincronización por falta de conexión.`,
            tag: `product-update-offline-${product.id}`
          });
        } else {
          setMessage('Producto actualizado correctamente.');

          await showAppNotification('Producto actualizado', {
            body: `${product.name} se actualizó correctamente.`,
            tag: `product-update-${product.id}`
          });
        }
      } else {
        result = await createProduct(product);

        if (result?.offline) {
          setMessage('No se pudo guardar en la base de datos. El producto quedó pendiente en modo offline.');

          await showAppNotification('Guardado offline', {
            body: `${product.name} quedó pendiente de sincronización.`,
            tag: 'product-create-offline'
          });
        } else {
          setMessage('Producto guardado correctamente.');

          await showAppNotification('Producto registrado', {
            body: `${product.name} se guardó correctamente.`,
            tag: 'product-create'
          });
        }
      }

      setEditingProduct(null);
      await loadProducts();
    } catch (error) {
      console.error(error);
      setMessage('Ocurrió un error al guardar el producto.');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar este producto?');

    if (!confirmed) return;

    const productToDelete = products.find(p => String(p.id) === String(id));

    try {
      const result = await deleteProduct(id);

      if (result?.offline) {
        setMessage('No se pudo eliminar en el servidor. La acción quedó pendiente en modo offline.');

        await showAppNotification('Eliminación pendiente', {
          body: `${productToDelete?.name || 'El producto'} quedó pendiente de sincronización.`,
          tag: `product-delete-offline-${id}`
        });
      } else {
        setMessage('Producto eliminado correctamente.');

        await showAppNotification('Producto eliminado', {
          body: `${productToDelete?.name || 'El producto'} se eliminó correctamente.`,
          tag: `product-delete-${id}`
        });
      }

      if (editingProduct?.id === id) {
        setEditingProduct(null);
      }

      await loadProducts();
    } catch (error) {
      console.error(error);
      setMessage('Ocurrió un error al eliminar el producto.');
    }
  };

  const categories = useMemo(() => {
    const unique = new Set(
      products
        .map(product => (product.category || '').trim())
        .filter(Boolean)
    );

    return ['all', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        (product.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (product.provider || '').toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const stats = useMemo(() => {
    const total = filteredProducts.length;
    const lowStock = filteredProducts.filter(p => Number(p.quantity) <= 5).length;
    const totalValue = filteredProducts.reduce(
      (sum, p) => sum + Number(p.quantity) * Number(p.price),
      0
    );
    const categoriesCount = new Set(
      filteredProducts.map(p => (p.category || '').trim()).filter(Boolean)
    ).size;

    return {
      total,
      lowStock,
      totalValue,
      categoriesCount
    };
  }, [filteredProducts]);

  const getStockBadgeClass = (quantity) => {
    const qty = Number(quantity);
    if (qty <= 5) return 'low';
    if (qty <= 15) return 'medium';
    return 'high';
  };

  const getStockLabel = (quantity) => {
    const qty = Number(quantity);
    if (qty <= 5) return 'Bajo';
    if (qty <= 15) return 'Medio';
    return 'Alto';
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h2>StockLocal</h2>
          <p>Control inteligente de inventario para negocios locales.</p>
        </div>

        <div>
          <p className="sidebar-section-title">Navegación</p>
          <nav className="sidebar-nav">
            <button onClick={() => onNavigate('dashboard')}>
              Dashboard
            </button>
            <button className="active" onClick={() => onNavigate('products')}>
              Productos
            </button>
            <button onClick={() => onNavigate('reports')}>
              Reportes
            </button>
            <button className="logout" onClick={onLogout}>
              Cerrar sesión
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <p>
            Sesión activa:
            <br />
            <strong>{user?.name || 'Administrador'}</strong>
          </p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Gestión de productos</h1>
            <p>
              Administra tu inventario, filtra productos y realiza altas, ediciones o eliminaciones.
            </p>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="primary"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Registrar producto
            </button>
          </div>
        </header>

        {message && <p className="success">{message}</p>}

       <section className="dashboard-grid section-spacing">
          <div className="kpi-card">
            <p className="kpi-label">Productos visibles</p>
            <p className="kpi-value">{stats.total}</p>
            <p className="kpi-helper">Resultado según los filtros aplicados</p>
          </div>

          <div className="kpi-card">
            <p className="kpi-label">Bajo stock</p>
            <p className="kpi-value">{stats.lowStock}</p>
            <p className="kpi-helper">Productos que requieren reabastecimiento</p>
          </div>

          <div className="kpi-card">
            <p className="kpi-label">Categorías</p>
            <p className="kpi-value">{stats.categoriesCount}</p>
            <p className="kpi-helper">Categorías activas en la vista actual</p>
          </div>

          <div className="kpi-card">
            <p className="kpi-label">Valor inventario</p>
            <p className="kpi-value">${stats.totalValue.toFixed(2)}</p>
            <p className="kpi-helper">Estimación por cantidad y precio</p>
          </div>
        </section>

        <ProductForm
          onSave={handleSave}
          editingProduct={editingProduct}
          onCancel={() => setEditingProduct(null)}
        />

       <section className="panel section-spacing">
          <h2 className="panel-title">Filtros y búsqueda</h2>
          <p className="panel-subtitle">
            Localiza productos por nombre, proveedor o categoría.
          </p>

          <div className="filters-bar">
            <div className="filter-group">
              <label htmlFor="searchProduct">Buscar</label>
              <input
                id="searchProduct"
                type="text"
                placeholder="Buscar por nombre o proveedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="categoryFilter">Categoría</label>
              <select
                id="categoryFilter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas las categorías' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Vista</label>
              <div className="view-toggle">
                <button
                  type="button"
                  className={viewMode === 'table' ? 'active' : ''}
                  onClick={() => setViewMode('table')}
                >
                  Tabla
                </button>
                <button
                  type="button"
                  className={viewMode === 'cards' ? 'active' : ''}
                  onClick={() => setViewMode('cards')}
                >
                  Tarjetas
                </button>
              </div>
            </div>
          </div>
        </section>

        {viewMode === 'table' ? (
          <section className="panel">
            <h2 className="panel-title">Inventario de productos</h2>
            <p className="panel-subtitle">
              Vista detallada del inventario con acciones rápidas.
            </p>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Proveedor</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7">No se encontraron productos con los filtros actuales.</td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.quantity}</td>
                        <td>${Number(product.price).toFixed(2)}</td>
                        <td>{product.provider}</td>
                        <td>
                          <span className={`badge ${getStockBadgeClass(product.quantity)}`}>
                            {getStockLabel(product.quantity)}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="button secondary"
                              onClick={() => {
                                setEditingProduct(product);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className="button danger"
                              onClick={() => handleDelete(product.id)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="panel">
            <h2 className="panel-title">Vista en tarjetas</h2>
            <p className="panel-subtitle">
              Resumen visual de productos para revisión rápida.
            </p>

            <div className="product-grid">
              {filteredProducts.length === 0 ? (
                <p>No se encontraron productos con los filtros actuales.</p>
              ) : (
                filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={(selected) => {
                      setEditingProduct(selected);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}