import React from 'react';
import { Helmet } from 'react-helmet';
import AdminNavigation from '@/components/admin/AdminNavigation';
import ResponsiveDesignManager from '@/components/admin/ResponsiveDesignManager';

export default function ResponsiveDesignPage() {
  return (
    <>
      <Helmet>
        <title>Responsive Design Manager | Admin | LANORA HOUSE</title>
        <meta name="description" content="Manage responsive design settings for mobile and desktop experiences." />
      </Helmet>
      
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <main className="pt-16">
          <ResponsiveDesignManager />
        </main>
      </div>
    </>
  );
}