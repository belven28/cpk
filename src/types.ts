/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MerchItem {
  id: string;
  title: string;
  storeName: string;
  sourceUrl: string;
  originalPrice: number;
  originalCurrency: string;
  priceMyr: number;
  imageUrl?: string;
  description: string;
  category: string;
  purchaseDate: string; // YYYY-MM-DD
  status: 'ordered' | 'shipping' | 'received' | 'wishlist';
  notes?: string;
  keyFeatures?: string[];
  createdAt: string;
}

export interface AnalyticsSummary {
  totalItems: number;
  totalMyr: number;
  categoryCounts: Record<string, number>;
  storeCounts: Record<string, number>;
  statusCounts: Record<string, number>;
}
