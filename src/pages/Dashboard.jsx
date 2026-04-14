import React, { useEffect, useMemo, useState } from 'react';
import { getProducts } from '../services/api';
import { requestNotificationPermission, showAppNotification } from '../services/notifications.js';

export default function Dashboard({ user, onNavigate, onLogout }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      setProducts([]);
    }
  };

  const stats = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter(p => Number(p.quantity) <= 5).length;
    const mediumStock = products.filter(
      p => Number(p.quantity) > 5 && Number(p.quantity) <= 15
    ).length;

    const totalValue = products.reduce(
      (sum, p) => sum + Number(p.quantity) * Number(p.price),
      0
    );

    const categoriesMap = {};
    for (const product of products) {
      const category = (product.category || 'Sin categoría').trim();
      categoriesMap[category] = (categoriesMap[category] || 0) + 1;
    }

    const categories = Object.entries(categoriesMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      lowStock,
      mediumStock,
      totalValue,
      categories
    };
  }, [products]);

  const recentProducts = useMemo(() => {
    return [...products].slice(0, 6);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter(p => Number(p.quantity) <= 5)
      .sort((a, b) => Number(a.quantity) - Number(b.quantity))
      .slice(0, 6);
  }, [products]);

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

  const handleTestNotification = async () => {
    const permission = await requestNotificationPermission();

    if (permission !== 'granted') {
      alert('No se pudieron activar las notificaciones. Revisa los permisos del navegador.');
      return;
    }

    await showAppNotification('StockLocal activo', {
      body: `Hola ${user?.name || 'usuario'}, las notificaciones funcionan correctamente.`,
      tag: 'dashboard-test-notification'
    });
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
            <button className="active" onClick={() => onNavigate('dashboard')}>
              Dashboard
            </button>
            <button onClick={() => onNavigate('products')}>
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
            <h1>Dashboard</h1>
            <p>
              Visualiza métricas clave, alertas de stock y distribución de productos por categoría.
            </p>
          </div>

          <div className="topbar-actions">
            <button type="button" className="primary" onClick={() => onNavigate('products')}>
              Nuevo producto
            </button>
            <button type="button" onClick={handleTestNotification}>
              Probar notificación
            </button>
          </div>
        </header>

        <section className="dashboard-grid">
          <div className="kpi-card">
            <p className="kpi-label">Total de productos</p>
            <p className="kpi-value">{stats.total}</p>
            <p className="kpi-helper">Cantidad total registrada en el sistema</p>
          </div>

          <div className="kpi-card">
            <p className="kpi-label">Bajo stock</p>
            <p className="kpi-value">{stats.lowStock}</p>
            <p className="kpi-helper">Productos que requieren atención inmediata</p>
          </div>

          <div className="kpi-card">
            <p className="kpi-label">Stock medio</p>
            <p className="kpi-value">{stats.mediumStock}</p>
            <p className="kpi-helper">Productos con inventario moderado</p>
          </div>

          <div className="kpi-card">
            <p className="kpi-label">Valor del inventario</p>
            <p className="kpi-value">${stats.totalValue.toFixed(2)}</p>
            <p className="kpi-helper">Estimación basada en cantidad por precio</p>
          </div>

          <div className="panel panel-lg">
            <h2 className="panel-title">Productos recientes</h2>
            <p className="panel-subtitle">
              Vista rápida de los últimos productos disponibles en inventario.
            </p>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5">No hay productos registrados.</td>
                    </tr>
                  ) : (
                    recentProducts.map(product => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.quantity}</td>
                        <td>${Number(product.price).toFixed(2)}</td>
                        <td>
                          <span className={`badge ${getStockBadgeClass(product.quantity)}`}>
                            {getStockLabel(product.quantity)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel panel-sm">
            <h2 className="panel-title">Alertas de stock</h2>
            <p className="panel-subtitle">
              Productos que están por agotarse o requieren reabastecimiento.
            </p>

            <div className="insight-list">
              {lowStockProducts.length === 0 ? (
                <div className="insight-item">
                  <h4>Todo en orden</h4>
                  <p>No hay productos con bajo stock en este momento.</p>
                </div>
              ) : (
                lowStockProducts.map(product => (
                  <div className="insight-item" key={product.id}>
                    <h4>{product.name}</h4>
                    <p>
                      {product.category} · {product.quantity} unidades disponibles
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel panel-md">
            <h2 className="panel-title">Productos por categoría</h2>
            <p className="panel-subtitle">
              Distribución rápida de inventario por tipo de producto.
            </p>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Productos</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.categories.length === 0 ? (
                    <tr>
                      <td colSpan="3">No hay categorías disponibles.</td>
                    </tr>
                  ) : (
                    stats.categories.map(category => (
                      <tr key={category.name}>
                        <td>{category.name}</td>
                        <td>{category.count}</td>
                        <td>
                          <span className="badge info">
                            Activa
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          
        </section>
      </main>
    </div>
  );
}