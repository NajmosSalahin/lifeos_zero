export interface FontMeta { id: string; label: string; type: 'sans'|'serif'|'mono'; }
export const FONTS: FontMeta[] = [
  { id:'inter',             label:'inter',             type:'sans'  },
  { id:'manrope',           label:'manrope',           type:'sans'  },
  { id:'plus-jakarta-sans', label:'plus jakarta sans',  type:'sans'  },
  { id:'merriweather',      label:'merriweather',      type:'serif' },
  { id:'jetbrains-mono',    label:'jetbrains mono',    type:'mono'  },
  { id:'fira-code',         label:'fira code',         type:'mono'  },
];
