'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Footer() {
    const [footerData, setFooterData] = useState(null);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'siteConfig', 'footer'), snap => {
            if (snap.exists()) setFooterData(snap.data());
        });
        return () => unsub();
    }, []);

    const year = footerData?.copyrightYear || '2025';
    const name = footerData?.name || 'Ansari Souaib';
    const nameLink = footerData?.nameLink || '/team';
    const extraText = footerData?.extraText || 'all rights reserved!';

    return (
        <footer className="footer">
            &copy; copyright {year} by{' '}
            <Link href={nameLink}>{name}</Link> | {extraText}
        </footer>
    );
}
