/**
 * Utility to clear client and server caches cleanly
 */
export async function clearAppCache(options: { preserveAuth?: boolean } = { preserveAuth: true }): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Clear Browser CacheStorage if available
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
      } catch (cacheErr) {
        console.warn('CacheStorage delete warning:', cacheErr);
      }
    }

    // 2. Clear SessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
    }

    // 3. Selective LocalStorage purge (keep user session by default)
    if (typeof window !== 'undefined' && window.localStorage) {
      if (!options.preserveAuth) {
        window.localStorage.clear();
      } else {
        const savedUser = window.localStorage.getItem('xdorm_user');
        window.localStorage.clear();
        if (savedUser) {
          window.localStorage.setItem('xdorm_user', savedUser);
        }
      }
    }

    // 4. Call server-side cache clear endpoint
    const res = await fetch('/api/cache/clear', {
      method: 'POST',
      headers: { 'Cache-Control': 'no-cache' },
    });

    const data = await res.json();
    return {
      success: true,
      message: data.message || 'ล้างแคชระบบและรีเฟรชข้อมูลสำเร็จแล้ว',
    };
  } catch (error: any) {
    console.error('Error clearing cache:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการล้างแคช: ' + (error.message || ''),
    };
  }
}
