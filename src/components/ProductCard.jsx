import React from 'react';

export default function ProductCard({ product, onEdit, onDelete }) {
  const quantity = Number(product.quantity);

  const getStockBadgeClass = () => {
    if (quantity <= 5) return 'low';
    if (quantity <= 15) return 'medium';
    return 'high';
  };

  const getStockLabel = () => {
    if (quantity <= 5) return 'Bajo';
    if (quantity <= 15) return 'Medio';
    return 'Alto';
  };

  return (
    <div className="card product-card">
      <h3>{product.name}</h3>

      <div className="product-meta">
        <p><strong>Categoría:</strong> {product.category}</p>
        <p><strong>Cantidad:</strong> {product.quantity}</p>
        <p><strong>Precio:</strong> ${Number(product.price).toFixed(2)}</p>
        <p><strong>Proveedor:</strong> {product.provider}</p>
      </div>

      <span className={`badge ${getStockBadgeClass()}`}>
        Stock {getStockLabel()}
      </span>

      <div className="actions">
        <button
          type="button"
          className="secondary"
          onClick={() => onEdit(product)}
        >
          Editar
        </button>

        <button
          type="button"
          className="danger"
          onClick={() => onDelete(product.id)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}