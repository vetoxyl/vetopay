import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div>
      <header>
        {/* Placeholder for Dashboard Header (e.g., Navbar) */}
        <p>Dashboard Header</p>
      </header>
      <aside>
        {/* Placeholder for Dashboard Sidebar */}
        <p>Dashboard Sidebar</p>
      </aside>
      <main>
        <Outlet /> {/* This is where nested routes will render their components */}
      </main>
      <footer>
        {/* Placeholder for Dashboard Footer */}
        <p>Dashboard Footer</p>
      </footer>
    </div>
  );
};

export default DashboardLayout; 