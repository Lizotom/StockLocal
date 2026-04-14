import React, { useEffect, useState } from 'react';

const initialState = {
  name: '',
  category: '',
  quantity: '',
  price: '',
  provider: ''
};

export default function ProductForm({ onSave, editingProduct, onCancel }) {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || '',
        category: editingProduct.category || '',
        quantity: editingProduct.quantity ?? '',
        price: editingProduct.price ?? '',
        provider: editingProduct.provider || ''
      });
    } else {
      setForm(initialState);
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'El nombre es obligatorio.';
    if (!form.category.trim()) return 'La categoría es obligatoria.';
    if (form.quantity === '' || Number(form.quantity) < 0) return 'La cantidad debe ser un número válido.';
    if (form.price === '' || Number(form.price) < 0) return 'El precio debe ser un número válido.';
    if (!form.provider.trim()) return 'El proveedor es obligatorio.';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    onSave({
      ...editingProduct,
      ...form,
      name: form.name.trim(),
      category: form.category.trim(),
      provider: form.provider.trim(),
      quantity: Number(form.quantity),
      price: Number(form.price)
    });

    if (!editingProduct) {
      setForm(initialState);
    }
  };

  return (
   <section className="panel section-spacing">
      <form className="form two-columns" onSubmit={handleSubmit}>
        <h2>{editingProduct ? 'Editar producto' : 'Registrar nuevo producto'}</h2>

        {error && <p className="error">{error}</p>}

        <div>
          <label htmlFor="name">Nombre del producto</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ej. Arroz 1kg"
          />
        </div>

        <div>
          <label htmlFor="category">Categoría</label>
          <input
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Ej. Abarrotes"
          />
        </div>

        <div>
          <label htmlFor="quantity">Cantidad</label>
          <input
            id="quantity"
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="price">Precio</label>
          <input
            id="price"
            type="number"
            step="0.01"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
          />
        </div>

        <div className="form-full-width">
          <label htmlFor="provider">Proveedor</label>
          <input
            id="provider"
            name="provider"
            value={form.provider}
            onChange={handleChange}
            placeholder="Ej. Distribuidora Central"
          />
        </div>

        <div className="actions">
          <button type="submit">
            {editingProduct ? 'Actualizar producto' : 'Guardar producto'}
          </button>

          {editingProduct && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setForm(initialState);
                setError('');
                onCancel();
              }}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>
    </section>
  );
}