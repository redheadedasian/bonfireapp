import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GAME_ICONS_CATALOG, GameIconEntry } from '../../data/gameIconsCatalog';
import { Search, X, Check, Sparkles, Swords, Shield, Wand2, Package, RefreshCw } from 'lucide-react';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconUrl: string) => void;
  currentItemName?: string;
  itemName?: string;
  category?: string;
  initialCategory?: string;
}

export function getDriveIconThumbnailUrl(driveId: string, size = 128): string {
  return `https://lh3.googleusercontent.com/d/${driveId}=w${size}`;
}

export function IconPickerModal({
  isOpen,
  onClose,
  onSelectIcon,
  currentItemName,
  itemName,
  category,
  initialCategory
}: IconPickerModalProps) {
  const initialSearch = itemName ?? currentItemName ?? '';
  const initialCat = initialCategory ?? category ?? 'all';
  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 60;

  // Filter & match catalog
  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qWords = q.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 1);

    return GAME_ICONS_CATALOG.filter(ico => {
      // Category filter
      if (activeCategory !== 'all' && ico.c !== activeCategory) {
        return false;
      }
      // Search filter
      if (qWords.length === 0) return true;
      const lowerName = ico.n.toLowerCase();
      return qWords.every(word => lowerName.includes(word));
    });
  }, [search, activeCategory]);

  const totalPages = Math.ceil(filteredIcons.length / ITEMS_PER_PAGE);
  const displayedIcons = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredIcons.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredIcons, page]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#fcfbf9] border-2 border-black/30 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden text-[#161616]"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#141414]/15 flex items-center justify-between bg-white/90">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-[var(--accent-ink)]" />
            <h3 className="font-display font-bold text-lg text-[#161616] uppercase tracking-wider">Icon Vault</h3>
            <span className="text-xs font-mono text-[#555555] px-2 py-0.5 rounded bg-black/5 border border-black/10 font-bold">
              {filteredIcons.length} of {GAME_ICONS_CATALOG.length} Icons
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#555555] hover:text-[#161616] transition-colors rounded hover:bg-black/5 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-[#141414]/15 bg-white/70 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search 2,800+ icons..."
              className="w-full bg-white border border-[#141414]/20 rounded pl-8 pr-3 py-1.5 text-xs text-[#161616] placeholder-[#888888] focus:border-[var(--accent-ink)] focus:outline-none font-serif shadow-xs"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#161616] cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
            {[
              { id: 'all', label: 'All', icon: Package },
              { id: 'weapon', label: 'Weapons', icon: Swords },
              { id: 'armor', label: 'Armor', icon: Shield },
              { id: 'spell', label: 'Spells/Scrolls', icon: Wand2 },
              { id: 'consumable', label: 'Consumables', icon: Sparkles }
            ].map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setPage(1);
                  }}
                  style={isActive ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                  className={`px-2.5 py-1 text-[11px] font-display uppercase tracking-wider rounded border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-white font-bold shadow-xs'
                      : 'border-[#141414]/15 bg-white text-[#555555] hover:text-[#161616] hover:border-black/30'
                  }`}
                >
                  <Icon size={12} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[50vh] bg-[#fcfbf9]">
          {displayedIcons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#555555] gap-2">
              <Package size={32} className="opacity-40" />
              <p className="text-xs font-mono">No matching icons found for &ldquo;{search}&rdquo;</p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('all'); }}
                className="mt-2 text-xs text-[var(--accent-ink)] hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <RefreshCw size={12} /> Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5">
              {displayedIcons.map((ico) => {
                const url = getDriveIconThumbnailUrl(ico.i, 128);
                const readableName = ico.n
                  .replace(/^Item_|^Generated_|^GEN_/, '')
                  .replace(/_/g, ' ');

                return (
                  <button
                    key={ico.i}
                    onClick={() => {
                      onSelectIcon(url);
                      onClose();
                    }}
                    title={readableName}
                    className="group relative aspect-square rounded overflow-hidden bg-white border border-[#141414]/20 hover:border-black hover:scale-105 p-0.5 flex items-center justify-center transition-all shadow-xs focus:outline-none cursor-pointer"
                  >
                    <img
                      src={url}
                      alt={readableName}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity pointer-events-none">
                      <Check size={14} className="text-white" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination & Footer */}
        <div className="p-3 border-t border-[#141414]/15 bg-white/90 flex items-center justify-between text-xs font-mono text-[#555555]">
          <span className="font-bold">
            Page {page} of {Math.max(1, totalPages)}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded border border-[#141414]/20 bg-white disabled:opacity-40 hover:border-black text-[#161616] font-display uppercase tracking-wider font-bold transition-colors cursor-pointer shadow-xs"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded border border-[#141414]/20 bg-white disabled:opacity-40 hover:border-black text-[#161616] font-display uppercase tracking-wider font-bold transition-colors cursor-pointer shadow-xs"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
