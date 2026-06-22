/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { MerchItem } from "../types";
import { ExternalLink, Trash2, Edit2, CheckCircle2, Truck, Eye, Calendar, Tag, AlertCircle, Sparkles, Heart } from "lucide-react";

interface MerchCardProps {
  key?: string;
  item: MerchItem;
  onEdit: (item: MerchItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: MerchItem["status"]) => void;
}

export function MerchCard({ item, onEdit, onDelete, onStatusChange }: MerchCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const getStatusBadge = (status: MerchItem["status"]) => {
    switch (status) {
      case "received":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-kaguya-green/10 px-2.5 py-1 text-[11px] font-bold text-kaguya-green border border-kaguya-green/30 shadow-[0_0_8px_rgba(52,211,153,0.1)] uppercase tracking-wide">
            <CheckCircle2 size={11} /> Received 🌕
          </span>
        );
      case "shipping":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-kaguya-pink/10 px-2.5 py-1 text-[11px] font-bold text-kaguya-pink border border-kaguya-pink/30 shadow-[0_0_8px_rgba(244,114,182,0.1)] uppercase tracking-wide animate-pulse">
            <Truck size={11} /> Sourced 🌸
          </span>
        );
      case "ordered":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-kaguya-indigo/10 px-2.5 py-1 text-[11px] font-bold text-kaguya-indigo border border-kaguya-indigo/30 shadow-[0_0_8px_rgba(129,140,248,0.1)] uppercase tracking-wide">
            <Calendar size={11} /> Ordered ✍️
          </span>
        );
      case "wishlist":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-kaguya-gold/10 px-2.5 py-1 text-[11px] font-bold text-kaguya-gold border border-kaguya-gold/30 shadow-[0_0_8px_rgba(245,188,63,0.1)] uppercase tracking-wide">
            <Eye size={11} /> Wishlist 🌙
          </span>
        );
    }
  };

  const formattedMyrPrice = new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(item.priceMyr || 0);

  const formattedOriginalPrice = item.originalPrice && item.originalCurrency
    ? `${item.originalPrice.toLocaleString()} ${item.originalCurrency}`
    : "";

  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-800/80 bg-[#060814]/95 hover:bg-[#090e24]/95 transition-all duration-300 flex flex-col hover:border-kaguya-gold/35 hover:shadow-2xl hover:shadow-kaguya-gold/5 max-w-full">
      
      {/* Visual Header / Image Container */}
      <div className="relative h-44 w-full bg-[#0a0d1d] overflow-hidden flex items-center justify-center border-b border-slate-900">
        
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 object-center"
            onError={(e) => {
              // fallback standard
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400";
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800/85 flex items-center justify-center text-kaguya-gold mb-2 text-lg border border-kaguya-gold/20">
              🌙
            </div>
            <span className="text-[10px] text-slate-400 font-display tracking-widest uppercase">Traditional relic</span>
          </div>
        )}

        {/* Floating Store Badge */}
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-widest font-bold uppercase bg-black/80 text-kaguya-cream border border-kaguya-gold/25 px-2 py-0.5 rounded shadow">
            {item.storeName || "Anime Store"}
          </span>
        </div>

        {/* Floating Category Badge */}
        <div className="absolute right-3 top-3">
          {getStatusBadge(item.status)}
        </div>

        {/* Hover quick action overlay for links */}
        {item.sourceUrl && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer text-xs font-bold text-white transition-all duration-300 backdrop-blur-[2px]"
          >
            <ExternalLink size={16} className="text-kaguya-gold animate-bounce" />
            <span className="text-kaguya-cream uppercase tracking-wider text-[10px]">Open Original Portal ✦</span>
          </a>
        )}
      </div>

      {/* Detail contents */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Title */}
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <h4 className="font-display text-sm md:text-base font-bold leading-snug text-slate-100 tracking-wide line-clamp-2 title-glow group-hover:text-kaguya-gold transition-colors">
              {item.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
            <span className="bg-slate-850 px-2 py-0.5 rounded text-kaguya-indigo font-bold border border-slate-800">
              {item.category}
            </span>
            {item.purchaseDate && (
              <span className="font-mono bg-slate-900/40 px-1.5 py-0.5 rounded border border-slate-850">
                📅 {item.purchaseDate}
              </span>
            )}
          </div>



          {/* Notes */}
          {item.notes && (
            <div className="mt-3.5 p-2 bg-[#090c1f] rounded border border-kaguya-indigo/15 text-[11px] text-slate-400 italic">
              <span className="text-[9px] text-kaguya-indigo block not-italic font-extrabold tracking-widest uppercase mb-0.5">Librarian note:</span>
              "{item.notes}"
            </div>
          )}

          {/* Quick Mark as Purchased Option for Wishlist elements */}
          {item.status === "wishlist" && (
            <button
              onClick={() => onStatusChange(item.id, "ordered")}
              className="mt-3.5 w-full h-[32px] rounded-lg bg-gradient-to-r from-kaguya-pink/10 to-kaguya-gold/15 hover:from-kaguya-gold hover:to-kaguya-gold/80 border border-kaguya-gold/45 text-kaguya-gold hover:text-slate-950 text-xs font-bold font-display uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-300 shadow-lg active:scale-95 cursor-pointer"
              title="Declare this item purchased"
            >
              <CheckCircle2 size={13} />
              <span>Mark as Sourced 🌕</span>
            </button>
          )}
        </div>

        {/* Pricing tag indicator */}
        <div className="mt-5 pt-3 border-t border-slate-900 flex justify-between items-end">
          <div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Malaysian Equivalent</div>
            <div className="text-base font-bold font-mono text-kaguya-gold gold-glow">{formattedMyrPrice}</div>
            {formattedOriginalPrice && (
              <div className="text-[10px] text-slate-500 font-mono">
                Original: {formattedOriginalPrice}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Status quick list selection */}
            <select
              title="Update status"
              value={item.status}
              onChange={(e) => onStatusChange(item.id, e.target.value as MerchItem["status"])}
              className="text-[11px] bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded px-1.5 py-1 text-slate-200 font-bold focus:outline-none focus:border-kaguya-gold/50 cursor-pointer"
            >
              <option value="received">Received</option>
              <option value="shipping">Shipping</option>
              <option value="ordered">Ordered</option>
              <option value="wishlist">Wishlist</option>
            </select>

            <button
              onClick={() => onEdit(item)}
              className="p-1.5 h-7 w-7 rounded bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-kaguya-gold border border-slate-850 hover:border-kaguya-gold/30 transition-all cursor-pointer"
              title="Edit logistics specs"
            >
              <Edit2 size={12} />
            </button>

            {showConfirm ? (
              <div className="absolute bottom-2 right-2 bg-[#0d0914] border-2 border-red-500/50 rounded-xl p-2.5 shadow-2xl flex flex-col items-center gap-2 z-20 animate-fade-in w-[210px]">
                <span className="text-[10px] font-bold text-red-300 uppercase tracking-widest text-center">Irreversible Deletion?</span>
                <div className="flex gap-1.5 w-full">
                  <button
                    onClick={() => {
                      onDelete(item.id);
                      setShowConfirm(false);
                    }}
                    className="flex-1 py-1 text-[9px] font-bold uppercase bg-red-600 hover:bg-red-500 text-white rounded cursor-pointer transition-all text-center"
                  >
                    Delete 💀
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-1 text-[9px] font-bold uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition-all text-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="p-1.5 h-7 w-7 rounded bg-red-950/20 hover:bg-red-900/35 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-700/50 transition-all cursor-pointer"
                title="Erase from parchment logs"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
