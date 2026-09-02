const MACRONS = ['ā', 'ē', 'ī', 'ō', 'ū', 'ȳ', 'Ā', 'Ē', 'Ī', 'Ō', 'Ū']

/**
 * Click-to-insert long vowels, since macrons are part of a Latin word's
 * spelling but awkward to type on a normal keyboard.
 */
export function MacronBar({
  onInsert,
  className = '',
}: {
  onInsert: (char: string) => void
  className?: string
}) {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {MACRONS.map((char) => (
        <button
          key={char}
          type="button"
          // Keep focus in the text field so the caret position survives.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onInsert(char)}
          className="h-8 w-8 rounded-lg border-2 border-black bg-white text-base font-bold shadow-hard-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
        >
          {char}
        </button>
      ))}
    </div>
  )
}

/** Inserts `char` at the caret of an input/textarea and fires onChange. */
export function insertAtCaret(
  el: HTMLInputElement | HTMLTextAreaElement | null,
  char: string,
  onChange: (value: string) => void,
) {
  if (!el) {
    return
  }
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? el.value.length
  const next = el.value.slice(0, start) + char + el.value.slice(end)
  onChange(next)
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(start + char.length, start + char.length)
  })
}
