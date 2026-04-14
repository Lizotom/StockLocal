import React from 'react';

export default function Header({
  title,
  subtitle,
  currentView,
  onNavigate,
  onLogout,
  user,
  actions = []
}) {
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
            <button
              className={currentView === 'dashboard' ? 'active' : ''}
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </button>

            <button
              className={currentView === 'products' ? 'active' : ''}
              onClick={() => onNavigate('products')}
            >
              Productos
            </button>

            <button
              className={currentView === 'reports' ? 'active' : ''}
              onClick={() => onNavigate('reports')}
            >
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
            <strong>{user?.name || 'Usuario'}</strong>
          </p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="topbar-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={action.primary ? 'primary' : ''}
                onClick={action.onClick}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        </header>
      </main>
    </div>
  );
}