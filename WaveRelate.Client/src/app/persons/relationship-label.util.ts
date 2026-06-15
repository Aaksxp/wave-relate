export type RelationStep = 'parent' | 'child' | 'spouse' | 'sibling';

export interface RelationPath {
  steps: RelationStep[];
  siblingOrder?: 'elder' | 'younger';
}

export interface GraphEdge {
  sourceId: number;
  targetId: number;
  relationshipType: number;
}

interface AdjEntry {
  neighborId: number;
  step: RelationStep;
  siblingOrder?: 'elder' | 'younger';
}

type GenderKey = 'male' | 'female' | undefined;

/**
 * Builds a per-node adjacency list where each entry describes what the
 * neighbor *is* relative to the current node (e.g. "parent", "child").
 */
function buildAdjacency(edges: GraphEdge[]): Map<number, AdjEntry[]> {
  const adj = new Map<number, AdjEntry[]>();
  const add = (nodeId: number, entry: AdjEntry) => {
    if (!adj.has(nodeId)) adj.set(nodeId, []);
    adj.get(nodeId)!.push(entry);
  };

  for (const e of edges) {
    switch (e.relationshipType) {
      case 1: // target is the parent of source
        add(e.sourceId, { neighborId: e.targetId, step: 'parent' });
        add(e.targetId, { neighborId: e.sourceId, step: 'child' });
        break;
      case 2: // target is the child of source
        add(e.sourceId, { neighborId: e.targetId, step: 'child' });
        add(e.targetId, { neighborId: e.sourceId, step: 'parent' });
        break;
      case 3: // spouses
        add(e.sourceId, { neighborId: e.targetId, step: 'spouse' });
        add(e.targetId, { neighborId: e.sourceId, step: 'spouse' });
        break;
      case 4: // siblings, order unknown
        add(e.sourceId, { neighborId: e.targetId, step: 'sibling' });
        add(e.targetId, { neighborId: e.sourceId, step: 'sibling' });
        break;
      case 5: // source is the elder sibling of target
        add(e.sourceId, { neighborId: e.targetId, step: 'sibling', siblingOrder: 'younger' });
        add(e.targetId, { neighborId: e.sourceId, step: 'sibling', siblingOrder: 'elder' });
        break;
      case 6: // source is the younger sibling of target
        add(e.sourceId, { neighborId: e.targetId, step: 'sibling', siblingOrder: 'elder' });
        add(e.targetId, { neighborId: e.sourceId, step: 'sibling', siblingOrder: 'younger' });
        break;
    }
  }

  return adj;
}

/**
 * Computes the shortest relation path from rootId to every other reachable
 * node in the graph, expressed as a sequence of steps (parent/child/spouse/sibling).
 */
export function computeRelationPaths(edges: GraphEdge[], rootId: number): Map<number, RelationPath> {
  const adj = buildAdjacency(edges);
  const result = new Map<number, RelationPath>();
  const visited = new Set<number>([rootId]);
  const queue: { id: number; steps: RelationStep[]; siblingOrder?: 'elder' | 'younger' }[] = [{ id: rootId, steps: [] }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const entry of adj.get(current.id) ?? []) {
      if (visited.has(entry.neighborId)) continue;
      visited.add(entry.neighborId);

      const steps = [...current.steps, entry.step];
      const siblingOrder = steps.length === 1 && entry.step === 'sibling' ? entry.siblingOrder : undefined;
      const path: RelationPath = { steps, siblingOrder };

      result.set(entry.neighborId, path);
      queue.push({ id: entry.neighborId, steps, siblingOrder });
    }
  }

  return result;
}

/**
 * Collapses redundant step combinations down to a canonical form so that
 * relationships discovered via different routes (e.g. an uncle reached via
 * a shared grandparent vs. via a direct sibling-of-parent record) resolve
 * to the same label. After this pass, the path is one of:
 *  - ['spouse']
 *  - 'parent'*N                                  (ancestors)
 *  - 'child'*N                                   (descendants)
 *  - 'sibling'                                   (siblings)
 *  - 'parent'*N + 'sibling'                      (aunts/uncles, going up N)
 *  - 'sibling' + 'child'*N                       (nieces/nephews, going down N)
 *  - 'parent'*N + 'sibling' + 'child'*M          (cousins)
 *  - plus a small set of in-law/step patterns involving 'spouse'
 */
function canonicalize(steps: RelationStep[]): RelationStep[] {
  let result = [...steps];
  let changed = true;

  while (changed) {
    changed = false;
    for (let i = 0; i < result.length - 1; i++) {
      const pair = `${result[i]}-${result[i + 1]}`;
      let replacement: RelationStep[] | null = null;

      switch (pair) {
        case 'parent-child': replacement = ['sibling']; break; // shared-parent's other child
        case 'child-parent': replacement = ['spouse']; break;  // co-parent of your child
        case 'sibling-sibling': replacement = ['sibling']; break;
        case 'spouse-spouse': replacement = []; break;
        case 'sibling-parent': replacement = ['parent']; break; // your sibling's parent is your parent
        case 'child-sibling': replacement = ['child']; break;   // your child's sibling is your child
      }

      if (replacement) {
        result = [...result.slice(0, i), ...replacement, ...result.slice(i + 2)];
        changed = true;
        break;
      }
    }
  }

  return result;
}

function countLeading(steps: RelationStep[], step: RelationStep): number {
  let n = 0;
  while (n < steps.length && steps[n] === step) n++;
  return n;
}

function greatPrefix(n: number): string {
  return n > 0 ? 'Great-'.repeat(n) : '';
}

function ancestorLabel(generations: number, gender: GenderKey): string {
  if (generations === 1) return gender === 'male' ? 'Father' : gender === 'female' ? 'Mother' : 'Parent';
  if (generations === 2) return gender === 'male' ? 'Grandfather' : gender === 'female' ? 'Grandmother' : 'Grandparent';
  const prefix = greatPrefix(generations - 2);
  return gender === 'male' ? `${prefix}grandfather` : gender === 'female' ? `${prefix}grandmother` : `${prefix}grandparent`;
}

function descendantLabel(generations: number, gender: GenderKey): string {
  if (generations === 1) return gender === 'male' ? 'Son' : gender === 'female' ? 'Daughter' : 'Child';
  if (generations === 2) return gender === 'male' ? 'Grandson' : gender === 'female' ? 'Granddaughter' : 'Grandchild';
  const prefix = greatPrefix(generations - 2);
  return gender === 'male' ? `${prefix}grandson` : gender === 'female' ? `${prefix}granddaughter` : `${prefix}grandchild`;
}

function uncleAuntLabel(generations: number, gender: GenderKey): string {
  if (generations === 1) return gender === 'male' ? 'Uncle' : gender === 'female' ? 'Aunt' : 'Uncle/Aunt';
  if (generations === 2) return gender === 'male' ? 'Grand-uncle' : gender === 'female' ? 'Grand-aunt' : 'Grand-uncle/aunt';
  const prefix = greatPrefix(generations - 2);
  return gender === 'male' ? `${prefix}grand-uncle` : gender === 'female' ? `${prefix}grand-aunt` : `${prefix}grand-uncle/aunt`;
}

function nephewNieceLabel(generations: number, gender: GenderKey): string {
  if (generations === 1) return gender === 'male' ? 'Nephew' : gender === 'female' ? 'Niece' : 'Nephew/Niece';
  if (generations === 2) return gender === 'male' ? 'Grand-nephew' : gender === 'female' ? 'Grand-niece' : 'Grand-nephew/niece';
  const prefix = greatPrefix(generations - 2);
  return gender === 'male' ? `${prefix}grand-nephew` : gender === 'female' ? `${prefix}grand-niece` : `${prefix}grand-nephew/niece`;
}

function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

function removedWord(n: number): string {
  if (n === 1) return 'Once';
  if (n === 2) return 'Twice';
  return `${n} Times`;
}

function cousinLabel(generationsUp: number, generationsDown: number): string {
  const degree = Math.min(generationsUp, generationsDown);
  const removed = Math.abs(generationsUp - generationsDown);
  let label = `${ordinal(degree)} Cousin`;
  if (removed > 0) label += ` ${removedWord(removed)} Removed`;
  return label;
}

function siblingLabel(gender: GenderKey, order?: 'elder' | 'younger'): string {
  const base = gender === 'male' ? 'Brother' : gender === 'female' ? 'Sister' : 'Sibling';
  if (order === 'elder') return `Elder ${base}`;
  if (order === 'younger') return `Younger ${base}`;
  return base;
}

/** Categorizes a canonical, spouse-free path into a label. */
function categorize(steps: RelationStep[], gender: GenderKey, siblingOrder?: 'elder' | 'younger'): string {
  if (steps.length === 0) return 'Extended family';

  const up = countLeading(steps, 'parent');
  const afterUp = steps.slice(up);
  const hasSibling = afterUp[0] === 'sibling';
  const afterSibling = hasSibling ? afterUp.slice(1) : afterUp;
  const down = countLeading(afterSibling, 'child');
  const remainder = afterSibling.slice(down);

  if (remainder.length > 0) return 'Extended family';

  if (up === 0 && down === 0) {
    return hasSibling ? siblingLabel(gender, siblingOrder) : 'Extended family';
  }

  if (!hasSibling) {
    return down === 0 ? ancestorLabel(up, gender) : descendantLabel(down, gender);
  }

  if (down === 0) return uncleAuntLabel(up, gender);
  if (up === 0) return nephewNieceLabel(down, gender);
  return cousinLabel(up, down);
}

/**
 * Maps a relation path + the target person's gender to a human-friendly
 * relationship label (Father, Aunt, 2nd Cousin Once Removed, etc).
 */
export function getRelationshipLabel(path: RelationPath, gender?: string): string {
  const g = gender?.toLowerCase();
  const genderKey: GenderKey = g === 'male' ? 'male' : g === 'female' ? 'female' : undefined;

  const canonical = canonicalize(path.steps);
  const key = canonical.join('-');

  switch (key) {
    case 'spouse':
      return genderKey === 'male' ? 'Husband' : genderKey === 'female' ? 'Wife' : 'Spouse';
    case 'spouse-parent':
      return genderKey === 'male' ? 'Father-in-law' : genderKey === 'female' ? 'Mother-in-law' : 'Parent-in-law';
    case 'spouse-sibling':
    case 'sibling-spouse':
      return genderKey === 'male' ? 'Brother-in-law' : genderKey === 'female' ? 'Sister-in-law' : 'Sibling-in-law';
    case 'child-spouse':
      return genderKey === 'male' ? 'Son-in-law' : genderKey === 'female' ? 'Daughter-in-law' : 'Child-in-law';
  }

  // Step-relations (parent's spouse, spouse's child, parent-spouse-child, etc.)
  // and other relations by marriage fall back to the equivalent blood-relation
  // label, using the target's own gender.
  let core = canonical;
  if (core[0] === 'spouse') core = core.slice(1);
  else if (core[core.length - 1] === 'spouse') core = core.slice(0, -1);

  return categorize(core, genderKey, path.siblingOrder);
}

export type RelationshipBucket = 'parent' | 'child' | 'spouse' | 'sibling' | 'extended';

/**
 * Buckets a relation path into Parents/Children/Spouse/Siblings or
 * 'extended'. Only paths that canonicalize to a single direct step
 * (parent/child/spouse/sibling) belong in the main family cards -
 * everything else (in-laws, step-relations, grandparents, cousins, etc.)
 * is 'extended'.
 */
export function getRelationshipBucket(path: RelationPath): RelationshipBucket {
  const canonical = canonicalize(path.steps);
  if (canonical.length === 1) {
    switch (canonical[0]) {
      case 'parent': return 'parent';
      case 'child': return 'child';
      case 'spouse': return 'spouse';
      case 'sibling': return 'sibling';
    }
  }
  return 'extended';
}

/**
 * Computes a sort priority for a person in the Extended family list,
 * grouping relatives by how closely related they are. Lower numbers are
 * shown first. Rough ordering:
 *   0-9:    siblings reached only via in-law/step paths (rare edge cases)
 *   10-19:  ancestors beyond a parent (grandparents, great-grandparents, ...)
 *   20-29:  aunts/uncles and grand-aunts/uncles
 *   30-59:  cousins, grouped by degree (1st, 2nd, ...) and removal
 *   50-59:  nephews/nieces and grand-nephews/nieces
 *   60-69:  descendants beyond a child (grandchildren, ...)
 *   900-969: in-law / step relations (e.g. father-in-law, step-father),
 *            ranked the same as their underlying blood relation but pushed
 *            after all blood relatives
 *   1000:   anything that doesn't reduce to a simple relation
 */
export function getExtendedFamilyRank(path: RelationPath): number {
  const canonical = canonicalize(path.steps);
  if (canonical.length === 0) return 1000;

  let core = canonical;
  let inLaw = false;
  if (core[0] === 'spouse') {
    core = core.slice(1);
    inLaw = true;
  } else if (core[core.length - 1] === 'spouse') {
    core = core.slice(0, -1);
    inLaw = true;
  }

  const rank = coreRank(core);
  return inLaw ? 900 + rank : rank;
}

function coreRank(steps: RelationStep[]): number {
  if (steps.length === 0) return 1000;

  const up = countLeading(steps, 'parent');
  const afterUp = steps.slice(up);
  const hasSibling = afterUp[0] === 'sibling';
  const afterSibling = hasSibling ? afterUp.slice(1) : afterUp;
  const down = countLeading(afterSibling, 'child');
  const remainder = afterSibling.slice(down);

  if (remainder.length > 0) return 1000;

  if (up === 0 && down === 0) return hasSibling ? 5 : 1000;

  if (!hasSibling) {
    return down === 0 ? 10 + up : 60 + down;
  }

  if (down === 0) return 20 + up;
  if (up === 0) return 50 + down;

  const degree = Math.min(up, down);
  const removed = Math.abs(up - down);
  return 30 + degree * 5 + removed;
}
