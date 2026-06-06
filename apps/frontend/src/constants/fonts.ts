export interface FontMeta { id: string; label: string; type: 'sans'|'serif'|'mono'; }
export const FONTS: FontMeta[] = [
  { id:'inter',             label:'Inter',             type:'sans'  },
  { id:'manrope',           label:'Manrope',           type:'sans'  },
  { id:'plus-jakarta-sans', label:'Plus Jakarta Sans',  type:'sans'  },
  { id:'merriweather',      label:'Merriweather',      type:'serif' },
  { id:'jetbrains-mono',    label:'JetBrains Mono',    type:'mono'  },
  { id:'fira-code',         label:'Fira Code',         type:'mono'  },
];
