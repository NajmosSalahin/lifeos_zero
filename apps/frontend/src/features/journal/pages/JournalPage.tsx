import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, Search, Star, Trash2, Edit2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../shared/lib/axios';
import { qk } from '../../../shared/lib/queryKeys';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';
import { useToast } from '../../../shared/hooks/useToast';
import { formatDate, truncate } from '../../../shared/lib/utils';
import { useDebounce } from '../../../shared/hooks/useDebounce';

export default function JournalPage() {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const dSearch = useDebounce(search, 400);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { success } = useToast();

  const params: any = {};
  if (dSearch) params.q = dSearch;
  if (activeTag) params.tag = activeTag;
  if (favoriteOnly) params.favorite = 'true';

  const { data, isLoading } = useQuery({
    queryKey: dSearch ? ['journal-search', dSearch] : qk.journal.all(params),
    queryFn: () => dSearch
      ? api.get(`/journal/search?q=${encodeURIComponent(dSearch)}`).then(r => ({ items: r.data.data.results, total: r.data.data.results.length }))
      : api.get('/journal', { params }).then(r => r.data.data),
  });

  const { data: tagsData } = useQuery({ queryKey: qk.journal.tags(), queryFn: () => api.get('/journal/tags').then(r => r.data.data.tags) });
  const { data: stats } = useQuery({ queryKey: qk.journal.stats(), queryFn: () => api.get('/journal/stats').then(r => r.data.data.stats) });

  const favMut = useMutation({
    mutationFn: (id: string) => api.patch(`/journal/${id}/favorite`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/journal/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['journal'] }); success('Entry deleted'); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color:'var(--color-text-primary)' }}>Journal</h1>
          {stats && <p className="text-sm mt-0.5" style={{ color:'var(--color-text-muted)' }}>{stats.totalEntries} entries · {stats.totalWords?.toLocaleString()} words</p>}
        </div>
        <button onClick={()=>navigate('/journal/new')} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor:'var(--color-accent)' }}>
          <Plus className="h-4 w-4" /> New Entry
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color:'var(--color-text-muted)' }} />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search entries…"
          className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
          style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
      </div>

      {/* Tag filters */}
      {tagsData?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={()=>setFavoriteOnly(!favoriteOnly)}
            className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors"
            style={favoriteOnly?{backgroundColor:'var(--color-accent)',color:'#fff'}:{backgroundColor:'var(--color-surface)',border:'1px solid var(--color-border)',color:'var(--color-text-secondary)'}}>
            <Star className="h-3 w-3" /> Favorites
          </button>
          {tagsData.slice(0,8).map((t: any) => (
            <button key={t.tag} onClick={()=>setActiveTag(activeTag===t.tag?'':t.tag)}
              className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={activeTag===t.tag?{backgroundColor:'var(--color-accent)',color:'#fff'}:{backgroundColor:'var(--color-surface)',border:'1px solid var(--color-border)',color:'var(--color-text-secondary)'}}>
              {t.tag} <span style={{ opacity:0.6 }}>({t.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Entries */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-24 rounded-xl border animate-pulse" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)' }} />)}</div>
      ) : data?.items?.length === 0 ? (
        <EmptyState icon={BookOpen} title="No entries yet" description="Write your first journal entry." action={{ label:'Write entry', onClick:()=>navigate('/journal/new') }} />
      ) : (
        <div className="space-y-3">
          {data?.items?.map((e: any) => (
            <div key={e._id} className="group rounded-xl border p-4 transition-colors hover:border-[var(--color-border-active)] cursor-pointer"
              style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}
              onClick={()=>navigate(`/journal/${e._id}`)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate" style={{ color:'var(--color-text-primary)' }}>{e.title}</h3>
                  <p className="text-xs mt-1" style={{ color:'var(--color-text-muted)' }}>{formatDate(e.date)} · {e.wordCount} words · {e.readingTimeMinutes} min read</p>
                  {e.tags?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {e.tags.map((t:string) => <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor:'var(--color-surface-2)', color:'var(--color-text-muted)' }}>{t}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e2=>e2.stopPropagation()}>
                  <button onClick={()=>favMut.mutate(e._id)} className="rounded-lg p-1.5 hover:bg-[var(--color-surface-2)]" style={{ color: e.isFavorite ? '#f59e0b' : 'var(--color-text-muted)' }}>
                    <Star className="h-3.5 w-3.5" fill={e.isFavorite?'#f59e0b':'none'} />
                  </button>
                  <button onClick={()=>navigate(`/journal/${e._id}`)} className="rounded-lg p-1.5 hover:bg-[var(--color-surface-2)]" style={{ color:'var(--color-text-muted)' }}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={()=>{ if(confirm('Delete this entry?')) deleteMut.mutate(e._id); }} className="rounded-lg p-1.5 hover:bg-[var(--color-surface-2)] hover:text-rose-400" style={{ color:'var(--color-text-muted)' }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
