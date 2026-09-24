import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store';
import { Plus, X, Search, Sparkles } from 'lucide-react';

export function FeaturesDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { character, updateCharacterField, isEditMode } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureSource, setNewFeatureSource] = useState('Class');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');

  const features = character.features || [];

  const updateSingleFeature = (id: string, updates: Partial<typeof features[0]>) => {
    updateCharacterField(
      'features',
      features.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const filteredFeatures = features.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || f.source.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim()) return;
    const newFeature = {
      id: 'f-' + Date.now(),
      name: newFeatureName.trim(),
      source: newFeatureSource,
      description: newFeatureDesc.trim()
    };
    updateCharacterField('features', [...features, newFeature]);
    setNewFeatureName('');
    setNewFeatureDesc('');
    setIsAdding(false);
  };

  const handleDeleteFeature = (id: string) => {
    updateCharacterField('features', features.filter((f) => f.id !== id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-start pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer Left */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-xl bg-[#fcfbf9] border-r border-[#141414]/25 h-full flex flex-col shadow-2xl z-10 text-[#161616]"
          >
            {/* Header */}
            <div className="flex flex-col gap-4 p-6 border-b border-[#141414]/15 bg-white/90 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-display text-xl tracking-[0.2em] text-[#1a1a1a] flex items-center gap-2 font-bold">
                    <Sparkles className="w-5 h-5 text-[#1a1a1a]" />
                    FEATURES & TRAITS
                  </h2>
                  <p className="text-xs font-serif text-[#555555] mt-1">
                    Manage active racial, class, background, and feat features.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded border border-[#141414]/20 text-[#555555] hover:text-[#161616] hover:border-black/40 transition-colors cursor-pointer"
                  title="Close Features"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col gap-2.5 pt-1">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
                  <input
                    type="text"
                    placeholder="Search features & traits..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border border-[#141414]/20 pl-9 pr-3 py-2 text-[#161616] placeholder:text-[#888888] focus:outline-none focus:border-black/40 font-serif text-sm rounded shadow-xs"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {['All', 'Class', 'Species', 'Background', 'Feat'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      style={filter === f ? { backgroundColor: 'var(--accent-ink)', borderColor: 'var(--accent-ink)', color: '#ffffff' } : {}}
                      className={`spell-filter-tab whitespace-nowrap px-3 py-1 text-[10px] uppercase tracking-wider font-display border transition-all rounded-xs cursor-pointer ${
                        filter === f
                          ? 'text-white font-bold shadow-xs'
                          : 'border-[#141414]/15 bg-transparent text-[#4a4a4a] hover:border-black/25 hover:text-[#161616]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="px-6 py-2.5 bg-white/80 border-b border-[#141414]/15 flex justify-between items-center shadow-xs">
              <span className="text-[10px] font-display uppercase tracking-widest text-[#555555] font-bold">
                {filteredFeatures.length} {filteredFeatures.length === 1 ? 'Feature' : 'Features'}
              </span>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="text-[10px] font-display uppercase tracking-widest text-[var(--accent-ink)] hover:text-[#161616] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={12} /> {isAdding ? 'Cancel' : 'Add Custom Feature'}
              </button>
            </div>

            {/* Add Feature Form */}
            {isAdding && (
              <form onSubmit={handleAddFeature} className="p-4 bg-white/90 border-b border-[#141414]/15 flex flex-col gap-3 shadow-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Feature Name"
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    className="flex-1 bg-white border border-[#141414]/20 p-2 text-sm text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none font-serif rounded"
                    required
                  />
                  <select
                    value={newFeatureSource}
                    onChange={(e) => setNewFeatureSource(e.target.value)}
                    className="bg-white border border-[#141414]/20 p-2 text-xs text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none font-display uppercase rounded"
                  >
                    <option value="Class">Class</option>
                    <option value="Species">Species</option>
                    <option value="Background">Background</option>
                    <option value="Feat">Feat</option>
                    <option value="Item">Item</option>
                  </select>
                </div>
                <textarea
                  placeholder="Feature Description / Rules..."
                  value={newFeatureDesc}
                  onChange={(e) => setNewFeatureDesc(e.target.value)}
                  className="bg-white border border-[#141414]/20 p-2 text-xs text-[#161616] placeholder:text-[#888888] focus:border-[var(--accent-ink)] focus:outline-none font-serif h-20 resize-none hide-scrollbar rounded"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-[#1c1c1c] text-white hover:bg-[var(--accent-ink)] hover:drop-shadow-[0_0_6px_var(--accent-glow)] transition-all font-display text-[10px] uppercase tracking-widest font-bold rounded-xs cursor-pointer shadow-xs"
                >
                  Save Feature
                </button>
              </form>
            )}

            {/* Features List */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 hide-scrollbar">
              {filteredFeatures.length === 0 ? (
                <div className="text-center py-12 text-[#777777] font-serif italic text-sm">
                  No features found matching your criteria.
                </div>
              ) : (
                filteredFeatures.map((feat) => (
                  <div
                    key={feat.id}
                    className="border border-[#141414]/15 bg-white/90 p-4 flex flex-col gap-2 group hover:border-[var(--accent-ink)] transition-all rounded shadow-sm relative"
                  >
                    {isEditMode ? (
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={feat.name}
                            onChange={(e) => updateSingleFeature(feat.id, { name: e.target.value })}
                            className="bg-white border border-[#141414]/20 px-2 py-1 text-sm font-serif font-semibold text-[#161616] focus:border-[var(--accent-ink)] focus:outline-none flex-1 rounded"
                            placeholder="Feature Name"
                          />
                          <select
                            value={feat.source}
                            onChange={(e) => updateSingleFeature(feat.id, { source: e.target.value })}
                            className="bg-white border border-[#141414]/20 px-2 py-1 text-[10px] font-display uppercase tracking-wider text-[var(--accent-ink)] focus:border-[var(--accent-ink)] focus:outline-none rounded font-bold"
                          >
                            <option value="Class">Class</option>
                            <option value="Species">Species</option>
                            <option value="Background">Background</option>
                            <option value="Feat">Feat</option>
                            <option value="Item">Item</option>
                          </select>
                          <button
                            onClick={() => handleDeleteFeature(feat.id)}
                            className="text-[#777777] hover:text-[#E33526] transition-colors p-1 cursor-pointer"
                            title="Delete feature"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <textarea
                          value={feat.description}
                          onChange={(e) => updateSingleFeature(feat.id, { description: e.target.value })}
                          className="w-full bg-white border border-[#141414]/20 p-2 text-xs font-serif text-[#555555] focus:border-[var(--accent-ink)] focus:outline-none rounded h-16 resize-none"
                          placeholder="Feature description..."
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full border border-black/20 bg-[#fdfbf7] flex items-center justify-center shrink-0">
                              <img src="/vectors/icons/flame_48.svg" className="w-3.5 h-3.5 opacity-70" alt="Flame" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-serif text-[#161616] text-base font-semibold">{feat.name}</span>
                              <span className="text-[9px] font-display uppercase tracking-widest text-[var(--accent-ink)] font-bold">
                                Source: {feat.source}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteFeature(feat.id)}
                            className="text-[#777777] hover:text-[#E33526] transition-colors p-1 opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Delete feature"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <p className="text-xs font-serif text-[#555555] leading-relaxed pl-10">
                          {feat.description}
                        </p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
