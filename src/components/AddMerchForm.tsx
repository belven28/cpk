/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MerchItem } from "../types";
import { Sparkles, Loader2, Link2, Plus, AlertCircle, RefreshCw, X } from "lucide-react";

interface AddMerchFormProps {
  onAdd: (item: Omit<MerchItem, "id" | "createdAt">) => void;
  onClose: () => void;
  initialItem?: MerchItem | null; // For editing existing items
  onUpdate?: (id: string, updated: Partial<MerchItem>) => void;
}

const CATEGORIES = [
  "Manga",
  "Light Novel",
  "Fan Book",
  "Keychains",
  "Acrylic Stands",
  "Badges",
  "Mousepad",
  "Photo",
  "Photocard",
  "Others"
];

const PRESET_STORES = [
  "Taobao Malaysia",
  "Shopee Malaysia",
  "Kinokuniya Malaysia",
  "Animate Japan",
  "Animate Malaysia",
  "Others"
];

const CURRENCIES = ["MYR", "CNY", "JPY", "USD", "SGD", "EUR", "GBP"];

export function AddMerchForm({ onAdd, onClose, initialItem, onUpdate }: AddMerchFormProps) {
  const isEditing = !!initialItem;

  // Analysis inputs
  const [urlInput, setUrlInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisStep, setAnalysisStep] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [storeName, setStoreName] = useState("Taobao Malaysia");
  const [customStore, setCustomStore] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [originalCurrency, setOriginalCurrency] = useState("MYR");
  const [priceMyr, setPriceMyr] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Acrylic Stands");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [status, setStatus] = useState<MerchItem["status"]>("received");
  const [notes, setNotes] = useState("");
  const [featuresCsv, setFeaturesCsv] = useState("");

  // Helper for currency conversion rates
  const getConversionRate = (currency: string): number => {
    switch (currency) {
      case "CNY":
        return 0.65;
      case "JPY":
        return 0.03;
      case "USD":
        return 4.70;
      case "SGD":
        return 3.45;
      case "MYR":
        return 1.0;
      default:
        return 1.0;
    }
  };

  // Populate form if we are editing
  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title || "");
      const matchedStore = PRESET_STORES.find(s => s === initialItem.storeName);
      if (matchedStore) {
        setStoreName(initialItem.storeName);
        setCustomStore("");
      } else {
        setStoreName("Others");
        setCustomStore(initialItem.storeName || "");
      }
      setSourceUrl(initialItem.sourceUrl || "");
      setOriginalPrice(initialItem.originalPrice || 0);
      setOriginalCurrency(initialItem.originalCurrency || "MYR");
      setPriceMyr(initialItem.priceMyr || 0);
      setImageUrl(initialItem.imageUrl || "");
      setDescription(initialItem.description || "");
      setCategory(initialItem.category || "Acrylic Stands");
      setPurchaseDate(initialItem.purchaseDate || new Date().toISOString().split("T")[0]);
      setStatus(initialItem.status || "received");
      setNotes(initialItem.notes || "");
      setFeaturesCsv((initialItem.keyFeatures || []).join(", "));
    } else {
      // Default purchase date is today
      setPurchaseDate(new Date().toISOString().split("T")[0]);
    }
  }, [initialItem]);

  const handleURLAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError("");
    setAnalysisStep("Connecting to Princess Kaguya cosmic analyzer...");

    // Simulated steps so interface feels extremely engaging and premium
    const stepIntervals = [
      { text: "Summoning celestial search vectors...", time: 600 },
      { text: "Scanning page metadata details...", time: 1400 },
      { text: "Querying Gemini core framework with Google Search...", time: 2500 },
      { text: "Detecting currency & identifying prices in MYR...", time: 4500 },
      { text: "Revising lunar collector specs...", time: 6000 },
    ];

    stepIntervals.forEach((step) => {
      setTimeout(() => {
        setIsAnalyzing((current) => {
          if (current) setAnalysisStep(step.text);
          return current;
        });
      }, step.time);
    });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      if (!res.ok) {
        throw new Error("Analysis failed. Let's enter metadata manually.");
      }

      const data = await res.json();
      
      // Load parsed details
      setTitle(data.title || "Unknown Kaguya Merch");
      
      const matchedStore = PRESET_STORES.find(s => s.toLowerCase() === (data.storeName || "").toLowerCase());
      if (matchedStore) {
        setStoreName(matchedStore);
        setCustomStore("");
      } else {
        setStoreName("Others");
        setCustomStore(data.storeName || "Direct Store");
      }

      setSourceUrl(urlInput);
      setOriginalPrice(data.originalPrice || 0);
      setOriginalCurrency(data.originalCurrency || "MYR");
      setPriceMyr(data.priceMyr || 0);
      setImageUrl(data.imageUrl || "");
      setDescription(data.description || "");
      if (CATEGORIES.includes(data.category)) {
        setCategory(data.category);
      } else {
        setCategory("Acrylic Stands");
      }
      if (data.keyFeatures) {
        setFeaturesCsv(data.keyFeatures.join(", "));
      }

    } catch (err: any) {
      console.error(err);
      setAnalysisError("Could not query website details automatically. Entering simple placeholders instead. You can adjust the details manually below.");
      
      setSourceUrl(urlInput);
      const isTaobao = urlInput.toLowerCase().includes("taobao");
      const isShopee = urlInput.toLowerCase().includes("shopee");
      const isKinokuniya = urlInput.toLowerCase().includes("kinokuniya");
      
      if (isTaobao) setStoreName("Taobao Malaysia");
      else if (isShopee) setStoreName("Shopee Malaysia");
      else if (isKinokuniya) setStoreName("Kinokuniya Malaysia");
      else setStoreName("Others");
      
      setOriginalCurrency(isTaobao || isShopee || isKinokuniya ? "MYR" : "JPY");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required!");
      return;
    }

    const finalizedStore = storeName === "Others" ? (customStore.trim() || "Others") : storeName;

    const itemPayload = {
      title,
      storeName: finalizedStore,
      sourceUrl,
      originalPrice,
      originalCurrency,
      priceMyr: priceMyr || 0,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400",
      description,
      category,
      purchaseDate,
      status,
      notes,
      keyFeatures: featuresCsv ? featuresCsv.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };

    if (isEditing && onUpdate && initialItem) {
      onUpdate(initialItem.id, itemPayload);
    } else {
      onAdd(itemPayload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div 
        id="add-merch-modal"
        className="relative w-full max-w-2xl rounded-2xl border border-amber-500/20 bg-[#070a1a] p-6 shadow-2xl shadow-black/80 my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title="Close Modal"
        >
          <X size={18} />
        </button>

        {/* MODAL HEADER */}
        <div className="mb-6">
          <h3 className="font-display text-xl font-bold text-amber-300 flex items-center gap-2">
            🌙 {isEditing ? "Edit Merchandise Log" : "Log New Kaguya Collectible"}
          </h3>
          {isEditing && (
            <p className="text-xs text-slate-400 mt-1">
              Modify parameters for this curated piece of Princess Kaguya universe memorablia.
            </p>
          )}
        </div>

        {/* 1. AUTO SCANNER SEC (Only visible when adding fresh) */}
        {!isEditing && (
          <div className="mb-6 rounded-xl border border-indigo-500/10 bg-indigo-950/20 p-4">
            <h4 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-indigo-300 uppercase mb-3">
              <Sparkles size={14} className="text-indigo-400" />
              Automated Link Analyzer (Gemini Grounded)
            </h4>
            
            <form onSubmit={handleURLAnalysis} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                  <Link2 size={14} />
                </div>
                <input
                  type="url"
                  placeholder="Paste Taobao, Tsutaya, AmiAmi, or Anime product URL..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isAnalyzing || !urlInput.trim()}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    <span>Auto-Analyze</span>
                  </>
                )}
              </button>
            </form>

            {isAnalyzing && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-300 bg-amber-500/5 px-3 py-2 rounded border border-amber-500/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="font-mono">{analysisStep}</span>
              </div>
            )}

            {analysisError && (
              <p className="mt-2.5 text-[11px] text-amber-300 flex items-center gap-1">
                <AlertCircle size={12} />
                {analysisError}
              </p>
            )}
          </div>
        )}

        {/* 2. CATALOGUE FORM DETAILS */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-t border-slate-900 pt-4">
            <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
              Catalogue Details
            </h4>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 tracking-wide uppercase mb-1">
              Merchandise Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Princess Kaguya Moonlit Bamboo Grove Acrylic Stand"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Store Name Dropdown with "Others" override */}
            <div>
              <label className="block text-xs font-bold text-slate-300 tracking-wide uppercase mb-1">
                Store Sourced
              </label>
              <select
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full h-[34px] rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none mb-2"
              >
                {PRESET_STORES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              {storeName === "Others" && (
                <input
                  type="text"
                  required
                  placeholder="Enter custom store name..."
                  value={customStore}
                  onChange={(e) => setCustomStore(e.target.value)}
                  className="w-full rounded-lg border border-indigo-500/30 bg-slate-900 px-3 py-2 text-xs text-indigo-300 placeholder-indigo-400 focus:border-indigo-500 focus:outline-none animate-fade-in"
                />
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-300 tracking-wide uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-[34px] rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Original Price */}
            <div>
              <label className="block text-xs font-bold text-slate-300 tracking-wide uppercase mb-1">
                Original Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="150"
                value={originalPrice || ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setOriginalPrice(val);
                  const rate = getConversionRate(originalCurrency);
                  const estimated = Math.round(val * rate * 100) / 100;
                  setPriceMyr(estimated);
                }}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none"
              />
            </div>

            {/* Original Currency */}
            <div>
              <label className="block text-xs font-bold text-slate-300 tracking-wide uppercase mb-1">
                Original Currency
              </label>
              <select
                value={originalCurrency}
                onChange={(e) => {
                  const curr = e.target.value;
                  setOriginalCurrency(curr);
                  const rate = getConversionRate(curr);
                  const estimated = Math.round(originalPrice * rate * 100) / 100;
                  setPriceMyr(estimated);
                }}
                className="w-full h-[34px] rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>

            {/* Price MYR Equivalent */}
            <div>
              <label className="block text-xs font-bold text-amber-400 tracking-wide uppercase mb-1 flex items-center justify-between">
                <span>Price in MYR</span>
                {originalCurrency === "MYR" && (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/20">No Conversion</span>
                )}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="RM 97.50"
                value={priceMyr || ""}
                onChange={(e) => setPriceMyr(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-amber-500/30 bg-slate-900 px-3 py-2 text-xs text-amber-300 placeholder-amber-500/40 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold text-slate-300 tracking-wide uppercase mb-1">
                Product Image URL
              </label>
              <input
                type="url"
                placeholder="e.g. https://... or leave blank for a scenic placeholder"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none"
              />
            </div>

            {/* Purchase / Sighting date */}
            <div>
              <label className="block text-xs font-bold text-slate-300 tracking-wide uppercase mb-1">
                Date Sighted / Purchased
              </label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-300 tracking-wide uppercase mb-1">
                Purchase Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MerchItem["status"])}
                className="w-full h-[34px] rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
              >
                <option value="received">Received (Purchased & Sighted Home)</option>
                <option value="shipping">Shipping (Purchased & En route)</option>
                <option value="ordered">Ordered (Purchased & Order Placed)</option>
                <option value="wishlist">Wishlist (Sighted / Plan to purchase)</option>
              </select>
            </div>
          </div>

          {/* Personal order notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 tracking-wide uppercase mb-1">
              My Personal Notes / Tracking Numbers
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 'Will purchase during Tsutaya mid-month sale' or tracking number 'MY4920238'"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* MODAL FOOTER */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-800 bg-[#0d1226]/50 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-[#0d1226] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-6 py-2 text-xs font-bold text-[#05060d] transition-all"
            >
              {isEditing ? "Save Merchandise Changes" : "Save to Catalogue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
