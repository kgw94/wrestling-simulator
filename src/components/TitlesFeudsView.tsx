import React, { useState, useMemo } from 'react';
import { 
  Promotion, 
  Feud, 
  Championship, 
  Wrestler, 
  ChampionshipType, 
  TitleDivision, 
  BeltStrapColor, 
  BeltPlateStyle, 
  ChampionshipHistoryEntry 
} from '../types';
import { CHAMPIONSHIP_TEMPLATES } from '../data/customDefaults';
import { MarkdownTableView } from './MarkdownTableView';
import { 
  getChampionshipGender, 
  isWrestlerEligibleForTitle, 
  getChampionshipGenderBadge, 
  filterEligibleWrestlersForTitle 
} from '../utils/titleUtils';
import { 
  Trophy, 
  Flame, 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  Crown, 
  History, 
  Sparkles, 
  Award, 
  Star, 
  Clock, 
  Calendar, 
  Check, 
  X, 
  Shield, 
  Search, 
  Filter, 
  RotateCcw, 
  AlertTriangle, 
  Layers, 
  Users, 
  Zap,
  BookOpen
} from 'lucide-react';

interface TitlesFeudsViewProps {
  promotion: Promotion;
  currentWeek?: number;
  currentYear?: number;
  onUpdatePromotion: (newPromotion: Promotion) => void;
  onBackToMenu: () => void;
}

export const TitlesFeudsView: React.FC<TitlesFeudsViewProps> = ({
  promotion,
  currentWeek = 1,
  currentYear = 1,
  onUpdatePromotion,
  onBackToMenu
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'championships' | 'lineage' | 'records' | 'feuds'>('championships');

  // Filters & selection
  const [titleFilter, setTitleFilter] = useState<'all' | 'active' | 'retired' | 'singles' | 'tag' | 'womens'>('active');
  const [titleSearch, setTitleSearch] = useState('');
  const [selectedTitleIdForLineage, setSelectedTitleIdForLineage] = useState<string>(
    promotion.titles[0]?.id || ''
  );

  // Modals
  const [isCreatingTitle, setIsCreatingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState<Championship | null>(null);
  const [isCreatingFeud, setIsCreatingFeud] = useState(false);
  
  // History Editor Modals
  const [isAddingHistoryReign, setIsAddingHistoryReign] = useState(false);
  const [editingHistoryReign, setEditingHistoryReign] = useState<{
    titleId: string;
    reignIndex: number;
    reign: ChampionshipHistoryEntry;
  } | null>(null);

  // Form State: New / Edit Title
  const [titleForm, setTitleForm] = useState<{
    id?: string;
    name: string;
    shortName: string;
    type: ChampionshipType;
    division: TitleDivision;
    gender: 'Male' | 'Female' | 'Open';
    prestige: number;
    isTagTeam: boolean;
    strapColor: BeltStrapColor;
    plateStyle: BeltPlateStyle;
    minWorkrateBonus: number;
    description: string;
    initialHolderId: string;
    initialHolder2Id: string; // for tag teams
    defenses: number;
  }>({
    name: '',
    shortName: '',
    type: 'World / Primary',
    division: 'Openweight',
    gender: 'Male',
    prestige: 85,
    isTagTeam: false,
    strapColor: 'Classic Black',
    plateStyle: 'Big Gold Classic',
    minWorkrateBonus: 5,
    description: '',
    initialHolderId: '',
    initialHolder2Id: '',
    defenses: 0
  });

  // Form State: Add/Edit Historic Reign
  const [reignForm, setReignForm] = useState<{
    holderNames: string;
    wonWeek: number;
    wonYear: number;
    lostWeek?: number;
    lostYear?: number;
    defenses: number;
    eventWonAt: string;
    notes: string;
    reignRating: string;
    isCurrent: boolean;
  }>({
    holderNames: '',
    wonWeek: 1,
    wonYear: 1,
    lostWeek: undefined,
    lostYear: undefined,
    defenses: 0,
    eventWonAt: 'Flagship PPV',
    notes: 'Won via clean pinfall',
    reignRating: '★★★★1/4',
    isCurrent: false
  });

  // Feud state
  const [feudName, setFeudName] = useState('');
  const [wrestlerAId, setWrestlerAId] = useState('');
  const [wrestlerBId, setWrestlerBId] = useState('');
  const [feudDescription, setFeudDescription] = useState('');

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  const getStrapColorStyle = (color?: BeltStrapColor) => {
    switch (color) {
      case 'Pure White':
        return {
          bg: 'bg-zinc-100',
          border: 'border-zinc-300',
          text: 'text-zinc-950',
          preview: 'from-zinc-100 to-zinc-200 text-zinc-900 border-zinc-400'
        };
      case 'Crimson Red':
        return {
          bg: 'bg-rose-950',
          border: 'border-rose-800',
          text: 'text-rose-200',
          preview: 'from-rose-900 to-red-950 text-rose-100 border-rose-700'
        };
      case 'Midnight Blue':
        return {
          bg: 'bg-blue-950',
          border: 'border-blue-800',
          text: 'text-blue-200',
          preview: 'from-blue-900 to-indigo-950 text-blue-100 border-blue-700'
        };
      case 'Toxic Purple':
        return {
          bg: 'bg-purple-950',
          border: 'border-purple-800',
          text: 'text-purple-200',
          preview: 'from-purple-900 to-fuchsia-950 text-purple-100 border-purple-700'
        };
      case 'Championship Gold':
        return {
          bg: 'bg-amber-950',
          border: 'border-amber-700',
          text: 'text-amber-200',
          preview: 'from-amber-800 to-yellow-950 text-amber-100 border-amber-500'
        };
      case 'Emerald Green':
        return {
          bg: 'bg-emerald-950',
          border: 'border-emerald-800',
          text: 'text-emerald-200',
          preview: 'from-emerald-900 to-teal-950 text-emerald-100 border-emerald-700'
        };
      case 'Classic Black':
      default:
        return {
          bg: 'bg-zinc-950',
          border: 'border-zinc-800',
          text: 'text-zinc-200',
          preview: 'from-zinc-900 to-black text-zinc-100 border-zinc-700'
        };
    }
  };

  const getPlateBadge = (style?: BeltPlateStyle) => {
    switch (style) {
      case 'Big Gold Classic':
        return { name: 'Big Gold Classic', icon: Crown, color: 'text-amber-300' };
      case 'Eagle Crest':
        return { name: 'Eagle Crest', icon: Sparkles, color: 'text-amber-400' };
      case 'Winged Globe':
        return { name: 'Winged Globe', icon: Trophy, color: 'text-amber-300' };
      case 'Crown & Regal Lions':
        return { name: 'Crown & Lions', icon: Crown, color: 'text-amber-200' };
      case 'Skull & Barbed Wire':
        return { name: 'Hardcore Skull', icon: Flame, color: 'text-rose-400' };
      case 'Modern Geometric Diamond':
        return { name: 'Modern Diamond', icon: Shield, color: 'text-sky-300' };
      case 'Vintage Oval Heavyweight':
        return { name: 'Vintage Oval', icon: Award, color: 'text-yellow-500' };
      default:
        return { name: 'Standard Gold', icon: Trophy, color: 'text-amber-400' };
    }
  };

  // -------------------------------------------------------------
  // Filtered Titles
  // -------------------------------------------------------------
  const filteredTitles = useMemo(() => {
    return promotion.titles.filter(t => {
      // Search filter
      if (titleSearch.trim()) {
        const query = titleSearch.toLowerCase();
        const holderNames = t.currentHolderIds
          .map(id => promotion.roster.find(w => w.id === id)?.name || id)
          .join(' ')
          .toLowerCase();
        const matchesName = t.name.toLowerCase().includes(query) || (t.shortName && t.shortName.toLowerCase().includes(query));
        const matchesHolder = holderNames.includes(query);
        if (!matchesName && !matchesHolder) return false;
      }

      // Status / Category filter
      if (titleFilter === 'active') return !t.isRetired;
      if (titleFilter === 'retired') return !!t.isRetired;
      if (titleFilter === 'singles') return !t.isTagTeam && !t.isRetired;
      if (titleFilter === 'tag') return !!t.isTagTeam && !t.isRetired;
      if (titleFilter === 'womens') return t.division === 'Women' || t.type === 'Women\'s';
      return true;
    });
  }, [promotion.titles, promotion.roster, titleFilter, titleSearch]);

  const selectedTitleForLineage = useMemo(() => {
    return promotion.titles.find(t => t.id === selectedTitleIdForLineage) || promotion.titles[0];
  }, [promotion.titles, selectedTitleIdForLineage]);

  // -------------------------------------------------------------
  // Title Actions: Vacate, Award, Retire, Reactivate, Delete
  // -------------------------------------------------------------
  const handleVacateTitle = (titleId: string) => {
    const title = promotion.titles.find(t => t.id === titleId);
    if (!title) return;

    const updatedTitles = promotion.titles.map(t => {
      if (t.id === titleId) {
        // Conclude current reign in history if active
        const updatedHistory = [...t.history];
        if (updatedHistory.length > 0 && updatedHistory[0].isCurrent !== false && !updatedHistory[0].lostWeek) {
          updatedHistory[0] = {
            ...updatedHistory[0],
            lostWeek: currentWeek,
            lostYear: currentYear,
            isCurrent: false,
            notes: (updatedHistory[0].notes ? updatedHistory[0].notes + ' • ' : '') + 'Vacated by Head Booker'
          };
        }
        return { ...t, currentHolderIds: [], defenses: 0, history: updatedHistory };
      }
      return t;
    });

    const updatedRoster = promotion.roster.map(w => ({
      ...w,
      championshipIds: w.championshipIds.filter(id => id !== titleId)
    }));

    onUpdatePromotion({
      ...promotion,
      titles: updatedTitles,
      roster: updatedRoster
    });
  };

  const handleAwardTitle = (titleId: string, wrestlerIds: string[]) => {
    if (wrestlerIds.length === 0) return;
    const winners = wrestlerIds
      .map(id => promotion.roster.find(w => w.id === id))
      .filter(Boolean) as Wrestler[];
    if (winners.length === 0) return;

    const winnerNames = winners.map(w => w.name).join(' & ');

    const updatedTitles = promotion.titles.map(t => {
      if (t.id === titleId) {
        const updatedHistory = [...t.history];
        if (updatedHistory.length > 0 && !updatedHistory[0].lostWeek) {
          updatedHistory[0] = {
            ...updatedHistory[0],
            lostWeek: currentWeek,
            lostYear: currentYear,
            isCurrent: false
          };
        }

        const newReign: ChampionshipHistoryEntry = {
          id: `reign-${Date.now()}-${Math.random()}`,
          reignNumber: t.history.length + 1,
          holderNames: winnerNames,
          holderIds: wrestlerIds,
          wonWeek: currentWeek,
          wonYear: currentYear,
          defenses: 0,
          eventWonAt: 'Awarded by Booker Decision',
          notes: 'Awarded championship gold by executive order',
          reignRating: '★★★★',
          isCurrent: true
        };

        return {
          ...t,
          currentHolderIds: wrestlerIds,
          defenses: 0,
          history: [newReign, ...updatedHistory]
        };
      }
      return t;
    });

    const updatedRoster = promotion.roster.map(w => {
      if (wrestlerIds.includes(w.id)) {
        return { 
          ...w, 
          championshipIds: Array.from(new Set([...w.championshipIds, titleId])),
          morale: Math.min(100, w.morale + 10)
        };
      }
      // If someone else held it, remove
      const title = promotion.titles.find(t => t.id === titleId);
      if (title && title.currentHolderIds.includes(w.id)) {
        return {
          ...w,
          championshipIds: w.championshipIds.filter(id => id !== titleId)
        };
      }
      return w;
    });

    onUpdatePromotion({
      ...promotion,
      titles: updatedTitles,
      roster: updatedRoster
    });
  };

  const handleRetireTitle = (titleId: string) => {
    const updatedTitles = promotion.titles.map(t => {
      if (t.id === titleId) {
        // Conclude current reign if active
        const updatedHistory = [...t.history];
        if (updatedHistory.length > 0 && !updatedHistory[0].lostWeek) {
          updatedHistory[0] = {
            ...updatedHistory[0],
            lostWeek: currentWeek,
            lostYear: currentYear,
            isCurrent: false,
            notes: (updatedHistory[0].notes ? updatedHistory[0].notes + ' • ' : '') + 'Belt Retired'
          };
        }
        return {
          ...t,
          isRetired: true,
          retiredWeek: currentWeek,
          retiredYear: currentYear,
          currentHolderIds: [],
          defenses: 0,
          history: updatedHistory
        };
      }
      return t;
    });

    const updatedRoster = promotion.roster.map(w => ({
      ...w,
      championshipIds: w.championshipIds.filter(id => id !== titleId)
    }));

    onUpdatePromotion({
      ...promotion,
      titles: updatedTitles,
      roster: updatedRoster
    });
  };

  const handleReactivateTitle = (titleId: string) => {
    const updatedTitles = promotion.titles.map(t => {
      if (t.id === titleId) {
        return {
          ...t,
          isRetired: false,
          retiredWeek: undefined,
          retiredYear: undefined
        };
      }
      return t;
    });

    onUpdatePromotion({
      ...promotion,
      titles: updatedTitles
    });
  };

  const handleDeleteTitle = (titleId: string) => {
    if (promotion.titles.length <= 1) {
      alert('You must keep at least one championship in your promotion.');
      return;
    }
    const updatedTitles = promotion.titles.filter(t => t.id !== titleId);
    const updatedRoster = promotion.roster.map(w => ({
      ...w,
      championshipIds: w.championshipIds.filter(id => id !== titleId)
    }));

    onUpdatePromotion({
      ...promotion,
      titles: updatedTitles,
      roster: updatedRoster
    });

    if (selectedTitleIdForLineage === titleId) {
      setSelectedTitleIdForLineage(updatedTitles[0]?.id || '');
    }
    setEditingTitle(null);
  };

  // -------------------------------------------------------------
  // Open / Save Title Customization
  // -------------------------------------------------------------
  const handleOpenCreateTitle = () => {
    setTitleForm({
      name: '',
      shortName: '',
      type: 'World / Primary',
      division: 'Openweight',
      gender: 'Male',
      prestige: 80,
      isTagTeam: false,
      strapColor: 'Classic Black',
      plateStyle: 'Big Gold Classic',
      minWorkrateBonus: 5,
      description: '',
      initialHolderId: '',
      initialHolder2Id: '',
      defenses: 0
    });
    setIsCreatingTitle(true);
  };

  const handleApplyTemplate = (tpl: typeof CHAMPIONSHIP_TEMPLATES[0]) => {
    const inferredGender = (tpl.division === 'Women' || tpl.type === "Women's") ? 'Female' : 'Male';
    setTitleForm(prev => ({
      ...prev,
      name: tpl.name,
      shortName: tpl.shortName,
      type: tpl.type,
      division: tpl.division,
      gender: inferredGender,
      prestige: tpl.prestige,
      isTagTeam: tpl.isTagTeam,
      strapColor: tpl.strapColor,
      plateStyle: tpl.plateStyle,
      minWorkrateBonus: tpl.minWorkrateBonus,
      description: tpl.description
    }));
  };

  const handleSaveNewTitle = () => {
    if (!titleForm.name.trim()) return;

    const newId = `title-${Date.now()}`;
    const initialHolders: string[] = [];
    if (titleForm.initialHolderId) initialHolders.push(titleForm.initialHolderId);
    if (titleForm.isTagTeam && titleForm.initialHolder2Id && titleForm.initialHolder2Id !== titleForm.initialHolderId) {
      initialHolders.push(titleForm.initialHolder2Id);
    }

    const winnerNames = initialHolders
      .map(id => promotion.roster.find(w => w.id === id)?.name || id)
      .join(' & ');

    const initialHistory: ChampionshipHistoryEntry[] = [];
    if (initialHolders.length > 0) {
      initialHistory.push({
        id: `reign-${Date.now()}-init`,
        reignNumber: 1,
        holderNames: winnerNames,
        holderIds: initialHolders,
        wonWeek: currentWeek,
        wonYear: currentYear,
        defenses: titleForm.defenses || 0,
        eventWonAt: 'Inaugural Crowning',
        notes: 'Inaugural championship holder declared upon belt creation',
        reignRating: '★★★★1/2',
        isCurrent: true
      });
    }

    const newChampionship: Championship = {
      id: newId,
      name: titleForm.name.trim(),
      shortName: titleForm.shortName.trim() || titleForm.name.slice(0, 4).toUpperCase(),
      type: titleForm.type,
      division: titleForm.division,
      gender: titleForm.gender,
      prestige: titleForm.prestige,
      isTagTeam: titleForm.isTagTeam,
      currentHolderIds: initialHolders,
      defenses: titleForm.defenses || 0,
      strapColor: titleForm.strapColor,
      plateStyle: titleForm.plateStyle,
      minWorkrateBonus: titleForm.minWorkrateBonus,
      description: titleForm.description.trim() || 'A prestigious championship forged for world-class competition.',
      history: initialHistory
    };

    const updatedRoster = promotion.roster.map(w => {
      if (initialHolders.includes(w.id)) {
        return {
          ...w,
          championshipIds: [...w.championshipIds, newId],
          morale: Math.min(100, w.morale + 10)
        };
      }
      return w;
    });

    onUpdatePromotion({
      ...promotion,
      titles: [...promotion.titles, newChampionship],
      roster: updatedRoster
    });

    setIsCreatingTitle(false);
    setSelectedTitleIdForLineage(newId);
  };

  const handleOpenEditTitle = (title: Championship) => {
    setEditingTitle(title);
    setTitleForm({
      id: title.id,
      name: title.name,
      shortName: title.shortName || '',
      type: title.type || 'World / Primary',
      division: title.division || (title.isTagTeam ? 'Tag Team' : 'Openweight'),
      gender: title.gender || getChampionshipGender(title),
      prestige: title.prestige,
      isTagTeam: !!title.isTagTeam,
      strapColor: title.strapColor || 'Classic Black',
      plateStyle: title.plateStyle || 'Big Gold Classic',
      minWorkrateBonus: title.minWorkrateBonus || 0,
      description: title.description || '',
      initialHolderId: title.currentHolderIds[0] || '',
      initialHolder2Id: title.currentHolderIds[1] || '',
      defenses: title.defenses || 0
    });
  };

  const handleSaveEditedTitle = () => {
    if (!editingTitle || !titleForm.name.trim()) return;

    const targetId = editingTitle.id;
    const oldHolders = editingTitle.currentHolderIds;
    const newHolders: string[] = [];
    if (titleForm.initialHolderId) newHolders.push(titleForm.initialHolderId);
    if (titleForm.isTagTeam && titleForm.initialHolder2Id && titleForm.initialHolder2Id !== titleForm.initialHolderId) {
      newHolders.push(titleForm.initialHolder2Id);
    }

    const holdersChanged = 
      oldHolders.length !== newHolders.length || 
      !oldHolders.every(h => newHolders.includes(h));

    const updatedTitles = promotion.titles.map(t => {
      if (t.id === targetId) {
        let history = [...t.history];

        if (holdersChanged) {
          // Close prior reign if was open
          if (history.length > 0 && !history[0].lostWeek) {
            history[0] = {
              ...history[0],
              lostWeek: currentWeek,
              lostYear: currentYear,
              isCurrent: false
            };
          }

          if (newHolders.length > 0) {
            const winnerNames = newHolders
              .map(id => promotion.roster.find(w => w.id === id)?.name || id)
              .join(' & ');

            history.unshift({
              id: `reign-${Date.now()}-${Math.random()}`,
              reignNumber: history.length + 1,
              holderNames: winnerNames,
              holderIds: newHolders,
              wonWeek: currentWeek,
              wonYear: currentYear,
              defenses: titleForm.defenses || 0,
              eventWonAt: 'Awarded by Booker',
              notes: 'Championship awarded via customizer adjustment',
              reignRating: '★★★★',
              isCurrent: true
            });
          }
        } else if (history.length > 0 && history[0].isCurrent !== false) {
          // Just update defenses on active reign
          history[0] = {
            ...history[0],
            defenses: titleForm.defenses
          };
        }

        return {
          ...t,
          name: titleForm.name.trim(),
          shortName: titleForm.shortName.trim() || t.name.slice(0, 4).toUpperCase(),
          type: titleForm.type,
          division: titleForm.division,
          gender: titleForm.gender,
          prestige: Math.max(1, Math.min(100, titleForm.prestige)),
          isTagTeam: titleForm.isTagTeam,
          currentHolderIds: newHolders,
          defenses: titleForm.defenses,
          strapColor: titleForm.strapColor,
          plateStyle: titleForm.plateStyle,
          minWorkrateBonus: titleForm.minWorkrateBonus,
          description: titleForm.description.trim(),
          history
        };
      }
      return t;
    });

    const updatedRoster = promotion.roster.map(w => {
      let ids = w.championshipIds.filter(id => id !== targetId);
      if (newHolders.includes(w.id)) {
        ids.push(targetId);
      }
      return {
        ...w,
        championshipIds: ids
      };
    });

    onUpdatePromotion({
      ...promotion,
      titles: updatedTitles,
      roster: updatedRoster
    });

    setEditingTitle(null);
  };

  // -------------------------------------------------------------
  // History Lineage Editor Actions
  // -------------------------------------------------------------
  const handleOpenAddReign = () => {
    setReignForm({
      holderNames: '',
      wonWeek: Math.max(1, currentWeek - 10),
      wonYear: currentYear,
      lostWeek: currentWeek,
      lostYear: currentYear,
      defenses: 3,
      eventWonAt: 'Pay-Per-View Main Event',
      notes: 'Clean pinfall after 30-minute classic',
      reignRating: '★★★★1/2',
      isCurrent: false
    });
    setIsAddingHistoryReign(true);
  };

  const handleSaveNewReign = () => {
    if (!reignForm.holderNames.trim() || !selectedTitleForLineage) return;

    const newReign: ChampionshipHistoryEntry = {
      id: `reign-custom-${Date.now()}`,
      reignNumber: selectedTitleForLineage.history.length + 1,
      holderNames: reignForm.holderNames.trim(),
      wonWeek: reignForm.wonWeek,
      wonYear: reignForm.wonYear,
      lostWeek: reignForm.isCurrent ? undefined : reignForm.lostWeek,
      lostYear: reignForm.isCurrent ? undefined : reignForm.lostYear,
      defenses: reignForm.defenses,
      eventWonAt: reignForm.eventWonAt.trim() || 'Television Broadcast',
      notes: reignForm.notes.trim() || 'Historic Championship Reign',
      reignRating: reignForm.reignRating || '★★★★',
      isCurrent: reignForm.isCurrent
    };

    const updatedTitles = promotion.titles.map(t => {
      if (t.id === selectedTitleForLineage.id) {
        return {
          ...t,
          history: [newReign, ...t.history]
        };
      }
      return t;
    });

    onUpdatePromotion({
      ...promotion,
      titles: updatedTitles
    });

    setIsAddingHistoryReign(false);
  };

  const handleOpenEditReign = (titleId: string, idx: number, reign: ChampionshipHistoryEntry) => {
    setEditingHistoryReign({ titleId, reignIndex: idx, reign });
    setReignForm({
      holderNames: reign.holderNames,
      wonWeek: reign.wonWeek,
      wonYear: reign.wonYear || 1,
      lostWeek: reign.lostWeek,
      lostYear: reign.lostYear || 1,
      defenses: reign.defenses,
      eventWonAt: reign.eventWonAt || 'Weekly TV',
      notes: reign.notes || '',
      reignRating: reign.reignRating || '★★★★',
      isCurrent: !!reign.isCurrent
    });
  };

  const handleSaveEditedReign = () => {
    if (!editingHistoryReign || !reignForm.holderNames.trim()) return;

    const { titleId, reignIndex } = editingHistoryReign;
    const updatedTitles = promotion.titles.map(t => {
      if (t.id === titleId) {
        const newHistory = [...t.history];
        newHistory[reignIndex] = {
          ...newHistory[reignIndex],
          holderNames: reignForm.holderNames.trim(),
          wonWeek: reignForm.wonWeek,
          wonYear: reignForm.wonYear,
          lostWeek: reignForm.isCurrent ? undefined : reignForm.lostWeek,
          lostYear: reignForm.isCurrent ? undefined : reignForm.lostYear,
          defenses: reignForm.defenses,
          eventWonAt: reignForm.eventWonAt,
          notes: reignForm.notes,
          reignRating: reignForm.reignRating,
          isCurrent: reignForm.isCurrent
        };
        return {
          ...t,
          history: newHistory
        };
      }
      return t;
    });

    onUpdatePromotion({
      ...promotion,
      titles: updatedTitles
    });

    setEditingHistoryReign(null);
  };

  const handleDeleteReign = (titleId: string, reignIndex: number) => {
    const updatedTitles = promotion.titles.map(t => {
      if (t.id === titleId) {
        const newHistory = t.history.filter((_, idx) => idx !== reignIndex);
        return {
          ...t,
          history: newHistory
        };
      }
      return t;
    });

    onUpdatePromotion({
      ...promotion,
      titles: updatedTitles
    });
  };

  // -------------------------------------------------------------
  // Feuds Handlers
  // -------------------------------------------------------------
  const handleCreateFeud = () => {
    if (!wrestlerAId || !wrestlerBId || wrestlerAId === wrestlerBId) return;

    const wA = promotion.roster.find(w => w.id === wrestlerAId);
    const wB = promotion.roster.find(w => w.id === wrestlerBId);
    if (!wA || !wB) return;

    const newFeud: Feud = {
      id: `feud-${Date.now()}`,
      name: feudName.trim() || `${wA.name} vs. ${wB.name}`,
      wrestlerAIds: [wrestlerAId],
      wrestlerBIds: [wrestlerBId],
      heat: 70,
      startedWeek: currentWeek,
      momentum: 'Simmering',
      description: feudDescription.trim() || 'A fierce personal rivalry ignited across the federation.'
    };

    onUpdatePromotion({
      ...promotion,
      feuds: [newFeud, ...promotion.feuds]
    });

    setIsCreatingFeud(false);
    setFeudName('');
    setWrestlerAId('');
    setWrestlerBId('');
    setFeudDescription('');
  };

  const handleEndFeud = (feudId: string) => {
    onUpdatePromotion({
      ...promotion,
      feuds: promotion.feuds.filter(f => f.id !== feudId)
    });
  };

  // -------------------------------------------------------------
  // Hall of Records Data Calculations
  // -------------------------------------------------------------
  const recordsData = useMemo(() => {
    // Tally reigns per wrestler
    const reignCounts: Record<string, { count: number; titles: Set<string>; defenses: number; weeks: number }> = {};
    const longestReigns: { titleName: string; holderNames: string; defenses: number; wonWeek: number; lostWeek?: number; rating?: string }[] = [];

    promotion.titles.forEach(title => {
      title.history.forEach(reign => {
        const name = reign.holderNames;
        if (!reignCounts[name]) {
          reignCounts[name] = { count: 0, titles: new Set(), defenses: 0, weeks: 0 };
        }
        reignCounts[name].count += 1;
        reignCounts[name].titles.add(title.name);
        reignCounts[name].defenses += reign.defenses;
        const dur = (reign.lostWeek || currentWeek) - reign.wonWeek;
        reignCounts[name].weeks += Math.max(1, dur);

        longestReigns.push({
          titleName: title.name,
          holderNames: reign.holderNames,
          defenses: reign.defenses,
          wonWeek: reign.wonWeek,
          lostWeek: reign.lostWeek,
          rating: reign.reignRating
        });
      });
    });

    const topReigns = Object.entries(reignCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        titles: Array.from(data.titles).join(', '),
        totalDefenses: data.defenses,
        totalWeeks: data.weeks
      }))
      .sort((a, b) => b.count - a.count || b.totalDefenses - a.totalDefenses);

    const rankedLongest = longestReigns
      .sort((a, b) => b.defenses - a.defenses || (b.lostWeek || 100) - (a.lostWeek || 100));

    return { topReigns, rankedLongest };
  }, [promotion.titles, currentWeek]);

  // Markdown format of Titles
  let titlesMarkdown = `| Championship | Type / Division | Prestige | Reigning Champion | Defenses | Lineage Depth | Status |
|---|---|---|---|---|---|---|
`;
  promotion.titles.forEach(t => {
    const holderNames = t.currentHolderIds
      .map(id => promotion.roster.find(w => w.id === id)?.name || id)
      .join(' & ') || 'VACANT';
    const status = t.isRetired ? 'RETIRED' : 'ACTIVE';
    titlesMarkdown += `| ${t.name} | ${t.type || 'Singles'} (${t.division || 'Openweight'}) | ${t.prestige}/100 | ${holderNames} | ${t.defenses} | ${t.history.length} Reigns | ${status} |\n`;
  });

  // Markdown format of Feuds
  let feudsMarkdown = `| Feud Name | Combatants | Heat (0-100) | Momentum | Narrative Summary |
|---|---|---|---|---|
`;
  if (promotion.feuds.length === 0) {
    feudsMarkdown += `| No active rivalries | - | - | - | Create a feud to boost match & promo ratings |`;
  } else {
    promotion.feuds.forEach(f => {
      const combatants = `${f.wrestlerAIds.map(id => promotion.roster.find(w => w.id === id)?.name || id).join(', ')} vs. ${f.wrestlerBIds.map(id => promotion.roster.find(w => w.id === id)?.name || id).join(', ')}`;
      feudsMarkdown += `| ${f.name} | ${combatants} | ${f.heat}/100 | ${f.momentum} | ${f.description} |\n`;
    });
  }

  // -------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <button
            type="button"
            onClick={onBackToMenu}
            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 mb-1 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Booker Hub
          </button>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
            <span>[ 3 ] Championship Belts & Lineage</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {promotion.titles.filter(t => !t.isRetired).length} Active Titles
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {promotion.feuds.length} Feuds Active
            </span>
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded bg-zinc-900 border border-zinc-800 p-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('championships')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                activeTab === 'championships'
                  ? 'bg-amber-500 text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Championships</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lineage')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                activeTab === 'lineage'
                  ? 'bg-amber-500 text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lineage History</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                activeTab === 'records'
                  ? 'bg-amber-500 text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Hall of Records</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('feuds')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                activeTab === 'feuds'
                  ? 'bg-orange-500 text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Active Feuds</span>
            </button>
          </div>

          {activeTab === 'championships' && (
            <button
              type="button"
              onClick={handleOpenCreateTitle}
              className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Forge New Belt</span>
            </button>
          )}

          {activeTab === 'feuds' && (
            <button
              type="button"
              onClick={() => setIsCreatingFeud(true)}
              className="px-3 py-1.5 rounded bg-orange-500 hover:bg-orange-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ignite Feud</span>
            </button>
          )}
        </div>
      </div>

      {/* Markdown Presentation Table */}
      {activeTab === 'feuds' ? (
        <MarkdownTableView
          title="ACTIVE RIVALRIES & FEUD INTENSITY MATRIX"
          markdown={feudsMarkdown}
          defaultToMarkdown={false}
        >
          <div className="text-xs text-zinc-400 font-mono">
            Feud Heat multiplies match and promo ratings by up to +12 bonus points. Build heat through promos, attacks, and title brawls!
          </div>
        </MarkdownTableView>
      ) : (
        <MarkdownTableView
          title="CHAMPIONSHIP LINEAGE & TITLE PRESTIGE TABLE"
          markdown={titlesMarkdown}
          defaultToMarkdown={false}
        >
          <div className="text-xs text-zinc-400 font-mono">
            Championship matches receive up to +10 high-stakes prestige bonuses. Title defenses in 4+ star classics steadily elevate championship prestige!
          </div>
        </MarkdownTableView>
      )}

      {/* ======================================================== */}
      {/* TAB 1: CHAMPIONSHIPS SHOWCASE & MANAGEMENT               */}
      {/* ======================================================== */}
      {activeTab === 'championships' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 font-mono text-xs">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={titleSearch}
                onChange={e => setTitleSearch(e.target.value)}
                placeholder="Search championship name, initials, or reigning champion..."
                className="bg-transparent border-none text-white focus:outline-none w-full placeholder-zinc-500"
              />
              {titleSearch && (
                <button
                  type="button"
                  onClick={() => setTitleSearch('')}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-zinc-500 flex items-center gap-1 text-[11px] mr-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {(['all', 'active', 'retired', 'singles', 'tag', 'womens'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTitleFilter(f)}
                  className={`px-2.5 py-1 rounded text-[11px] uppercase transition ${
                    titleFilter === f
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Championships Grid */}
          {filteredTitles.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl p-8">
              <Trophy className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-200 font-mono">No Championships Found</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-4 font-sans">
                {titleSearch ? `No championships matched "${titleSearch}".` : 'No titles meet this filter criteria.'}
              </p>
              <button
                type="button"
                onClick={handleOpenCreateTitle}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs"
              >
                + Forge New Championship
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTitles.map(title => {
                const holders = title.currentHolderIds
                  .map(id => promotion.roster.find(w => w.id === id))
                  .filter(Boolean) as Wrestler[];
                const isVacant = holders.length === 0;
                const strapStyle = getStrapColorStyle(title.strapColor);
                const plateBadge = getPlateBadge(title.plateStyle);
                const PlateIcon = plateBadge.icon;

                return (
                  <div
                    key={title.id}
                    className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                      title.isRetired 
                        ? 'bg-zinc-950/60 border-zinc-800/60 opacity-80' 
                        : 'bg-zinc-900 border-zinc-800 hover:border-amber-500/60 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top Belt Presentation Badge */}
                      <div className="relative mb-3 rounded-lg overflow-hidden border border-zinc-700/80 shadow-inner">
                        {/* Strap Background */}
                        <div className={`h-16 w-full bg-gradient-to-r ${strapStyle.preview} flex items-center justify-between px-4 relative`}>
                          {/* Side Plate Left */}
                          <div className="w-8 h-10 rounded border border-amber-400/60 bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 shadow-sm flex items-center justify-center">
                            <Shield className="w-4 h-4 text-amber-950" />
                          </div>

                          {/* Center Medallion Plate */}
                          <div className="relative w-20 h-14 rounded-lg border-2 border-amber-300 bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-600 shadow-md flex flex-col items-center justify-center p-1">
                            <PlateIcon className="w-5 h-5 text-amber-950 drop-shadow" />
                            <span className="text-[8px] font-black tracking-tighter text-amber-950 uppercase truncate max-w-[70px]">
                              {title.shortName || 'CHAMP'}
                            </span>
                          </div>

                          {/* Side Plate Right */}
                          <div className="w-8 h-10 rounded border border-amber-400/60 bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 shadow-sm flex items-center justify-center">
                            <Shield className="w-4 h-4 text-amber-950" />
                          </div>

                          {/* Retired overlay banner */}
                          {title.isRetired && (
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="text-rose-400 font-mono font-bold text-xs uppercase tracking-wider px-2 py-0.5 rounded border border-rose-500/50 bg-rose-950/80">
                                ⚰ RETIRED CHAMPIONSHIP
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Header Info */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(() => {
                              const gBadge = getChampionshipGenderBadge(title);
                              return (
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-bold flex items-center gap-1 ${gBadge.className}`}>
                                  <span>{gBadge.icon}</span>
                                  <span>{gBadge.label}</span>
                                </span>
                              );
                            })()}
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              {title.type || 'Singles'}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {title.division || 'Openweight'}
                            </span>
                            {title.minWorkrateBonus ? (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                +{title.minWorkrateBonus} Pts Stakes
                              </span>
                            ) : null}
                          </div>
                          <h3 className="font-bold text-white font-mono text-base mt-1.5 leading-snug">
                            {title.name}
                          </h3>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold border border-zinc-700">
                            ★ {title.prestige}
                          </span>
                        </div>
                      </div>

                      {title.description && (
                        <p className="text-xs text-zinc-400 font-sans line-clamp-2 mt-1 mb-3">
                          {title.description}
                        </p>
                      )}

                      {/* Reigning Champion Box */}
                      <div className="my-3 p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-xs">
                        <div className="text-[10px] text-zinc-500 uppercase font-sans mb-1 flex items-center justify-between">
                          <span>Reigning Champion:</span>
                          {!isVacant && (
                            <span className="text-amber-400 font-bold">
                              {title.defenses} Defenses
                            </span>
                          )}
                        </div>
                        {isVacant ? (
                          <div className="flex items-center justify-between">
                            <span className="text-rose-400 font-bold tracking-wide">● VACANT</span>
                            {!title.isRetired && (
                              <span className="text-[10px] text-zinc-500">Awaiting new champion</span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="text-amber-300 font-bold text-sm truncate flex items-center gap-1.5">
                              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate">{holders.map(h => h.name).join(' & ')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                              <span>Overness: {Math.round(holders.reduce((a, b) => a + b.overness, 0) / holders.length)}</span>
                              <span>•</span>
                              <span>{holders.map(h => h.alignment).join('/')}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Lineage Summary Snippet */}
                      <div className="space-y-1 font-mono text-[11px] text-zinc-400 mb-3">
                        <div className="text-zinc-500 uppercase text-[10px] flex items-center justify-between">
                          <span>Recent Lineage ({title.history.length} Reigns):</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTitleIdForLineage(title.id);
                              setActiveTab('lineage');
                            }}
                            className="text-amber-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>View Full</span>
                            <History className="w-3 h-3" />
                          </button>
                        </div>
                        {title.history.slice(0, 2).map((h, i) => (
                          <div key={i} className="flex items-center justify-between text-zinc-300 text-[11px] truncate">
                            <span className="truncate">#{title.history.length - i}. {h.holderNames}</span>
                            <span className="text-zinc-500 text-[10px] ml-2 shrink-0">{h.defenses} def</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Title Management Actions */}
                    <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTitle(title)}
                          className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1 transition"
                          title="Edit Championship Belt Settings"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Customize</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTitleIdForLineage(title.id);
                            setActiveTab('lineage');
                          }}
                          className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-amber-950 text-zinc-300 hover:text-amber-300 border border-zinc-700 flex items-center gap-1 transition"
                          title="Inspect Historical Lineage"
                        >
                          <History className="w-3 h-3" />
                          <span>Lineage</span>
                        </button>
                      </div>

                      {/* Quick Champion Changer / Vacate */}
                      <div className="flex items-center gap-1.5">
                        {!isVacant && !title.isRetired ? (
                          <button
                            type="button"
                            onClick={() => handleVacateTitle(title.id)}
                            className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-rose-950 text-zinc-300 hover:text-rose-300 border border-zinc-700 transition"
                            title="Strip Champion and Vacate Belt"
                          >
                            Vacate
                          </button>
                        ) : null}

                        {title.isRetired ? (
                          <button
                            type="button"
                            onClick={() => handleReactivateTitle(title.id)}
                            className="px-2.5 py-1.5 rounded bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 transition"
                          >
                            Reactivate
                          </button>
                        ) : isVacant ? (
                          <div className="w-36">
                            <select
                              onChange={e => {
                                if (e.target.value) handleAwardTitle(title.id, [e.target.value]);
                              }}
                              defaultValue=""
                              className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-white text-[11px] focus:outline-none"
                            >
                              <option value="" disabled>Award to...</option>
                              {filterEligibleWrestlersForTitle(title, promotion.roster).map(w => (
                                <option key={w.id} value={w.id}>{w.name} ({w.gender})</option>
                              ))}
                            </select>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CHAMPIONSHIP LINEAGE & HISTORY CHRONICLES         */}
      {/* ======================================================== */}
      {activeTab === 'lineage' && selectedTitleForLineage && (
        <div className="space-y-6">
          {/* Title Selector Header */}
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-3">
              <span className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Trophy className="w-6 h-6" />
              </span>
              <div>
                <div className="text-xs text-zinc-500 uppercase">Lineage Timeline Archive</div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{selectedTitleForLineage.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                    Prestige {selectedTitleForLineage.prestige}/100
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedTitleIdForLineage}
                onChange={e => setSelectedTitleIdForLineage(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
              >
                {promotion.titles.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.history.length} Reigns)
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleOpenAddReign}
                className="px-3 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Historical Reign</span>
              </button>
            </div>
          </div>

          {/* Lineage Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="text-zinc-500 text-[10px] uppercase">Total Recognized Reigns</div>
              <div className="text-lg font-bold text-white mt-0.5">{selectedTitleForLineage.history.length}</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="text-zinc-500 text-[10px] uppercase">Reigning Champion</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5 truncate">
                {selectedTitleForLineage.currentHolderIds.length > 0
                  ? selectedTitleForLineage.currentHolderIds
                      .map(id => promotion.roster.find(w => w.id === id)?.name || id)
                      .join(' & ')
                  : 'VACANT'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="text-zinc-500 text-[10px] uppercase">Active Title Defenses</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {selectedTitleForLineage.defenses} Defenses
              </div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="text-zinc-500 text-[10px] uppercase">Strap & Plate Style</div>
              <div className="text-sm font-bold text-zinc-300 mt-1 truncate">
                {selectedTitleForLineage.strapColor || 'Black'} • {selectedTitleForLineage.plateStyle || 'Big Gold'}
              </div>
            </div>
          </div>

          {/* Chronological Reigns List */}
          <div className="space-y-3 font-mono">
            {selectedTitleForLineage.history.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl p-8">
                <History className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-zinc-200">No History Recorded Yet</h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-4 font-sans">
                  This championship has no past reigns recorded in its archives. Award the title to a superstar or backdate legendary past reigns.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddReign}
                  className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                >
                  + Add Inaugural Historical Reign
                </button>
              </div>
            ) : (
              selectedTitleForLineage.history.map((reign, idx) => {
                const isCurrent = idx === 0 && selectedTitleForLineage.currentHolderIds.length > 0 && !reign.lostWeek;
                const reignNumber = reign.reignNumber || (selectedTitleForLineage.history.length - idx);
                const wonPeriod = `Week ${reign.wonWeek}${reign.wonYear ? `, Year ${reign.wonYear}` : ''}`;
                const lostPeriod = reign.lostWeek 
                  ? `Week ${reign.lostWeek}${reign.lostYear ? `, Year ${reign.lostYear}` : ''}`
                  : (isCurrent ? 'PRESENT' : 'Concluded');
                const reignLength = Math.max(1, (reign.lostWeek || currentWeek) - reign.wonWeek);

                return (
                  <div
                    key={reign.id || idx}
                    className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isCurrent
                        ? 'bg-amber-500/5 border-amber-500/40 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-bold shrink-0 ${
                        isCurrent 
                          ? 'bg-amber-500 text-black shadow' 
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}>
                        <span className="text-[9px] uppercase leading-none">Reign</span>
                        <span className="text-sm leading-none mt-0.5">#{reignNumber}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-base">
                            {reign.holderNames}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-black uppercase">
                              ★ CURRENT CHAMPION
                            </span>
                          )}
                          {reign.reignRating && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700">
                              {reign.reignRating}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                          <span className="flex items-center gap-1 text-zinc-300">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            {wonPeriod} → {lostPeriod}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <Shield className="w-3.5 h-3.5" />
                            {reign.defenses} Successful Defenses
                          </span>
                          <span>•</span>
                          <span className="text-zinc-500">
                            Duration: ~{reignLength} Weeks
                          </span>
                        </div>

                        {reign.eventWonAt && (
                          <div className="text-[11px] text-amber-400/90 font-sans">
                            Won at: <strong className="font-mono">{reign.eventWonAt}</strong>
                          </div>
                        )}

                        {reign.notes && (
                          <p className="text-xs text-zinc-400 font-sans mt-0.5">
                            {reign.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reign Actions */}
                    <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditReign(selectedTitleForLineage.id, idx, reign)}
                        className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                        title="Edit Historical Reign"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteReign(selectedTitleForLineage.id, idx)}
                        className="p-1.5 rounded hover:bg-rose-950 text-zinc-500 hover:text-rose-400 transition"
                        title="Delete Reign From History"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PROMOTION HALL OF RECORDS                         */}
      {/* ======================================================== */}
      {activeTab === 'records' && (
        <div className="space-y-6 font-mono">
          <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30">
            <div className="flex items-center gap-3">
              <span className="p-3 rounded-lg bg-amber-500 text-black">
                <Crown className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Championship Hall of Records & All-Time Greats</h3>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Recognizing the legendary superstars and most storied title reigns in the history of {promotion.name}.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Most Title Reigns Leaderboard */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Most Championship Reigns (All-Time)</span>
                </h4>
                <span className="text-[10px] text-zinc-500">Cumulative</span>
              </div>

              {recordsData.topReigns.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">No title reigns recorded.</div>
              ) : (
                <div className="space-y-2">
                  {recordsData.topReigns.slice(0, 8).map((champ, rank) => (
                    <div
                      key={champ.name}
                      className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          rank === 0 ? 'bg-amber-500 text-black' : rank === 1 ? 'bg-zinc-300 text-black' : rank === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {rank + 1}
                        </span>
                        <div>
                          <span className="font-bold text-white">{champ.name}</span>
                          <div className="text-[10px] text-zinc-500 truncate max-w-[200px]">
                            {champ.titles}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-amber-400 font-bold">{champ.count}x Champion</div>
                        <div className="text-[10px] text-zinc-500">{champ.totalDefenses} total def</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Longest Defenses & Marquee Reigns */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Most Defenses in a Single Reign</span>
                </h4>
                <span className="text-[10px] text-zinc-500">Peak Dominance</span>
              </div>

              {recordsData.rankedLongest.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">No reigns recorded yet.</div>
              ) : (
                <div className="space-y-2">
                  {recordsData.rankedLongest.slice(0, 8).map((reign, rank) => (
                    <div
                      key={`${reign.holderNames}-${rank}`}
                      className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          rank === 0 ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {rank + 1}
                        </span>
                        <div>
                          <span className="font-bold text-white">{reign.holderNames}</span>
                          <div className="text-[10px] text-amber-400 truncate max-w-[200px]">
                            {reign.titleName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-emerald-400 font-bold">{reign.defenses} Defenses</div>
                        {reign.rating && (
                          <div className="text-[10px] text-zinc-500">{reign.rating}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: FEUDS CONTENT                                     */}
      {/* ======================================================== */}
      {activeTab === 'feuds' && (
        <div className="space-y-4">
          {promotion.feuds.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl p-8">
              <Flame className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-200 font-mono">No Active Feuds</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-4 font-sans">
                Rivalries drive wrestling storytelling. Ignite a blood feud between a top Babyface and Heel to elevate your television ratings.
              </p>
              <button
                type="button"
                onClick={() => setIsCreatingFeud(true)}
                className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-400 text-black font-mono font-bold text-xs"
              >
                + Ignite New Rivalry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promotion.feuds.map(feud => {
                const sideANames = feud.wrestlerAIds
                  .map(id => promotion.roster.find(w => w.id === id)?.name || id)
                  .join(' & ');
                const sideBNames = feud.wrestlerBIds
                  .map(id => promotion.roster.find(w => w.id === id)?.name || id)
                  .join(' & ');

                return (
                  <div
                    key={feud.id}
                    className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                          feud.heat >= 85
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : feud.heat >= 75
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                            : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                        }`}>
                          🔥 {feud.momentum} ({feud.heat}/100)
                        </span>

                        <button
                          type="button"
                          onClick={() => handleEndFeud(feud.id)}
                          className="p-1 rounded hover:bg-rose-950 text-zinc-500 hover:text-rose-400 transition"
                          title="Blow Off / Conclude Feud"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h3 className="font-bold text-white font-mono text-base mb-1">{feud.name}</h3>
                      <div className="text-xs font-mono text-amber-400 font-semibold mb-3">
                        {sideANames} <span className="text-zinc-500">vs.</span> {sideBNames}
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
                        {feud.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80 font-mono text-xs">
                      <div className="flex items-center justify-between text-zinc-400 mb-1">
                        <span>Rivalry Heat Rating</span>
                        <span className="text-orange-400 font-bold">{feud.heat}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            feud.heat >= 80 ? 'bg-orange-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${feud.heat}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CREATE / FORGE NEW CHAMPIONSHIP                 */}
      {/* ======================================================== */}
      {isCreatingTitle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl p-6 space-y-4 font-mono text-xs shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Forge New Custom Championship</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingTitle(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕ Cancel
              </button>
            </div>

            {/* Presets Quick Selector */}
            <div>
              <label className="block text-zinc-400 mb-1.5">Quick Presets & Iconic Templates:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CHAMPIONSHIP_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.name}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-2 rounded bg-zinc-950 border border-zinc-800 hover:border-amber-500 text-left transition"
                  >
                    <div className="font-bold text-zinc-200 text-[11px] truncate">{tpl.name}</div>
                    <div className="text-[10px] text-amber-400">{tpl.type}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Belt Visual Preview */}
            <div>
              <label className="block text-zinc-400 mb-1">Belt Aesthetic Preview:</label>
              <div className="rounded-lg overflow-hidden border border-zinc-700 shadow-md">
                <div className={`h-16 w-full bg-gradient-to-r ${getStrapColorStyle(titleForm.strapColor).preview} flex items-center justify-between px-6 relative`}>
                  <div className="w-8 h-10 rounded border border-amber-400/60 bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 flex items-center justify-center shadow">
                    <Shield className="w-4 h-4 text-amber-950" />
                  </div>
                  <div className="w-24 h-14 rounded-lg border-2 border-amber-300 bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-600 flex flex-col items-center justify-center shadow-lg p-1">
                    <Trophy className="w-5 h-5 text-amber-950 drop-shadow" />
                    <span className="text-[9px] font-black text-amber-950 uppercase truncate max-w-[85px]">
                      {titleForm.shortName || titleForm.name || 'WORLD'}
                    </span>
                  </div>
                  <div className="w-8 h-10 rounded border border-amber-400/60 bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 flex items-center justify-center shadow">
                    <Shield className="w-4 h-4 text-amber-950" />
                  </div>
                </div>
              </div>
            </div>

            {/* Name & Short Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-zinc-400 mb-1">Championship Name *</label>
                <input
                  type="text"
                  value={titleForm.name}
                  onChange={e => setTitleForm({ ...titleForm, name: e.target.value })}
                  placeholder="e.g. World Heavyweight Championship"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Short Code</label>
                <input
                  type="text"
                  value={titleForm.shortName}
                  onChange={e => setTitleForm({ ...titleForm, shortName: e.target.value })}
                  placeholder="e.g. WHC"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Type & Division & Gender & Prestige */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Championship Tier</label>
                <select
                  value={titleForm.type}
                  onChange={e => {
                    const newType = e.target.value as ChampionshipType;
                    const isWomen = newType === "Women's";
                    setTitleForm(prev => ({
                      ...prev,
                      type: newType,
                      gender: isWomen ? 'Female' : prev.gender,
                      division: isWomen ? 'Women' : prev.division,
                      initialHolderId: isWomen && promotion.roster.find(w => w.id === prev.initialHolderId)?.gender !== 'Female' ? '' : prev.initialHolderId
                    }));
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="World / Primary">World / Primary</option>
                  <option value="Secondary / Midcard">Secondary / Midcard</option>
                  <option value="Tertiary / TV">Tertiary / TV</option>
                  <option value="Tag Team">Tag Team</option>
                  <option value="Women's">Women's</option>
                  <option value="Cruiserweight / High-Flyer">Cruiserweight / High-Flyer</option>
                  <option value="Hardcore / 24/7">Hardcore / 24/7</option>
                  <option value="Heritage / Custom">Heritage / Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Division</label>
                <select
                  value={titleForm.division}
                  onChange={e => {
                    const newDiv = e.target.value as TitleDivision;
                    const isWomen = newDiv === 'Women';
                    setTitleForm(prev => ({
                      ...prev,
                      division: newDiv,
                      gender: isWomen ? 'Female' : prev.gender
                    }));
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Openweight">Openweight</option>
                  <option value="Heavyweight">Heavyweight</option>
                  <option value="Cruiserweight">Cruiserweight</option>
                  <option value="Women">Women</option>
                  <option value="Tag Team">Tag Team</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Gender Restriction</label>
                <select
                  value={titleForm.gender}
                  onChange={e => {
                    const newGender = e.target.value as 'Male' | 'Female' | 'Open';
                    const validHolders = filterEligibleWrestlersForTitle({ gender: newGender }, promotion.roster);
                    setTitleForm(prev => ({
                      ...prev,
                      gender: newGender,
                      initialHolderId: validHolders.some(w => w.id === prev.initialHolderId) ? prev.initialHolderId : '',
                      initialHolder2Id: validHolders.some(w => w.id === prev.initialHolder2Id) ? prev.initialHolder2Id : ''
                    }));
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="Male">👨 Men's (Male Only)</option>
                  <option value="Female">👩 Women's (Female Only)</option>
                  <option value="Open">🌐 Open / Any Gender</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Initial Prestige: <strong className="text-amber-400">{titleForm.prestige}</strong>/100
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={titleForm.prestige}
                  onChange={e => setTitleForm({ ...titleForm, prestige: Number(e.target.value) })}
                  className="w-full accent-amber-500 mt-2"
                />
              </div>
            </div>

            {/* Aesthetics Customizer: Strap & Plate Style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Leather Strap Color</label>
                <select
                  value={titleForm.strapColor}
                  onChange={e => setTitleForm({ ...titleForm, strapColor: e.target.value as BeltStrapColor })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Classic Black">Classic Black</option>
                  <option value="Pure White">Pure White</option>
                  <option value="Crimson Red">Crimson Red</option>
                  <option value="Midnight Blue">Midnight Blue</option>
                  <option value="Toxic Purple">Toxic Purple</option>
                  <option value="Championship Gold">Championship Gold</option>
                  <option value="Emerald Green">Emerald Green</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Center Plate Design</label>
                <select
                  value={titleForm.plateStyle}
                  onChange={e => setTitleForm({ ...titleForm, plateStyle: e.target.value as BeltPlateStyle })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Big Gold Classic">Big Gold Classic</option>
                  <option value="Eagle Crest">Eagle Crest</option>
                  <option value="Winged Globe">Winged Globe</option>
                  <option value="Crown & Regal Lions">Crown & Regal Lions</option>
                  <option value="Skull & Barbed Wire">Skull & Barbed Wire</option>
                  <option value="Modern Geometric Diamond">Modern Geometric Diamond</option>
                  <option value="Vintage Oval Heavyweight">Vintage Oval Heavyweight</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Stakes Workrate Bonus: <strong className="text-emerald-400">+{titleForm.minWorkrateBonus} Pts</strong>
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={titleForm.minWorkrateBonus}
                  onChange={e => setTitleForm({ ...titleForm, minWorkrateBonus: Number(e.target.value) })}
                  className="w-full accent-emerald-500 mt-2"
                />
              </div>
            </div>

            {/* Initial Champion Assignment */}
            <div className="p-3 rounded bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-300">Initial Champion Assignment (Optional):</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={titleForm.isTagTeam}
                    onChange={e => setTitleForm({ ...titleForm, isTagTeam: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-zinc-400">Tag Team Belts (Two Co-Holders)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">
                    {titleForm.isTagTeam ? 'Partner 1 / Champion:' : 'Crowned Champion:'}
                  </label>
                  <select
                    value={titleForm.initialHolderId}
                    onChange={e => setTitleForm({ ...titleForm, initialHolderId: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="">-- Leave Vacant --</option>
                    {filterEligibleWrestlersForTitle({ gender: titleForm.gender }, promotion.roster).map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.gender} • {w.alignment} • Overness: {w.overness})</option>
                    ))}
                  </select>
                </div>

                {titleForm.isTagTeam && (
                  <div>
                    <label className="block text-zinc-400 mb-1">Partner 2:</label>
                    <select
                      value={titleForm.initialHolder2Id}
                      onChange={e => setTitleForm({ ...titleForm, initialHolder2Id: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                    >
                      <option value="">-- Select Tag Partner --</option>
                      {filterEligibleWrestlersForTitle({ gender: titleForm.gender }, promotion.roster)
                        .filter(w => w.id !== titleForm.initialHolderId)
                        .map(w => (
                          <option key={w.id} value={w.id}>{w.name} ({w.gender} • {w.alignment})</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-zinc-400 mb-1">Heritage Lore & Belt Description</label>
              <textarea
                value={titleForm.description}
                onChange={e => setTitleForm({ ...titleForm, description: e.target.value })}
                rows={2}
                placeholder="Describe the significance and lineage background of this championship..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCreatingTitle(false)}
                className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewTitle}
                disabled={!titleForm.name.trim()}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4" />
                <span>Forge Championship</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT EXISTING CHAMPIONSHIP                      */}
      {/* ======================================================== */}
      {editingTitle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl p-6 space-y-4 font-mono text-xs shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <span>Customize Championship: {editingTitle.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingTitle(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕ Cancel
              </button>
            </div>

            {/* Live Belt Visual Preview */}
            <div>
              <label className="block text-zinc-400 mb-1">Belt Aesthetic Preview:</label>
              <div className="rounded-lg overflow-hidden border border-zinc-700 shadow-md">
                <div className={`h-16 w-full bg-gradient-to-r ${getStrapColorStyle(titleForm.strapColor).preview} flex items-center justify-between px-6 relative`}>
                  <div className="w-8 h-10 rounded border border-amber-400/60 bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 flex items-center justify-center shadow">
                    <Shield className="w-4 h-4 text-amber-950" />
                  </div>
                  <div className="w-24 h-14 rounded-lg border-2 border-amber-300 bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-600 flex flex-col items-center justify-center shadow-lg p-1">
                    <Trophy className="w-5 h-5 text-amber-950 drop-shadow" />
                    <span className="text-[9px] font-black text-amber-950 uppercase truncate max-w-[85px]">
                      {titleForm.shortName || titleForm.name}
                    </span>
                  </div>
                  <div className="w-8 h-10 rounded border border-amber-400/60 bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 flex items-center justify-center shadow">
                    <Shield className="w-4 h-4 text-amber-950" />
                  </div>
                </div>
              </div>
            </div>

            {/* Title Name & Short Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-zinc-400 mb-1">Championship Name *</label>
                <input
                  type="text"
                  value={titleForm.name}
                  onChange={e => setTitleForm({ ...titleForm, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Short Code</label>
                <input
                  type="text"
                  value={titleForm.shortName}
                  onChange={e => setTitleForm({ ...titleForm, shortName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Type & Division & Prestige */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Championship Tier</label>
                <select
                  value={titleForm.type}
                  onChange={e => setTitleForm({ ...titleForm, type: e.target.value as ChampionshipType })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="World / Primary">World / Primary</option>
                  <option value="Secondary / Midcard">Secondary / Midcard</option>
                  <option value="Tertiary / TV">Tertiary / TV</option>
                  <option value="Tag Team">Tag Team</option>
                  <option value="Women's">Women's</option>
                  <option value="Cruiserweight / High-Flyer">Cruiserweight / High-Flyer</option>
                  <option value="Hardcore / 24/7">Hardcore / 24/7</option>
                  <option value="Heritage / Custom">Heritage / Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Division</label>
                <select
                  value={titleForm.division}
                  onChange={e => {
                    const newDiv = e.target.value as TitleDivision;
                    const isWomen = newDiv === 'Women';
                    setTitleForm(prev => ({
                      ...prev,
                      division: newDiv,
                      gender: isWomen ? 'Female' : prev.gender
                    }));
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Openweight">Openweight</option>
                  <option value="Heavyweight">Heavyweight</option>
                  <option value="Cruiserweight">Cruiserweight</option>
                  <option value="Women">Women</option>
                  <option value="Tag Team">Tag Team</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Gender Restriction</label>
                <select
                  value={titleForm.gender}
                  onChange={e => {
                    const newGender = e.target.value as 'Male' | 'Female' | 'Open';
                    const validHolders = filterEligibleWrestlersForTitle({ gender: newGender }, promotion.roster);
                    setTitleForm(prev => ({
                      ...prev,
                      gender: newGender,
                      initialHolderId: validHolders.some(w => w.id === prev.initialHolderId) ? prev.initialHolderId : '',
                      initialHolder2Id: validHolders.some(w => w.id === prev.initialHolder2Id) ? prev.initialHolder2Id : ''
                    }));
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="Male">👨 Men's (Male Only)</option>
                  <option value="Female">👩 Women's (Female Only)</option>
                  <option value="Open">🌐 Open / Any Gender</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Prestige: <strong className="text-amber-400">{titleForm.prestige}</strong>/100
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={titleForm.prestige}
                  onChange={e => setTitleForm({ ...titleForm, prestige: Number(e.target.value) })}
                  className="w-full accent-amber-500 mt-2"
                />
              </div>
            </div>

            {/* Aesthetics Customizer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Strap Color</label>
                <select
                  value={titleForm.strapColor}
                  onChange={e => setTitleForm({ ...titleForm, strapColor: e.target.value as BeltStrapColor })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                >
                  <option value="Classic Black">Classic Black</option>
                  <option value="Pure White">Pure White</option>
                  <option value="Crimson Red">Crimson Red</option>
                  <option value="Midnight Blue">Midnight Blue</option>
                  <option value="Toxic Purple">Toxic Purple</option>
                  <option value="Championship Gold">Championship Gold</option>
                  <option value="Emerald Green">Emerald Green</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Center Plate Style</label>
                <select
                  value={titleForm.plateStyle}
                  onChange={e => setTitleForm({ ...titleForm, plateStyle: e.target.value as BeltPlateStyle })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                >
                  <option value="Big Gold Classic">Big Gold Classic</option>
                  <option value="Eagle Crest">Eagle Crest</option>
                  <option value="Winged Globe">Winged Globe</option>
                  <option value="Crown & Regal Lions">Crown & Regal Lions</option>
                  <option value="Skull & Barbed Wire">Skull & Barbed Wire</option>
                  <option value="Modern Geometric Diamond">Modern Geometric Diamond</option>
                  <option value="Vintage Oval Heavyweight">Vintage Oval Heavyweight</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Current Title Defenses</label>
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={titleForm.defenses}
                  onChange={e => setTitleForm({ ...titleForm, defenses: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Champion Reassignment */}
            <div className="p-3 rounded bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-300">Reigning Champion Reassignment:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={titleForm.isTagTeam}
                    onChange={e => setTitleForm({ ...titleForm, isTagTeam: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-zinc-400">Tag Team Format</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Champion / Partner 1:</label>
                  <select
                    value={titleForm.initialHolderId}
                    onChange={e => setTitleForm({ ...titleForm, initialHolderId: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="">-- VACANT --</option>
                    {filterEligibleWrestlersForTitle({ gender: titleForm.gender }, promotion.roster).map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.alignment} - {w.gender})</option>
                    ))}
                  </select>
                </div>

                {titleForm.isTagTeam && (
                  <div>
                    <label className="block text-zinc-400 mb-1">Tag Partner 2:</label>
                    <select
                      value={titleForm.initialHolder2Id}
                      onChange={e => setTitleForm({ ...titleForm, initialHolder2Id: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                    >
                      <option value="">-- Select Partner --</option>
                      {filterEligibleWrestlersForTitle({ gender: titleForm.gender }, promotion.roster)
                        .filter(w => w.id !== titleForm.initialHolderId)
                        .map(w => (
                          <option key={w.id} value={w.id}>{w.name} ({w.alignment} - {w.gender})</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-zinc-400 mb-1">Belt Description</label>
              <textarea
                value={titleForm.description}
                onChange={e => setTitleForm({ ...titleForm, description: e.target.value })}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                {!editingTitle.isRetired ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleRetireTitle(editingTitle.id);
                      setEditingTitle(null);
                    }}
                    className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-rose-950 text-zinc-300 hover:text-rose-300 border border-zinc-700 text-xs"
                  >
                    Retire Title Belt
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleReactivateTitle(editingTitle.id);
                      setEditingTitle(null);
                    }}
                    className="px-3 py-1.5 rounded bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 text-xs"
                  >
                    Reactivate Belt
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteTitle(editingTitle.id)}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-rose-900 text-zinc-400 hover:text-white border border-zinc-700 text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTitle(null)}
                  className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedTitle}
                  disabled={!titleForm.name.trim()}
                  className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD HISTORICAL REIGN                            */}
      {/* ======================================================== */}
      {isAddingHistoryReign && selectedTitleForLineage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg p-6 space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>Add Historical Reign to {selectedTitleForLineage.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingHistoryReign(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕ Cancel
              </button>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Champion / Holder Name(s) *</label>
              <input
                type="text"
                value={reignForm.holderNames}
                onChange={e => setReignForm({ ...reignForm, holderNames: e.target.value })}
                placeholder="e.g. Thunder Vance or Bruno Sammartino"
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Won Week / Year</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={reignForm.wonWeek}
                    onChange={e => setReignForm({ ...reignForm, wonWeek: parseInt(e.target.value) || 1 })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                    placeholder="Week"
                  />
                  <span className="text-zinc-500">Yr</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={reignForm.wonYear}
                    onChange={e => setReignForm({ ...reignForm, wonYear: parseInt(e.target.value) || 1 })}
                    className="w-16 bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Lost Week / Year (If Concluded)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={reignForm.lostWeek || ''}
                    onChange={e => setReignForm({ ...reignForm, lostWeek: parseInt(e.target.value) || undefined })}
                    disabled={reignForm.isCurrent}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white disabled:opacity-40"
                    placeholder="Week"
                  />
                  <span className="text-zinc-500">Yr</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={reignForm.lostYear || 1}
                    onChange={e => setReignForm({ ...reignForm, lostYear: parseInt(e.target.value) || 1 })}
                    disabled={reignForm.isCurrent}
                    className="w-16 bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-white disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Successful Defenses</label>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={reignForm.defenses}
                  onChange={e => setReignForm({ ...reignForm, defenses: parseInt(e.target.value) || 0 })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Reign Quality Rating</label>
                <select
                  value={reignForm.reignRating}
                  onChange={e => setReignForm({ ...reignForm, reignRating: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                >
                  <option value="★★★★★ Masterpiece">★★★★★ Masterpiece</option>
                  <option value="★★★★1/2 Classic">★★★★1/2 Classic</option>
                  <option value="★★★★ Great">★★★★ Great</option>
                  <option value="★★★1/2 Solid">★★★1/2 Solid</option>
                  <option value="★★★ Average">★★★ Average</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Event / Location Won At</label>
              <input
                type="text"
                value={reignForm.eventWonAt}
                onChange={e => setReignForm({ ...reignForm, eventWonAt: e.target.value })}
                placeholder="e.g. WrestleFest VIII, Tokyo Dome, Weekly TV #42"
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Reign Highlights & Victory Notes</label>
              <textarea
                value={reignForm.notes}
                onChange={e => setReignForm({ ...reignForm, notes: e.target.value })}
                rows={2}
                placeholder="e.g. Defeated Damian Graves in a 40-minute ladder match classic..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAddingHistoryReign(false)}
                className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewReign}
                disabled={!reignForm.holderNames.trim()}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Insert Reign Into Lineage</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: EDIT HISTORIC REIGN                             */}
      {/* ======================================================== */}
      {editingHistoryReign && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg p-6 space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>Edit Championship Reign</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingHistoryReign(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕ Cancel
              </button>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Champion / Holder Name(s) *</label>
              <input
                type="text"
                value={reignForm.holderNames}
                onChange={e => setReignForm({ ...reignForm, holderNames: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Won Week / Year</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={reignForm.wonWeek}
                    onChange={e => setReignForm({ ...reignForm, wonWeek: parseInt(e.target.value) || 1 })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                  />
                  <span className="text-zinc-500">Yr</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={reignForm.wonYear}
                    onChange={e => setReignForm({ ...reignForm, wonYear: parseInt(e.target.value) || 1 })}
                    className="w-16 bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Lost Week / Year</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={reignForm.lostWeek || ''}
                    onChange={e => setReignForm({ ...reignForm, lostWeek: parseInt(e.target.value) || undefined })}
                    disabled={reignForm.isCurrent}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white disabled:opacity-40"
                  />
                  <span className="text-zinc-500">Yr</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={reignForm.lostYear || 1}
                    onChange={e => setReignForm({ ...reignForm, lostYear: parseInt(e.target.value) || 1 })}
                    disabled={reignForm.isCurrent}
                    className="w-16 bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-white disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Successful Defenses</label>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={reignForm.defenses}
                  onChange={e => setReignForm({ ...reignForm, defenses: parseInt(e.target.value) || 0 })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Reign Quality Rating</label>
                <select
                  value={reignForm.reignRating}
                  onChange={e => setReignForm({ ...reignForm, reignRating: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                >
                  <option value="★★★★★ Masterpiece">★★★★★ Masterpiece</option>
                  <option value="★★★★1/2 Classic">★★★★1/2 Classic</option>
                  <option value="★★★★ Great">★★★★ Great</option>
                  <option value="★★★1/2 Solid">★★★1/2 Solid</option>
                  <option value="★★★ Average">★★★ Average</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Event / Location Won At</label>
              <input
                type="text"
                value={reignForm.eventWonAt}
                onChange={e => setReignForm({ ...reignForm, eventWonAt: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Reign Highlights & Victory Notes</label>
              <textarea
                value={reignForm.notes}
                onChange={e => setReignForm({ ...reignForm, notes: e.target.value })}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingHistoryReign(null)}
                className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedReign}
                disabled={!reignForm.holderNames.trim()}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Reign Updates</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: IGNITE FEUD                                     */}
      {/* ======================================================== */}
      {isCreatingFeud && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg p-6 space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Ignite New Feud</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingFeud(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕ Cancel
              </button>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Rivalry Name</label>
              <input
                type="text"
                value={feudName}
                onChange={e => setFeudName(e.target.value)}
                placeholder="e.g. Thunder Vance vs. Damian Graves"
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Combatant A</label>
                <select
                  value={wrestlerAId}
                  onChange={e => setWrestlerAId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">-- Select Wrestler --</option>
                  {promotion.roster.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.alignment})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Combatant B</label>
                <select
                  value={wrestlerBId}
                  onChange={e => setWrestlerBId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">-- Select Wrestler --</option>
                  {promotion.roster.filter(w => w.id !== wrestlerAId).map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.alignment})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Storyline Angle & Heat Origin</label>
              <textarea
                value={feudDescription}
                onChange={e => setFeudDescription(e.target.value)}
                rows={3}
                placeholder="Describe why these two superstars despise each other..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCreatingFeud(false)}
                className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateFeud}
                disabled={!wrestlerAId || !wrestlerBId}
                className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-bold"
              >
                Ignite Rivalry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
