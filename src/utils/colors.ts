// Light-mode-only badge palette: yellow, green, and blue tones with a thin
// black border to match the app's neobrutalist look.
const PALETTE = [
  'bg-amber-200 text-amber-950 border-black',
  'bg-emerald-300 text-emerald-950 border-black',
  'bg-sky-300 text-sky-950 border-black',
  'bg-lime-300 text-lime-950 border-black',
  'bg-yellow-300 text-yellow-950 border-black',
  'bg-cyan-300 text-cyan-950 border-black',
]

// Deterministically maps any label (category, tag) to a color from the
// palette so the same category always renders the same color.
export function colorForLabel(label: string): string {
  let hash = 0
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0
  }
  return PALETTE[hash % PALETTE.length]
}
