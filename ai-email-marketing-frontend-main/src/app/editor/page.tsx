'use client'; // Ensure it's treated as a client-side component

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically load the MailSparkEditor to ensure it's client-side only
const MailSparkEditor = dynamic(() => import('./components/editor'), {
    ssr: false, // Disable server-side rendering
});

export default function Page() {
    return (
        <Suspense fallback={<div>Loading Editor...</div>}>
            <div className=''>
                <MailSparkEditor />
            </div>
        </Suspense>
    );
}
