/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MerchItem } from "../types";
import { Package, Coins, Store, Sparkles, TrendingUp, Flower2, Moon, Calendar } from "lucide-react";

interface StatsDashboardProps {
  items: MerchItem[];
}

export function StatsDashboard({ items }: StatsDashboardProps) {
  // We only count items that are "purchased" (i.e. status is NOT 'wishlist')
  const purchasedItems = items.filter((item) => item.status !== "wishlist");
  const wishlistCount = items.length - purchasedItems.length;

  const totalSpentMYR = purchasedItems.reduce((acc, item) => acc + (item.priceMyr || 0), 0);
  
  // Categorize
  const categoryMap: Record<string, number> = {};
  purchasedItems.forEach((item) => {
    categoryMap[item.category] = (categoryMap[item.category] || 0) + 1;
  });

  // Stores
  const storeMap: Record<string, number> = {};
  purchasedItems.forEach((item) => {
    const store = item.storeName || "Other Store";
    storeMap[store] = (storeMap[store] || 0) + 1;
  });

  const topStore = Object.entries(storeMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "None Yet";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 relative z-10 font-sans">
      {/* CARD 1: Total Spent (Lunar Gold) */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-kaguya-gold/30 bg-[#070b1a]/95 p-5 backdrop-blur-md shadow-xl transition-all duration-350 hover:border-kaguya-gold/60 group">
        <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-kaguya-gold group-hover:scale-110 transition-transform duration-300 pointer-events-none">
          <Moon size={110} strokeWidth={1} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-kaguya-gold/10 text-kaguya-gold border border-kaguya-gold/30 shadow-[0_0_10px_rgba(245,188,63,0.15)]">
            <Coins className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Total Spent</p>
            <h3 className="text-2xl font-bold font-mono text-kaguya-gold mt-0.5 gold-glow">
              RM {totalSpentMYR.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          <TrendingUp className="h-3.5 w-3.5 text-kaguya-gold" />
          <span>Capital spent across <span className="text-kaguya-gold font-bold">{purchasedItems.length}</span> treasures</span>
        </div>
      </div>

      {/* CARD 2: Total Items (Sakura Pink) */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-kaguya-pink/30 bg-[#070b1a]/95 p-5 backdrop-blur-md shadow-xl transition-all duration-350 hover:border-kaguya-pink/60 group">
        <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-kaguya-pink group-hover:rotate-12 transition-transform duration-300 pointer-events-none">
          <Flower2 size={110} strokeWidth={1} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-kaguya-pink/10 text-kaguya-pink border border-kaguya-pink/30 shadow-[0_0_10px_rgba(244,114,182,0.15)]">
            <Flower2 className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Merch Catalogued</p>
            <h3 className="text-2xl font-bold text-kaguya-pink mt-0.5 pink-glow font-display">
              {purchasedItems.length} <span className="text-xs font-sans text-slate-400 font-normal">Acquired</span>
            </h3>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-kaguya-pink animate-pulse" />
            <span>Wishlist queue: <span className="text-kaguya-pink font-bold">{wishlistCount}</span> records pending</span>
          </div>
        </div>
      </div>

      {/* CARD 3: Top Store (Bamboo Jade) */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-kaguya-green/30 bg-[#070b1a]/95 p-5 backdrop-blur-md shadow-xl transition-all duration-350 hover:border-kaguya-green/60 group">
        <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-kaguya-green group-hover:scale-105 transition-transform duration-300 pointer-events-none">
          <Store size={110} strokeWidth={1} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-kaguya-green/10 text-kaguya-green border border-kaguya-green/30 shadow-[0_0_10px_rgba(52,211,153,0.15)]">
            <Store className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Top Sourcing Channel</p>
            <h3 className="text-sm font-bold text-slate-200 mt-1 truncate max-w-[170px] green-glow font-display">
              {topStore}
            </h3>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          <span className="text-kaguya-green font-bold">
            {storeMap[topStore] || 0}
          </span>
          <span>unique assets acquired from this portal</span>
        </div>
      </div>

      {/* CARD 4: Category Distribution (Astral Violet) */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-kaguya-indigo/30 bg-[#070b1a]/95 p-5 backdrop-blur-md shadow-xl hover:border-kaguya-indigo/60 transition-all duration-300">
        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">Category Distribution</p>
        <div className="space-y-1.5 max-h-[75px] overflow-y-auto pr-1">
          {Object.entries(categoryMap).length === 0 ? (
            <p className="text-xs text-slate-500 italic mt-2">No purchased items catalogued</p>
          ) : (
            Object.entries(categoryMap)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([category, count]) => {
                const percentage = Math.round((count / purchasedItems.length) * 100);
                return (
                  <div key={category} className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span className="truncate text-slate-300 font-medium">{category}</span>
                      <span className="font-mono text-kaguya-indigo font-semibold">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-kaguya-indigo to-kaguya-pink h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
