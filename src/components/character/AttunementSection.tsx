import React, { useState } from 'react';
import { useStore } from '../../store';
import { Item } from '../../types';
import { TitleBanner } from '../common/TitleBanner';
import { FramedCard } from '../common/FramedCard';
import { GameItemIcon, IconPlaceholder } from '../ui/GameIcons';
import { Sparkles, Plus, X, ShieldAlert, Check } from 'lucide-react';
import { cn } from '../../utils';

export interface AttunementSectionProps {
  onSelectItem?: (item: Item) => void;
  onPickIcon?: (item: Item) => void;
  className?: string;
}

export const AttunementSection: React.FC<AttunementSectionProps> = ({
  onSelectItem,
  onPickIcon,
  className = '',
}) => {
  const { character, updateInventoryItem } = useStore();
  const [attunementError, setAttunementError] = useState<string | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const attunementSlots = 3;
  const attunedItems = character.inventory.filter((i) => i.attuned);
  const attunementCount = attunedItems.length;

  // Unattuned items available to attune
  const eligibleItems = character.inventory.filter((i) => !i.attuned);

  const handleToggleAttune = (item: Item) => {
    if (item.attuned) {
      updateInventoryItem(item.id, { attuned: false });
      setAttunementError(null);
    } else {
      if (attunementCount >= attunementSlots) {
        setAttunementError('All 3 attunement slots are occupied. Un-attune another item first.');
        setTimeout(() => setAttunementError(null), 4000);
        return;
      }
      setAttunementError(null);
      updateInventoryItem(item.id, { attuned: true, requiresAttunement: true });
      setIsSelectorOpen(false);
    }
  };

  const getRaritySocketGlow = (rarity?: string) => {
    const r = (rarity || '').toLowerCase();
    if (r.includes('very rare') || r.includes('epic')) {
      return 'shadow-[0_0_10px_rgba(168,85,247,0.35)]';
    }
    if (r.includes('rare')) {
      return 'shadow-[0_0_10px_rgba(59,130,246,0.35)]'; // Soft sapphire glow
    }
    if (r.includes('uncommon')) {
      return 'shadow-[0_0_10px_rgba(34,197,94,0.3)]'; // Soft emerald glow
    }
    if (r.includes('legendary') || r.includes('artifact')) {
      return 'shadow-[0_0_10px_rgba(234,179,8,0.4)]'; // Soft radiant gold glow
    }
    return 'shadow-[0_0_8px_rgba(201,150,61,0.25)]';
  };

  return (
    <div className={cn('flex flex-col gap-2.5 pb-2 select-none', className)}>
      {/* Attunement Title Banner */}
      <TitleBanner
        title="Attunement"
        icon={<Sparkles size={13} className="text-[#1a1a1a]" />}
        subtitle="Magical Bindings"
        status={
          <span className="text-[11px] font-serif">
            Attuned: <strong className="text-[#1a1a1a] font-bold">{attunementCount}</strong> / {attunementSlots}
          </span>
        }
      />

      {/* Error Alert */}
      {attunementError && (
        <div className="bg-[#E33526]/15 border border-[#E33526]/40 text-[#c53030] text-xs font-serif p-2 rounded-sm flex items-center gap-2 animate-in fade-in duration-200">
          <ShieldAlert size={14} className="text-[#E33526] shrink-0" />
          <span>{attunementError}</span>
        </div>
      )}

      {/* Vertical Stack of Wide Horizontal Rectangular Cards */}
      <div className="flex flex-col gap-2.5 pt-1">
        {Array.from({ length: attunementSlots }).map((_, index) => {
          const attunedItem = attunedItems[index];

          if (attunedItem) {
            const socketGlow = getRaritySocketGlow(attunedItem.rarity);

            return (
              <FramedCard
                key={attunedItem.id}
                variant="default"
                cornerSize={20}
                interactive
                onClick={() => onSelectItem?.(attunedItem)}
                className="transition-all duration-200 border-black/20 hover:border-[var(--accent-ink)] shadow-sm group/attunecard"
                contentClassName="p-2.5 sm:p-3"
                title={`${attunedItem.name} (Click to inspect)`}
              >
                <div className="flex items-center justify-between gap-3 min-w-0">
                  {/* Left: Item Icon Socket (48x48px w-12 h-12 with clean border) */}
                  <div
                    onClick={(e) => {
                      if (onPickIcon) {
                        e.stopPropagation();
                        onPickIcon(attunedItem);
                      }
                    }}
                    className={cn(
                      'relative w-12 h-12 shrink-0 rounded bg-white/90 border border-black/20 group-hover/attunecard:border-[var(--accent-ink)] flex items-center justify-center group/icon transition-all cursor-pointer overflow-hidden p-0.5 shadow-xs',
                      socketGlow
                    )}
                    title="Change icon"
                  >
                    <GameItemIcon
                      item={attunedItem}
                      size={44}
                      className="w-full h-full border-0 bg-transparent relative z-10 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] group-hover/icon:scale-105 transition-transform"
                    />
                  </div>

                  {/* Center: Item Title & Subtitle */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center pr-1">
                    <h4 className="text-sm font-serif font-bold text-[#161616] leading-tight group-hover/attunecard:text-[#000000] transition-colors">
                      {attunedItem.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-serif text-[#555555] capitalize flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-ink)]" />
                        {attunedItem.rarity || 'Attuned'} {attunedItem.type ? `• ${attunedItem.type}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Right: UN-ATTUNE Plaque Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAttune(attunedItem);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-xs bg-[#1c1c1c] hover:bg-[var(--accent-ink)] border border-black/40 text-[10px] sm:text-[11px] font-display uppercase tracking-wider text-white hover:drop-shadow-[0_0_6px_var(--accent-glow)] transition-all active:scale-95 cursor-pointer font-bold shadow-xs"
                    title={`Un-attune ${attunedItem.name}`}
                  >
                    UN-ATTUNE
                  </button>
                </div>
              </FramedCard>
            );
          }

          // Empty Slot State: Faded/Dashed Rectangular Placeholder Card
          return (
            <FramedCard
              key={`empty-${index}`}
              variant="default"
              cornerSize={20}
              interactive
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className="border-dashed border-[#141414]/20 hover:border-black/40 bg-white/40"
              contentClassName="p-2 sm:p-2.5"
              title="Empty Attunement Slot (Click to attune an item)"
            >
              <div className="flex items-center justify-between gap-3 min-w-0">
                {/* Left: Dimmed Socket */}
                <div className="w-12 h-12 shrink-0 rounded bg-white/60 border border-dashed border-[#141414]/20 flex items-center justify-center text-[#777777] overflow-hidden p-1">
                  <IconPlaceholder size={32} className="w-full h-full opacity-40 border-0 bg-transparent flex items-center justify-center" />
                </div>

                {/* Center: Slot Label */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-display tracking-wider uppercase text-[#1a1a1a] font-bold">
                    Slot {index + 1}
                  </div>
                  <div className="text-[10px] font-serif text-[#777777]">
                    Empty attunement slot
                  </div>
                </div>

                {/* Right: + Attune Item Action Tag */}
                <span className="shrink-0 text-[10px] font-display font-bold text-[#1a1a1a] hover:text-[#000000] uppercase tracking-wider flex items-center gap-1 transition-colors px-2.5 py-1 rounded bg-white/[0.92] hover:bg-white border border-black/20 hover:border-[var(--accent-ink)] cursor-pointer shadow-xs">
                  <Plus size={12} /> Attune Item
                </span>
              </div>
            </FramedCard>
          );
        })}
      </div>

      {/* Quick Item Attunement Selector Drawer / Popover */}
      {isSelectorOpen && (
        <div className="mt-1 p-3 bg-white/95 border border-black/20 rounded shadow-xl flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150 text-[#161616]">
          <div className="flex items-center justify-between border-b border-[#141414]/15 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#1a1a1a]" />
              <span className="text-xs font-display uppercase tracking-wider text-[#1a1a1a] font-bold">
                Select Item to Attune
              </span>
            </div>
            <button
              onClick={() => setIsSelectorOpen(false)}
              className="text-[#777777] hover:text-[#161616] cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
            {eligibleItems.length === 0 ? (
              <div className="p-3 text-center text-xs font-serif text-[#777777] italic">
                No available items in inventory to attune.
              </div>
            ) : (
              eligibleItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleAttune(item)}
                  className="flex items-center justify-between p-2 rounded bg-white/80 hover:bg-white border border-[#141414]/10 hover:border-black/30 transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GameItemIcon item={item} size={28} className="shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-serif font-bold text-[#161616] group-hover:text-[#000000] truncate">
                        {item.name}
                      </span>
                      <span className="text-[9px] font-serif text-[#777777]">
                        {item.rarity || 'Common'} • {item.type || 'gear'}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 px-2 py-0.5 rounded text-[9px] font-display uppercase tracking-wider font-bold bg-white border border-black/20 text-[#1a1a1a] group-hover:bg-[var(--accent-ink)] group-hover:text-white transition-colors">
                    Attune
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttunementSection;
