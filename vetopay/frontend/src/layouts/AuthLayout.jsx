import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div>
      {/* Placeholder for Auth Layout (e.g., centered card for login/register) */}
      <p>Auth Layout Wrapper</p>
      <main>
        <Outlet /> {/* This is where nested auth routes will render their components */}
      </main>
    </div>
  );
};

export default AuthLayout; 