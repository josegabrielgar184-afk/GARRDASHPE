'use client';

import { RANKING_PAGE_SIZE, IMAGE_MAX_SIZE_KB } from '@/lib/config';

const CACHE_PREFIX = 'garrdashpe_cache_';
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

export function cacheSet<T>(key: string, data: T, ttlMs: number = CACHE_TTL_MS): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry = { data, timestamp: Date.now(), ttl: ttlMs };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {}
}

export function cacheGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > entry.ttl) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

export function cacheInvalidate(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch {}
}

export function cacheInvalidatePattern(pattern: string): void {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(localStorage);
    for (const k of keys) {
      if (k.startsWith(CACHE_PREFIX) && k.includes(pattern)) {
        localStorage.removeItem(k);
      }
    }
  } catch {}
}

export function createPaginatedQuery<T>(
  fetchPage: (offset: number, limit: number) => Promise<T[]>,
  pageSize: number = RANKING_PAGE_SIZE
) {
  let currentOffset = 0;
  let hasMore = true;
  let allItems: T[] = [];

  return {
    async loadNext(): Promise<T[]> {
      if (!hasMore) return [];
      const items = await fetchPage(currentOffset, pageSize);
      if (items.length < pageSize) hasMore = false;
      allItems = [...allItems, ...items];
      currentOffset += items.length;
      return items;
    },
    reset() {
      currentOffset = 0;
      hasMore = true;
      allItems = [];
    },
    getAll(): T[] {
      return allItems;
    },
    getHasMore(): boolean {
      return hasMore;
    },
  };
}

export async function compressImage(file: File | Blob, maxSizeKB: number = IMAGE_MAX_SIZE_KB): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let quality = 0.85;
        let width = img.width;
        let height = img.height;

        const maxDimension = 1280;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file instanceof File ? file : new Blob([file]));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file instanceof File ? file : new Blob([file]));
                return;
              }
              if (blob.size / 1024 > maxSizeKB && quality > 0.3) {
                quality -= 0.15;
                tryCompress();
              } else {
                resolve(blob);
              }
            },
            'image/jpeg',
            quality
          );
        };
        tryCompress();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function getDaysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}
