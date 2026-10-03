import { 
  BackstageClique, 
  ContractBid, 
  ContractBiddingWar, 
  WrestlerCourtCase, 
  Promotion, 
  Wrestler 
} from '../types';

export const SAMPLE_WRESTLER_COURT_CASES: Omit<WrestlerCourtCase, 'id' | 'week' | 'resolved' | 'defendantId' | 'plaintiffId' | 'judgeId'>[] = [
  {
    title: 'The Greasy Fried Chicken Locker Room Bag Incident',
    charge: 'Eating a two-piece fried chicken meal directly over a senior veteran’s custom leather gear bag, leaving grease stains on their prized boots.',
    plea: 'Guilty',
    sentencingOptions: [
      {
        id: 'sent-ribs',
        name: 'The Golden Standard: 40 Lbs of Barbecue Ribs',
        description: 'Defendant must buy the entire locker room 40 racks of prime barbecue ribs and two cases of craft beer.',
        moraleEffect: '+6 Morale to entire locker room, Plaintiff drops grudge.',
        cost: 650
      },
      {
        id: 'sent-boots',
        name: 'Full Gear Replacement & Apology',
        description: 'Defendant must personally buy the veteran brand new hand-stitched wrestling boots and apologize in front of the boys.',
        moraleEffect: 'Plaintiff +15 Morale, Defendant -5 Morale.',
        cost: 450
      },
      {
        id: 'sent-reprimand',
        name: 'Stern Judicial Dressing Down',
        description: 'Judge issues a scathing verbal reprimand. No financial penalty.',
        moraleEffect: 'Defendant +5 Morale, Plaintiff -8 Morale (feels slighted).',
        cost: 0
      }
    ]
  },
  {
    title: 'The Unforgivable Finisher Sandbagging Accusation',
    charge: 'Going limp and visibly sandbagging during the opponent’s signature powerbomb finish on live television, making the move look sloppy.',
    plea: 'Not Guilty',
    sentencingOptions: [
      {
        id: 'sent-referee-duty',
        name: 'Ring Crew & Rookie Setup Duty for 4 Weeks',
        description: 'Defendant must arrive 3 hours early to help the ring crew set up the steel trusses and assemble the canvas.',
        moraleEffect: 'Locker room respects the old-school punishment (+5 Morale).',
        cost: 0
      },
      {
        id: 'sent-charity-fine',
        name: 'Mandatory $1,500 Fine to Wrestlers Benevolent Fund',
        description: 'Fine paid directly to injured wrestler medical relief fund.',
        moraleEffect: 'Locker room culture gains +4 Professionalism.',
        cost: 1500
      },
      {
        id: 'sent-beer-summit',
        name: 'Mandatory Beer & Match Tape Breakdown Session',
        description: 'Plaintiff and Defendant must sit down together for 2 hours, review the tape, and shake hands.',
        moraleEffect: 'Both wrestlers gain +10 In-Ring Chemistry.',
        cost: 100
      }
    ]
  },
  {
    title: 'The Missing Travel Rental Car Keys Prank',
    charge: 'Hiding the rental car keys in the arena ceiling tiles, stranding three midcarders at the airport for 4 hours after midnight.',
    plea: 'Remorseful',
    sentencingOptions: [
      {
        id: 'sent-chauffeur',
        name: 'Personal Locker Room Chauffeur Duty',
        description: 'Defendant must serve as designated driver for the victims for the next two road tours.',
        moraleEffect: 'Victims +12 Morale, Defendant humbled.',
        cost: 200
      },
      {
        id: 'sent-steak-dinner',
        name: 'High-End Steakhouse Dinner for the Crew',
        description: 'Pick up the tab for a 6-person filet mignon dinner at the local steakhouse.',
        moraleEffect: '+8 Morale boost to midcarders.',
        cost: 850
      },
      {
        id: 'sent-dismissal',
        name: 'Dismissed as Good-Natured Ribbing',
        description: 'The court rules it was a traditional wrestling rib. No penalty.',
        moraleEffect: 'Locker Room culture shifts towards Wild West.',
        cost: 0
      }
    ]
  },
  {
    title: 'Stealing Locker Room Corner Real Estate',
    charge: 'Unseating a 15-year veteran from their traditional locker room corner spot and plugging four personal gaming laptops into the wall outlets.',
    plea: 'Guilty',
    sentencingOptions: [
      {
        id: 'sent-coffee-duty',
        name: 'Veteran Coffee & Energy Drink Concierge',
        description: 'Defendant must supply iced lattes and protein shakes to the locker room leaders for 3 weeks.',
        moraleEffect: 'Veterans +10 Morale.',
        cost: 150
      },
      {
        id: 'sent-rookie-dress',
        name: 'Dress in the Hallway for One Week',
        description: 'Defendant’s locker is moved outside to the hallway next to the catering tables.',
        moraleEffect: 'Defendant -15 Morale, Veterans +5 Morale.',
        cost: 0
      }
    ]
  }
];

export function getDefaultCliquesForPromotion(promotion: Promotion): BackstageClique[] {
  const roster = promotion.roster || [];
  const pId = promotion.id;

  if (pId === 'apw' || pId.includes('apex')) {
    const mainEventers = roster.filter(w => w.push === 'Main Eventer').map(w => w.id);
    const midcarders = roster.filter(w => w.push === 'Midcard' || w.push === 'Upper Midcard').map(w => w.id);
    const vets = roster.filter(w => w.age >= 34).map(w => w.id);

    return [
      {
        id: 'clique-apw-elite',
        name: 'The Apex Kliq',
        leaderId: mainEventers[0] || roster[0]?.id || '',
        memberIds: mainEventers.slice(0, 3),
        influence: 88,
        solidarity: 85,
        agendaType: 'Title Chasers',
        reputation: 'Dominant backstage cabal that holds the ear of management and lobbies relentlessly for main event PPV spots.',
        currentDemand: {
          id: 'demand-apw-1',
          description: 'Demands that at least one Kliq member is featured in the main event match of the next two television broadcasts.',
          deadlineWeek: 4,
          penaltyText: '-15 Morale for all Kliq members and threat of booking veto if ignored.'
        }
      },
      {
        id: 'clique-apw-young-guns',
        name: 'The New Era Syndicate',
        leaderId: midcarders[0] || roster[1]?.id || '',
        memberIds: midcarders.slice(0, 3),
        influence: 62,
        solidarity: 90,
        agendaType: 'Creative Autonomy',
        reputation: 'Hungry young workrate dynamos demanding clean finishes, 20-minute match times, and protection from veteran squash matches.',
        currentDemand: {
          id: 'demand-apw-2',
          description: 'Requests a competitive showcase match against a top-tier veteran with a clean pinfall or submission finish.',
          deadlineWeek: 3,
          penaltyText: '-10 Morale and public complaints on wrestling social media.'
        }
      },
      {
        id: 'clique-apw-council',
        name: 'The Veterans’ Council',
        leaderId: vets[0] || roster[2]?.id || '',
        memberIds: vets.slice(0, 3),
        influence: 75,
        solidarity: 80,
        agendaType: 'Company Loyalists',
        reputation: 'Respected territory veterans who enforce old-school ring etiquette and mentor rookies behind closed doors.'
      }
    ];
  }

  if (pId === 'vu' || pId.includes('vanilla') || pId.includes('underground')) {
    const hardcore = roster.filter(w => w.style === 'Hardcore' || w.style === 'Brawler').map(w => w.id);
    const technicians = roster.filter(w => w.style === 'Technician' || w.style === 'High Flyer').map(w => w.id);

    return [
      {
        id: 'clique-vu-deathmatch',
        name: 'The Blood & Barbed Wire Brotherhood',
        leaderId: hardcore[0] || roster[0]?.id || '',
        memberIds: hardcore.slice(0, 4),
        influence: 92,
        solidarity: 95,
        agendaType: 'Creative Autonomy',
        reputation: 'Extreme deathmatch icons who refuse to tone down the violence for corporate television sponsors.',
        currentDemand: {
          id: 'demand-vu-1',
          description: 'Demands at least one Hardcore or No DQ match on every weekly underground broadcast.',
          deadlineWeek: 2,
          penaltyText: 'Locker room walkout warning and locker room trash talk.'
        }
      },
      {
        id: 'clique-vu-mat',
        name: 'The Outlaw Grapplers',
        leaderId: technicians[0] || roster[1]?.id || '',
        memberIds: technicians.slice(0, 3),
        influence: 58,
        solidarity: 78,
        agendaType: 'Title Chasers',
        reputation: 'Underground purists determined to prove pure catch wrestling outclasses garbage brawling.'
      }
    ];
  }

  // Generic fallback for custom promotions
  const sortedByOverness = [...roster].sort((a, b) => b.overness - a.overness);
  return [
    {
      id: `clique-${Date.now()}-1`,
      name: 'The Main Event Coalition',
      leaderId: sortedByOverness[0]?.id || '',
      memberIds: sortedByOverness.slice(0, 3).map(w => w.id),
      influence: 82,
      solidarity: 85,
      agendaType: 'Title Chasers',
      reputation: 'Top drawing stars who stick together during contract negotiations and card bookings.'
    },
    {
      id: `clique-${Date.now()}-2`,
      name: 'The Locker Room Loyalists',
      leaderId: sortedByOverness[3]?.id || '',
      memberIds: sortedByOverness.slice(3, 6).map(w => w.id),
      influence: 68,
      solidarity: 75,
      agendaType: 'Company Loyalists',
      reputation: 'Dependable midcarders and workhorses who keep backstage morale high.'
    }
  ];
}

// Bidding War Initializer
export function generateBiddingWarForWrestler(
  wrestler: Wrestler,
  currentWeek: number,
  playerPromotion: Promotion
): ContractBiddingWar {
  const rivalPromos = [
    { name: 'Apex Pro Wrestling', color: '#f59e0b', type: 'Rival Promotion' as const, salaryMult: 1.35, bonus: 45000 },
    { name: 'Vanilla Underground', color: '#ef4444', type: 'Rival Promotion' as const, salaryMult: 1.15, bonus: 20000, creativeControl: true },
    { name: 'Super Saturday Pro', color: '#3b82f6', type: 'Rival Promotion' as const, salaryMult: 1.25, bonus: 30000 },
    { name: 'Shin-Nihon Pro Budo (Japan)', color: '#dc2626', type: 'International' as const, salaryMult: 1.45, bonus: 60000, limitedSchedule: true },
    { name: 'Consejo Mundial de Lucha (Mexico)', color: '#10b981', type: 'International' as const, salaryMult: 1.20, bonus: 25000 }
  ].filter(p => !playerPromotion.name.toLowerCase().includes(p.name.split(' ')[0].toLowerCase()));

  // Pick top 2 rival bidders
  const shuffledRivals = [...rivalPromos].sort(() => 0.5 - Math.random()).slice(0, 2);

  const priorities: ContractBiddingWar['wrestlerPriority'][] = [
    'Money & Bonuses',
    'Creative Freedom',
    'Championship Push',
    'Lighter Schedule',
    'Loyalty to Promotion'
  ];
  const priority = priorities[Math.floor(Math.random() * priorities.length)];

  const baseSalary = wrestler.salary || 4000;
  const initialBids: ContractBid[] = shuffledRivals.map((r, idx) => {
    const salary = Math.round(baseSalary * r.salaryMult);
    const bonus = r.bonus + (wrestler.overness * 250);
    const score = Math.round((salary * 0.4) + (bonus * 0.05) + (r.creativeControl ? 25 : 0) + (r.limitedSchedule ? 20 : 0));

    return {
      id: `bid-rival-${Date.now()}-${idx}`,
      bidderType: r.type,
      bidderName: r.name,
      bidderColor: r.color,
      weeklySalary: salary,
      signingBonus: bonus,
      contractWeeks: 52,
      perks: {
        creativeControl: !!r.creativeControl,
        limitedSchedule: !!r.limitedSchedule,
        guaranteedMainEventPush: wrestler.overness >= 80,
        merchRoyaltyPct: 15,
        signingPerkNote: r.creativeControl 
          ? 'Guaranteed creative veto over all match finishes and turns.'
          : r.limitedSchedule
          ? 'Limited 35-date domestic tour schedule with zero house shows.'
          : 'Full international travel package with executive first-class travel.'
      },
      totalValueScore: score,
      submittedWeek: currentWeek
    };
  });

  const leadingBid = [...initialBids].sort((a, b) => b.totalValueScore - a.totalValueScore)[0];

  return {
    id: `bidwar-${Date.now()}-${wrestler.id}`,
    wrestlerId: wrestler.id,
    wrestlerName: wrestler.name,
    currentSalary: baseSalary,
    currentContractWeeksRemaining: wrestler.contractWeeks || 6,
    startingOverness: wrestler.overness,
    startingMorale: wrestler.morale,
    status: 'Open Bidding',
    deadlineWeek: currentWeek + 3,
    leadingBidderName: leadingBid?.bidderName || 'Unknown Rival',
    bids: initialBids,
    wrestlerPriority: priority,
    decisionNotes: `${wrestler.name} is weighing multi-year offers. Their primary career motivation is: "${priority}".`
  };
}

export function evaluateWrestlerBiddingDecision(
  war: ContractBiddingWar,
  playerPromotion: Promotion
): { winnerBid: ContractBid; isPlayerWinner: boolean; decisionSummary: string } {
  const scoredBids = war.bids.map(bid => {
    let score = (bid.weeklySalary * 0.5) + (bid.signingBonus * 0.05);

    // Factor in wrestler's priority
    if (war.wrestlerPriority === 'Money & Bonuses') {
      score += (bid.signingBonus * 0.08) + (bid.weeklySalary * 0.3);
    } else if (war.wrestlerPriority === 'Creative Freedom' && bid.perks.creativeControl) {
      score += 5000;
    } else if (war.wrestlerPriority === 'Lighter Schedule' && bid.perks.limitedSchedule) {
      score += 4500;
    } else if (war.wrestlerPriority === 'Championship Push' && bid.perks.guaranteedMainEventPush) {
      score += 4000;
    } else if (war.wrestlerPriority === 'Loyalty to Promotion' && bid.bidderType === 'Player') {
      score += 6000; // Hometown discount
    }

    // Incumbent player bonus if morale is high
    if (bid.bidderType === 'Player') {
      const wrestler = playerPromotion.roster.find(w => w.id === war.wrestlerId);
      if (wrestler && wrestler.morale >= 80) {
        score += 3500;
      }
    }

    return { bid, score };
  });

  scoredBids.sort((a, b) => b.score - a.score);
  const best = scoredBids[0];
  const isPlayerWinner = best.bid.bidderType === 'Player';

  const decisionSummary = isPlayerWinner
    ? `${war.wrestlerName} signs a massive extension with ${playerPromotion.name}! They cited competitive compensation and locker room loyalty.`
    : `${war.wrestlerName} has formally signed with ${best.bid.bidderName}! The rival offer of $${best.bid.weeklySalary}/week with a $${best.bid.signingBonus.toLocaleString()} signing bonus was too lucrative to refuse.`;

  return {
    winnerBid: best.bid,
    isPlayerWinner,
    decisionSummary
  };
}
