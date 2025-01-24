'use client';

import { useEffect } from 'react';
import Hotjar from '@hotjar/browser';

export default function HotjarProvider() {
  useEffect(() => {
    const siteId = 5251541;
    const hotjarVersion = 6;

    try {
      Hotjar.init(siteId, hotjarVersion);
    } catch (error) {
      console.error('Hotjar initialization error:', error);
    }
  }, []);

  return null;
}