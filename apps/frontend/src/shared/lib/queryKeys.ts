export const qk = {
  auth:       { me: () => ['auth','me'] as const, sessions: () => ['auth','sessions'] as const },
  habits:     { all: (f?: any) => ['habits',f] as const, one: (id: string) => ['habits',id] as const, today: () => ['habits','today'] as const, streak: (id: string) => ['habits',id,'streak'] as const, stats: (id: string, d?: number) => ['habits',id,'stats',d] as const, calendar: (id: string, y: number) => ['habits',id,'calendar',y] as const },
  mood:       { all: (f?: any) => ['mood',f] as const, today: () => ['mood','today'] as const, insights: () => ['mood','insights'] as const, calendar: (y: number, m: number) => ['mood','cal',y,m] as const },
  sleep:      { all: (f?: any) => ['sleep',f] as const, stats: () => ['sleep','stats'] as const },
  hydration:  { all: (f?: any) => ['hydration',f] as const, today: () => ['hydration','today'] as const, stats: () => ['hydration','stats'] as const, templates: () => ['drink-templates'] as const },
  breathing:  { techniques: () => ['breathing','techniques'] as const, sessions: (f?: any) => ['breathing','sessions',f] as const, stats: () => ['breathing','stats'] as const },
  journal:    { all: (f?: any) => ['journal',f] as const, one: (id: string) => ['journal',id] as const, tags: () => ['journal','tags'] as const, stats: () => ['journal','stats'] as const },
  goals:      { all: (s?: string) => ['goals',s] as const, one: (id: string) => ['goals',id] as const },
  analytics:  { overview: (r?: string) => ['analytics','overview',r] as const, mood: (r?: string) => ['analytics','mood',r] as const, sleep: (r?: string) => ['analytics','sleep',r] as const, hydration: (r?: string) => ['analytics','hydration',r] as const, habits: (r?: string) => ['analytics','habits',r] as const, goals: () => ['analytics','goals'] as const },
  calendar:   { month: (y: number, m: number) => ['calendar',y,m] as const, day: (d: string) => ['calendar','day',d] as const },
  notifications: { all: () => ['notifications'] as const, count: () => ['notifications','count'] as const },
};
