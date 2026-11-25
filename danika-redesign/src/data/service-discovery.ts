import { orig } from '@/data/site';
import { electricalProblems, electricalServices, morePlumbing, plumbingServices } from '@/data/services';
import type { ServiceScene } from '@/components/ServiceIllustration';
import type { ServiceIconName } from '@/components/icons/ServiceIcon';
import type { ImageKey } from '@/lib/images';
import stock from '@/data/stock.json';

/**
 * Picture for a card. `danika` = a genuine company photo from images.json, `stock` = a labelled stock slot from stock.json,
 * `art` = original service-specific illustration (no suitable photo yet), `tile` = no photo exists for this service yet, so the card shows a branded icon tile instead of a mismatched picture.
 */
export type DiscoveryMedia =
  | { kind: 'danika'; key: ImageKey; position?: string }
  | { kind: 'stock'; slot: keyof typeof stock; position?: string }
  | { kind: 'art'; scene: ServiceScene }
  | { kind: 'tile' };

export type DiscoveryRow = { title: string; text: string; href: string; icon: ServiceIconName; media: DiscoveryMedia };
export type DiscoveryCategory = {
  id: 'plumbing' | 'electrical';
  label: string;
  description: string;
  rows: DiscoveryRow[];
  /** Every other service in the category (same titles and destinations as services.ts), shown under "More ... services". */
  more: { title: string; href: string }[];
  all: { label: string; href: string };
};

/** Destinations always come from the existing service data; a missing title fails the build instead of shipping a dead link. */
const hrefOf = (title: string) => {
  const hit = [...plumbingServices, ...electricalServices].find((s) => s.title === title);
  if (!hit) throw new Error(`service-discovery: "${title}" not found in src/data/services.ts`);
  return hit.href;
};

/**
 * Short description for a card: the service's own text in services.ts. Two electrical services have none there, so they borrow the
 * matching line the site already uses in its electrical problem list (`electricalProblems`). Nothing is written fresh here, and a
 * missing description fails the build.
 */
const textOf = (source: string, problemTitle?: string) => {
  const own = [...plumbingServices, ...electricalServices].find((s) => s.title === source)?.text;
  const text = own ?? electricalProblems.find((p) => p.title === problemTitle)?.text;
  if (!text) throw new Error(`service-discovery: no description for "${source}"`);
  return text;
};

/** `source` is the title in services.ts; `title` is the (optionally shorter) label shown on the card. */
const row = (source: string, icon: ServiceIconName, media: DiscoveryMedia, title = source, problemTitle?: string): DiscoveryRow => ({
  title, text: SHORT[title] ?? textOf(source, problemTitle), href: hrefOf(source), icon, media,
});

/**
 * Card summaries: the existing description for each service, trimmed to one short line so a card reads at a glance.
 * Each one only restates what the full text already says. The detail stays on the service page behind "Read More".
 */
const SHORT: Record<string, string> = {
  'Emergency Plumbing': 'Burst pipes, sewer backups and major leaks, handled around the clock.',
  'Drain Cleaning': 'Cable machines sized to the line, with hydro jetting when needed.',
  'Water Heaters': 'Gas, electric and tankless units, plus venting and gas supply work.',
  'Sewer Repair': 'Camera inspection, spot repairs and full replacement, explained first.',
  'Emergency Electrician': 'Sparking outlets, a burning smell, or a dead circuit after a leak.',
  'Electrical Repair': 'Outlets or switches that stopped working, diagnosed and repaired.',
  'Panel Upgrades': 'Often the first step before an EV charger or electric tankless heater.',
  'EV Charger Installation': 'A home charger installed by a licensed electrician.',
};

/** All services of a category that are not already a featured card. Matching on destination keeps a renamed card from reappearing here. */
const remaining = (all: { title: string; href: string }[], featured: DiscoveryRow[]) => {
  const used = new Set(featured.map((r) => r.href));
  const seen = new Set<string>();
  return all.filter((s) => !used.has(s.href) && !seen.has(s.href) && seen.add(s.href)).map(({ title, href }) => ({ title, href }));
};

const plumbingRows: DiscoveryRow[] = [
  row('Emergency Plumbing', 'emergency-plumbing', { kind: 'danika', key: 'van', position: 'center 55%' }),
  row('Drain Cleaning', 'drain-cleaning', { kind: 'danika', key: 'drain' }),
  row('Water Heaters', 'water-heater', { kind: 'danika', key: 'waterHeater' }),
  row('Sewer Repair', 'sewer-repair', { kind: 'danika', key: 'project1' }),
];
const electricalRows: DiscoveryRow[] = [
  row('Emergency Electrician', 'emergency-electrician', { kind: 'art', scene: 'emergency-electrician' }),
  row('Electrical Repair', 'electrical-repair', { kind: 'stock', slot: 'electricianWiring', position: 'center 15%' }, 'Electrical Repair', 'Dead Outlets or Switches'),
  row('Electrical Panel Upgrades', 'panel-upgrade', { kind: 'stock', slot: 'electricalPanel', position: 'center 35%' }, 'Panel Upgrades'),
  row('EV Charger Installation', 'ev-charger', { kind: 'art', scene: 'ev-charger' }, 'EV Charger Installation', 'EV Charger Installation'),
];

export const discoveryCategories: DiscoveryCategory[] = [
  {
    id: 'plumbing',
    label: 'Plumbing',
    description: 'Drains, leaks, water heaters and sewer',
    rows: plumbingRows,
    more: remaining([...plumbingServices, ...morePlumbing], plumbingRows),
    all: { label: 'View all plumbing services', href: orig('/plumbing-services/') },
  },
  {
    id: 'electrical',
    label: 'Electrical',
    description: 'Panels, EV chargers, repairs and safety',
    rows: electricalRows,
    more: remaining(electricalServices, electricalRows),
    all: { label: 'View all electrical services', href: orig('/electrician-everett-wa/') },
  },
];
