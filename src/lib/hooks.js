import { useEffect, useState } from 'react';
export function useHashRoute() {
    const [, setTick] = useState(0);
    useEffect(() => {
        const cb = () => setTick((n) => n + 1);
        window.addEventListener('hashchange', cb);
        window.addEventListener('popstate', cb);
        return () => {
            window.removeEventListener('hashchange', cb);
            window.removeEventListener('popstate', cb);
        };
    }, []);
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    return hash.replace(/^#/, '');
}
