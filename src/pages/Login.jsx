import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError('Correo y contraseña son obligatorios.');
      return;
    }

    setError('');

    onLogin({
      name: 'Administrador',
      email: form.email,
      role: 'admin'
    });
  };

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="login-hero-content">
          <span className="login-chip">Sistema de inventario</span>
          <h1>StockLocal</h1>
          <p className="login-hero-text">
            Administra productos, controla niveles de stock y consulta reportes de inventario desde una sola plataforma.
          </p>

          <div className="login-feature-list">
            <div className="login-feature-item">
              <h3>Control centralizado</h3>
              <p>Gestiona altas, ediciones y bajas de productos de forma rápida.</p>
            </div>

            <div className="login-feature-item">
              <h3>Monitoreo inteligente</h3>
              <p>Detecta productos críticos y revisa el estado de tu inventario.</p>
            </div>

            <div className="login-feature-item">
              <h3>Reportes claros</h3>
              <p>Consulta valor del inventario, categorías y productos con mayor impacto.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-box login-box-pro" onSubmit={handleSubmit}>
          <div className="login-header">
            <p className="login-kicker">Bienvenido</p>
            <h2>Iniciar sesión</h2>
            <p className="login-subtext">
              Accede al panel para administrar tu inventario.
            </p>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="login-field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit">Entrar al sistema</button>

        </form>
      </section>
    </main>
  );
}