import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default
  private readonly MAX_MEMORY_SIZE = 100; // Maximum entries in memory

  /**
   * Get data from cache or execute the observable if not cached/expired
   */
  getOrSet<T>(
    key: string,
    source$: Observable<T>,
    ttl: number = this.DEFAULT_TTL
  ): Observable<T> {
    const cached = this.get<T>(key);
    
    if (cached) {
      return of(cached);
    }

    return source$.pipe(
      tap(data => this.set(key, data, ttl))
    );
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.data as T;
    }
    if (memoryEntry) {
      this.memoryCache.delete(key); // Remove expired entry
    }

    // Try localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        if (!this.isExpired(entry)) {
          // Move to memory cache for faster access
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.error('Error reading from localStorage cache:', error);
    }

    return null;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: ttl
    };

    // Store in memory (always works)
    this.evictIfNeeded();
    this.memoryCache.set(key, entry);

    // Store in localStorage for persistence with quota management
    try {
      const serialized = JSON.stringify(entry);
      
      // Check if entry is too large (>5MB)
      if (serialized.length > 5 * 1024 * 1024) {
        console.warn(`Cache entry "${key}" is too large (${Math.round(serialized.length / 1024)}KB), storing in memory only`);
        return; // Only store in memory
      }
      
      localStorage.setItem(`cache_${key}`, serialized);
    } catch (error: any) {
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.warn('localStorage quota exceeded, clearing old entries');
        this.clearOldEntries();
        try {
          const serialized = JSON.stringify(entry);
          localStorage.setItem(`cache_${key}`, serialized);
        } catch (e) {
          console.warn('Could not write to localStorage even after clearing, using memory only');
          // Entry is already in memoryCache, so it's still available
        }
      } else {
        console.error('Error writing to localStorage cache:', error);
        // Entry is still in memoryCache, so it's available
      }
    }
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Error removing from localStorage cache:', error);
    }
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    
    // Clear from memory
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from localStorage
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('cache_') && regex.test(key.replace('cache_', ''))) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error clearing pattern from localStorage:', error);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error clearing localStorage cache:', error);
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.expiresIn;
  }

  /**
   * Evict old entries if memory cache is full
   */
  private evictIfNeeded(): void {
    if (this.memoryCache.size >= this.MAX_MEMORY_SIZE) {
      // Remove oldest entry
      let oldestKey: string | null = null;
      let oldestTime = Infinity;

      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp;
          oldestKey = key;
        }
      }

      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }
  }

  /**
   * Clear old entries from localStorage
   */
  private clearOldEntries(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(k => k.startsWith('cache_'));
      
      // Sort by timestamp and remove oldest
      const entries = cacheKeys.map(key => {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          return { key, timestamp: entry.timestamp || 0 };
        } catch {
          return { key, timestamp: 0 };
        }
      }).sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest 20% of entries
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(entries[i].key);
      }
    } catch (error) {
      console.error('Error clearing old entries:', error);
    }
  }
}

