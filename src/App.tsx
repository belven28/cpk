/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { MerchItem } from "./types";
import { StarryBackground } from "./components/StarryBackground";
import { StatsDashboard } from "./components/StatsDashboard";
import { MerchCard } from "./components/MerchCard";
import { AddMerchForm } from "./components/AddMerchForm";
import { Plus, Search, Filter, Sparkles, RefreshCw, AlertCircle } from "lucide-react";

export default function App() {
  const isDark = true;

  const [items, setItems] = useState<MerchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filter filters
  const [activeTab, setActiveTab] = useState<"purchased" | "wishlist">("purchased");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Custom UI Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MerchItem | null>(null);

  // Load items from API
  const fetchItems = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/merch");
      if (!res.ok) throw new Error("Could not fetch merchandise items");
      const data = await res.json();
      setItems(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to sync catalogue items with the server. Running in fallback mode.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Quick seed method to populate beautiful Kaguya items if database runs cold
  const seedDefaultItems = async () => {
    setIsLoading(true);
    const defaults: Omit<MerchItem, "id" | "createdAt">[] = [
      {
        title: "Kaguya's Divine Bamboo Lantern Acrylic Diorama",
        storeName: "Animate Japan",
        sourceUrl: "https://www.animate-onlineshop.jp/pd/0101",
        originalPrice: 2800,
        originalCurrency: "JPY",
        priceMyr: 84.00,
        imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400",
        description: "Official Kaguya anime special release diorama set during Animate Japan midsummer campaign. High grade star-dust acrylic with bamboo elements overlay.",
        category: "Acrylic Stands",
        purchaseDate: "2026-05-12",
        status: "received",
        keyFeatures: ["Golden star-foil standee", "Animate Special 1.5x scale"],
        notes: "Perfect state of conservation. Left side display drawer item."
      },
      {
        title: "Celestial Moon Princess Silk Haori Jacket",
        storeName: "Taobao Malaysia",
        sourceUrl: "https://world.taobao.com/item/920384",
        originalPrice: 168,
        originalCurrency: "CNY",
        priceMyr: 109.20,
        imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400",
        description: "Cosmic themed Princess Kaguya starry background pattern haori. Sourced directly through Taobao Malaysia with prompt maritime delivery.",
        category: "Others",
        purchaseDate: "2026-06-18",
        status: "shipping",
        keyFeatures: ["Astral silk embroideries", "Stretched double collar styling"],
        notes: "Currently at international transit warehouse."
      },
      {
        title: "Bamboo Cutter Tale: Limited Collector's Hardcover Anthology",
        storeName: "Kinokuniya Malaysia",
        sourceUrl: "https://malaysia.kinokuniya.com/val/8201",
        originalPrice: 126.00,
        originalCurrency: "MYR",
        priceMyr: 126.00,
        imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400",
        description: "Special release visual guide & full storyboard drafts. Leather bounding with golden foil moon runes and illustrations. Direct acquisition from Kinokuniya Kuala Lumpur in local MYR currency.",
        category: "Manga",
        purchaseDate: "2026-06-20",
        status: "ordered",
        keyFeatures: ["Gilded hardcover", "240 color illustration spreads"],
        notes: "Preordered during summer festival opening."
      },
      {
        title: "Immortal Elixir Star Cloisonné Pendant Badge Set",
        storeName: "Shopee Malaysia",
        sourceUrl: "https://shopee.com.my/item-val-83901",
        originalPrice: 50.70,
        originalCurrency: "MYR",
        priceMyr: 50.70,
        imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400",
        description: "Two-piece premium badge collection inside wooden chest packaging. High shine cosmic foil finish.",
        category: "Badges",
        purchaseDate: "2026-06-01",
        status: "wishlist",
        keyFeatures: ["Velvet display mount", "Cloisonné golden trim"],
        notes: "Sourced through Shopee Malaysia. Scheduled for purchase next paycheck!"
      }
    ];

    try {
      for (const item of defaults) {
        await fetch("/api/merch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
      }
      fetchItems();
    } catch (err) {
      console.error("Failed to seed dummy", err);
    }
  };

  // Add Item handler
  const handleAddItem = async (newItem: Omit<MerchItem, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/merch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) throw new Error("Could not insert product into catalogue");
      setIsAddOpen(false);
      fetchItems();
    } catch (err: any) {
      alert(err.message || "Could not insert merchandise log");
    }
  };

  // Update Item handler
  const handleUpdateItem = async (id: string, updatedParams: Partial<MerchItem>) => {
    try {
      const res = await fetch(`/api/merch/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedParams),
      });
      if (!res.ok) throw new Error("Could not update product specs");
      setEditingItem(null);
      fetchItems();
    } catch (err: any) {
      alert(err.message || "Failed to edit Kaguya merch specs");
    }
  };

  // Status toggle handler
  const handleStatusChange = async (id: string, newStatus: MerchItem["status"]) => {
    try {
      const res = await fetch(`/api/merch/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Could not alter status parameter");
      
      // Update local state directly for fast visual feedback
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err: any) {
      alert("Failed to modify item status");
    }
  };

  // Delete item handler
  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/merch/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete from database");
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter & Search resolution
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "purchased"
        ? item.status !== "wishlist" && (selectedStatus === "all" || item.status === selectedStatus)
        : item.status === "wishlist";

    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesTab && matchesCategory;
  });  return (
    <div className={`${isDark ? "mode-dark" : "mode-light"} bg-kaguya-navy min-h-screen transition-all duration-500`}>
      <div className="relative min-h-screen z-10 font-sans pb-16">
        <StarryBackground isDark={isDark} />

        <header className="relative z-10 border-b border-slate-900/60 bg-kaguya-navy/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Main Title */}
            <div className="flex items-center gap-3">
              <span className="text-3xl select-none animate-spin-slow animate-pulse" role="img" aria-label="Kaguya Moon">🌙</span>
              <div>
                <h1 className="text-lg md:text-xl font-bold font-display text-kaguya-gold tracking-widest flex items-center gap-2 gold-glow">
                  Cosmic Princess Kaguya Merch Catalogue
                </h1>
              </div>
            </div>

            {/* Sourcing Buttons */}
            <div className="flex items-center gap-2">
              {items.length === 0 && !isLoading && (
                <button
                  onClick={seedDefaultItems}
                  className="flex items-center gap-1.5 rounded-xl border border-kaguya-pink/30 bg-kaguya-pink/5 px-3 py-2 text-xs font-bold text-kaguya-pink hover:bg-kaguya-pink/15 transition-all cursor-pointer shadow-[0_0_10px_rgba(244,114,182,0.05)]"
                  title="Populate beautiful preset examples to explore functionality"
                >
                  <Sparkles size={14} className="text-kaguya-pink animate-pulse" />
                  <span>Begin Cosmic Tour</span>
                </button>
              )}

              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-kaguya-gold to-yellow-500 hover:from-yellow-400 hover:to-kaguya-gold px-4 py-2 text-xs font-extrabold text-[#05060d] shadow-lg shadow-kaguya-gold/15 hover:shadow-kaguya-gold/25 active:scale-95 transition-all cursor-pointer border border-kaguya-cream/25 font-display uppercase tracking-wider"
              >
                <Plus size={15} strokeWidth={3} />
                <span>Add New Entry ✦</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main stage */}
        <main className="mx-auto max-w-7xl px-4 py-6 relative z-10">
          
          {/* STATS HIGHLIGHT */}
          <StatsDashboard items={items} />
          
          {/* TAB NAVIGATION FOR COLLECTION VS WISHLIST */}
          <div className="flex border-b border-slate-900/80 mb-6 gap-2 relative z-10">
            <button
              onClick={() => {
                setActiveTab("purchased");
                setSelectedStatus("all");
              }}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold tracking-widest uppercase border-b-2 transition-all cursor-pointer ${
                activeTab === "purchased"
                  ? "border-kaguya-gold text-kaguya-gold bg-kaguya-gold/5 gold-glow shadow-[0_0_12px_rgba(245,188,63,0.1)] font-display"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="text-sm">🌕</span>
              <span>Purchased ({items.filter(i => i.status !== "wishlist").length})</span>
            </button>
            
            <button
              onClick={() => {
                setActiveTab("wishlist");
                setSelectedStatus("all");
              }}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold tracking-widest uppercase border-b-2 transition-all cursor-pointer ${
                activeTab === "wishlist"
                  ? "border-kaguya-pink text-kaguya-pink bg-kaguya-pink/5 pink-glow shadow-[0_0_12px_rgba(244,114,182,0.1)] font-display"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="text-sm">🌸</span>
              <span>Wishlist ({items.filter(i => i.status === "wishlist").length})</span>
            </button>
          </div>

        {/* CONTROLS BAR (SEARCH AND FILTERS) */}
        <div className="mb-6 rounded-xl border border-slate-800/80 bg-[#070b1a]/95 p-4 backdrop-blur-md shadow-lg flex flex-col md:flex-row items-center gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              placeholder={
                activeTab === "purchased"
                  ? "Search purchased collectibles by title, notes or store..."
                  : "Search wishlist items by title, notes or store..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500/40 focus:outline-none focus:bg-slate-950"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Status Filter - Only shown for purchased tab */}
            {activeTab === "purchased" && (
              <div className="flex items-center gap-1.5 flex-1 md:flex-none">
                <span className="text-[11px] font-bold text-slate-400 uppercase hidden lg:inline tracking-wider">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full md:w-auto h-[34px] rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/45"
                >
                  <option value="all font-medium">All Purchased</option>
                  <option value="received">Received</option>
                  <option value="shipping">Shipping</option>
                  <option value="ordered">Ordered</option>
                </select>
              </div>
            )}

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 flex-1 md:flex-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase hidden lg:inline tracking-wider">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-auto h-[34px] rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/45"
              >
                <option value="all">All Categories</option>
                <option value="Manga">Manga</option>
                <option value="Light Novel">Light Novel</option>
                <option value="Fan Book">Fan Book</option>
                <option value="Keychains">Keychains</option>
                <option value="Acrylic Stands">Acrylic Stands</option>
                <option value="Badges">Badges</option>
                <option value="Mousepad">Mousepad</option>
                <option value="Photo">Photo</option>
                <option value="Photocard">Photocard</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#070b1a]/70 rounded-2xl border border-slate-900/40">
            <RefreshCw className="h-8 w-8 text-amber-300 animate-spin mb-3" />
            <p className="text-sm text-slate-400 font-display">Tuning celestial gears, fetching database logs...</p>
          </div>
        )}

        {/* ERROR OCCURRED */}
        {error && !isLoading && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-300 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <div className="text-xs">
              <p className="font-semibold">Local Storage Connection issue</p>
              <p className="text-slate-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* CARDS LIST GRID */}
        {!isLoading && (
          <>
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-[#070b1a]/40 backdrop-blur-md">
                <div className="w-16 h-16 rounded-full bg-amber-500/5 flex items-center justify-center border border-amber-500/10 mb-4 text-2xl">
                  ✨
                </div>
                <h3 className="text-lg font-bold font-display text-amber-200">No items detected</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                  {items.length === 0 
                    ? "Welcome to Princess Kaguya universe! Click 'Sought New Merch Link' to paste store URLs, convert prices to Malaysian Ringgit and curate your list, or click below to seed gorgeous preset collections."
                    : "No matches found. Try adjusting your search query, state toggles or category filters."
                  }
                </p>
                {items.length === 0 && (
                  <button
                    onClick={seedDefaultItems}
                    className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-4 py-2 text-xs font-bold text-amber-300 transition-colors"
                  >
                    <Sparkles size={14} />
                    <span>See Cold Start Tour & Examples</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <MerchCard
                    key={item.id}
                    item={item}
                    onEdit={(itemToEdit) => setEditingItem(itemToEdit)}
                    onDelete={handleDeleteItem}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </main>

      {/* MODAL SYSTEM (Add merch form) */}
      {(isAddOpen || editingItem) && (
        <AddMerchForm
          onClose={() => {
            setIsAddOpen(false);
            setEditingItem(null);
          }}
          onAdd={handleAddItem}
          initialItem={editingItem}
          onUpdate={handleUpdateItem}
        />
      )}
      </div>
    </div>
  );
}
