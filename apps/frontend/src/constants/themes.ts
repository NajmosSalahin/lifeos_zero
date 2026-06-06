export interface ThemeMeta { id: string; label: string; isDark: boolean; preview: { bg: string; surface: string; text: string; accent: string; }; }
export const THEMES: ThemeMeta[] = [
  { id:'dark',        label:'Dark',        isDark:true,  preview:{bg:'#0f0f11',surface:'#1a1a1f',text:'#f1f1f3',accent:'#6366f1'} },
  { id:'light',       label:'Light',       isDark:false, preview:{bg:'#f8f9fc',surface:'#ffffff',text:'#0f172a',accent:'#6366f1'} },
  { id:'catppuccin',  label:'Catppuccin',  isDark:true,  preview:{bg:'#1e1e2e',surface:'#181825',text:'#cdd6f4',accent:'#cba6f7'} },
  { id:'nord',        label:'Nord',        isDark:true,  preview:{bg:'#2e3440',surface:'#3b4252',text:'#eceff4',accent:'#88c0d0'} },
  { id:'dracula',     label:'Dracula',     isDark:true,  preview:{bg:'#282a36',surface:'#21222c',text:'#f8f8f2',accent:'#bd93f9'} },
  { id:'tokyo-night', label:'Tokyo Night', isDark:true,  preview:{bg:'#1a1b26',surface:'#16161e',text:'#c0caf5',accent:'#7aa2f7'} },
  { id:'gruvbox',     label:'Gruvbox',     isDark:true,  preview:{bg:'#282828',surface:'#32302f',text:'#ebdbb2',accent:'#d79921'} },
  { id:'rose-pine',   label:'Rosé Pine',   isDark:true,  preview:{bg:'#191724',surface:'#1f1d2e',text:'#e0def4',accent:'#c4a7e7'} },
  { id:'everforest',  label:'Everforest',  isDark:true,  preview:{bg:'#272e33',surface:'#2e383c',text:'#d3c6aa',accent:'#a7c080'} },
  { id:'one-dark',    label:'One Dark',    isDark:true,  preview:{bg:'#282c34',surface:'#21252b',text:'#abb2bf',accent:'#61afef'} },
  { id:'solarized',   label:'Solarized',   isDark:true,  preview:{bg:'#002b36',surface:'#073642',text:'#eee8d5',accent:'#268bd2'} },
];
