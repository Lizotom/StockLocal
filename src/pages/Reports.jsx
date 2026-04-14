import React, { useEffect, useMemo, useState } from 'react';
import { getProducts } from '../services/api';

export default function Reports({ user, onNavigate, onLogout }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      setProducts([]);
    }
  };

  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const lowStock = products.filter(p => Number(p.quantity) <= 5).length;
    const mediumStock = products.filter(
      p => Number(p.quantity) > 5 && Number(p.quantity) <= 15
    ).length;
    const highStock = products.filter(p => Number(p.quantity) > 15).length;

    const totalInventoryValue = products.reduce(
      (sum, p) => sum + Number(p.quantity) * Number(p.price),
      0
    );

    return {
      totalProducts,
      lowStock,
      mediumStock,
      highStock,
      totalInventoryValue
    };
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return [...products]
      .filter(p => Number(p.quantity) <= 5)
      .sort((a, b) => Number(a.quantity) - Number(b.quantity));
  }, [products]);

  const topValuableProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const valueA = Number(a.quantity) * Number(a.price);
        const valueB = Number(b.quantity) * Number(b.price);
        return valueB - valueA;
      })
      .slice(0, 5);
  }, [products]);

  const categorySummary = useMemo(() => {
    const map = {};

    for (const product of products) {
      const category = (product.category || 'Sin categoría').trim();
      const quantity = Number(product.quantity) || 0;
      const price = Number(product.price) || 0;
      const value = quantity * price;

      if (!map[category]) {
        map[category] = {
          category,
          totalProducts: 0,
          totalUnits: 0,
          totalValue: 0
        };
      }

      map[category].totalProducts += 1;
      map[category].totalUnits += quantity;
      map[category].totalValue += value;
    }

    return Object.values(map).sort((a, b) => b.totalValue - a.totalValue);
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
            <button onClick={() => onNavigate('products')}>
              Productos
            </button>
            <button className="active" onClick={() => onNavigate('reports')}>
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
            <h1>Reportes de inventario</h1>
            <p>
              Analiza el estado general del inventario, detecta productos críticos y consulta el valor por categoría.
            </p>
          </div>

          
        </header>

        <section className="dashboard-grid section-spacing">
          <div className="kpi-card">
            <p className="kpi-label">Productos totales</p>
            <p className="kpi-value">{metrics.totalProducts}</p>
            <p className="kpi-helper">Registros totales en el sistema</p>
          </div>

          <div className="kpi-card">
            <p className="kpi-label">Stock bajo</p>
            <p className="kpi-value">{metrics.lowStock}</p>
            <p className="kpi-helper">Requieren atención inmediata</p>
          </div>

          <div className="kpi-card">
            <p className="kpi-label">Stock medio</p>
            <p className="kpi-value">{metrics.mediumStock}</p>
            <p className="kpi-helper">Inventario en nivel intermedio</p>
          </div>

          <div className="kpi-card">
            <p className="kpi-label">Stock alto</p>
            <p className="kpi-value">{metrics.highStock}</p>
            <p className="kpi-helper">Productos con disponibilidad estable</p>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel panel-lg">
            <h2 className="panel-title">Productos críticos</h2>
            <p className="panel-subtitle">
              Listado de productos con menor cantidad disponible.
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
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6">No hay productos con stock bajo.</td>
                    </tr>
                  ) : (
                    lowStockProducts.map(product => (
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel panel-sm">
            <h2 className="panel-title">Resumen general</h2>
            <p className="panel-subtitle">
              Lectura rápida del valor y estado actual del inventario.
            </p>

            <div className="insight-list">
              <div className="insight-item">
                <h4>Valor total del inventario</h4>
                <p>${metrics.totalInventoryValue.toFixed(2)}</p>
              </div>

              <div className="insight-item">
                <h4>Productos en riesgo</h4>
                <p>{metrics.lowStock} productos con posibilidad de desabasto</p>
              </div>

              <div className="insight-item">
                <h4>Disponibilidad estable</h4>
                <p>{metrics.highStock} productos cuentan con stock alto</p>
              </div>
            </div>
          </div>

          <div className="panel panel-md">
            <h2 className="panel-title">Resumen por categoría</h2>
            <p className="panel-subtitle">
              Visualiza cuántos productos, unidades y valor concentra cada categoría.
            </p>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Productos</th>
                    <th>Unidades</th>
                    <th>Valor total</th>
                  </tr>
                </thead>
                <tbody>
                  {categorySummary.length === 0 ? (
                    <tr>
                      <td colSpan="4">No hay categorías disponibles.</td>
                    </tr>
                  ) : (
                    categorySummary.map(item => (
                      <tr key={item.category}>
                        <td>{item.category}</td>
                        <td>{item.totalProducts}</td>
                        <td>{item.totalUnits}</td>
                        <td>${item.totalValue.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel panel-md">
            <h2 className="panel-title">Productos con mayor valor</h2>
            <p className="panel-subtitle">
              Artículos cuyo total acumulado es más alto considerando cantidad por precio.
            </p>

            <div className="insight-list">
              {topValuableProducts.length === 0 ? (
                <div className="insight-item">
                  <h4>Sin datos</h4>
                  <p>No hay productos registrados todavía.</p>
                </div>
              ) : (
                topValuableProducts.map(product => {
                  const totalValue = Number(product.quantity) * Number(product.price);

                  return (
                    <div className="insight-item" key={product.id}>
                      <h4>{product.name}</h4>
                      <p>
                        {product.category} · {product.quantity} unidades · ${Number(product.price).toFixed(2)} c/u
                      </p>
                      <p className="report-highlight">
                        Valor acumulado: ${totalValue.toFixed(2)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}