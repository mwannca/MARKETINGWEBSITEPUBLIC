// pages/dashboard/brands/brand/page.tsx
'use client'; // Ensures the page runs entirely on the client

import React, { Suspense } from 'react';
import Brand from '../components/brand';

export default function Page() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
        <Brand />
      </Suspense>
  );
}
