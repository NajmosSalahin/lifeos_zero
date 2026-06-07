import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { ArrowLeft, Save, Bold, Italic, List, Heading2, Code, Quote, Star } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { qk } from '../../../shared/lib/queryKeys';
import { useToast } from '../../../shared/hooks/useToast';
import { cn } from '../../../shared/lib/utils';

export default function JournalEntryPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('general');
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: entry } = useQuery({
    queryKey: qk.journal.one(id!),
    queryFn: () => api.get(`/journal/${id}`).then(r => r.data.data.entry),
    enabled: !isNew && !!id,
  });

  const editor = useEditor({
    extensions: [
      StarterKit, Highlight,
      Placeholder.configure({ placeholder: 'what\'s on your mind today? write freely…' }),
    ],
    content: entry?.content || '',
    editorProps: { attributes: { class: 'prose-sm max-w-none' } },
  });

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setTags(entry.tags?.join(', ') || '');
      setCategory(entry.category || 'general');
      setIsFavorite(entry.isFavorite || false);
      if (editor && entry.content) { editor.commands.setContent(entry.content); }
    }
  }, [entry, editor]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const content = editor?.getHTML() ?? '';
      const contentText = editor?.getText() ?? '';
      const dto = { title: title || 'untitled', content, contentText, tags: tags.split(',').map(t=>t.trim()).filter(Boolean), category, isFavorite, date: new Date() };
      return isNew ? api.post('/journal', dto) : api.patch(`/journal/${id}`, dto);
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['journal'] });
      success('entry saved!');
      if (isNew) navigate(`/journal/${res.data.data.entry._id}`, { replace: true });
    },
    onError: (e:any) => error(e?.response?.data?.error?.message || 'failed to save'),
  });

  const ToolBtn = ({ onClick, active, icon: Icon, title }: any) => (
    <button onClick={onClick} title={title}
      className={cn('rounded p-1.5 transition-colors hover:bg-[var(--color-surface-2)]', active && 'bg-[var(--color-surface-3)]')}
      style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={()=>navigate('/journal')} className="flex items-center gap-2 text-sm transition-colors hover:text-[var(--color-text-primary)]" style={{ color:'var(--color-text-muted)' }}>
          <ArrowLeft className="h-4 w-4" /> back
        </button>
        <div className="flex items-center gap-2">
          <button onClick={()=>setIsFavorite(!isFavorite)} className="rounded-lg p-2 transition-colors hover:bg-[var(--color-surface-2)]" style={{ color: isFavorite?'#f59e0b':'var(--color-text-muted)' }}>
            <Star className="h-4 w-4" fill={isFavorite?'#f59e0b':'none'} />
          </button>
          <button onClick={()=>saveMut.mutate()} disabled={saving||saveMut.isPending}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor:'var(--color-accent)' }}>
            <Save className="h-4 w-4" />{saveMut.isPending?'saving…':'save'}
          </button>
        </div>
      </div>

      {/* Title */}
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="entry title…"
        className="w-full bg-transparent text-2xl font-bold outline-none placeholder:opacity-30 border-b pb-2"
        style={{ color:'var(--color-text-primary)', borderColor:'var(--color-border)' }} />

      {/* Meta */}
      <div className="flex gap-3">
        <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="tags (comma-separated)"
          className="flex-1 rounded-lg border px-3 py-1.5 text-xs outline-none focus:border-[var(--color-accent)]"
          style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
        <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="category"
          className="w-32 rounded-lg border px-3 py-1.5 text-xs outline-none focus:border-[var(--color-accent)]"
          style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
      </div>

      {/* Toolbar */}
      {editor && (
        <div className="flex gap-0.5 flex-wrap rounded-lg border p-1.5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
          <ToolBtn onClick={()=>editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={Bold} title="bold" />
          <ToolBtn onClick={()=>editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic} title="italic" />
          <ToolBtn onClick={()=>editor.chain().focus().toggleHeading({level:2}).run()} active={editor.isActive('heading',{level:2})} icon={Heading2} title="heading" />
          <ToolBtn onClick={()=>editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={List} title="list" />
          <ToolBtn onClick={()=>editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} icon={Code} title="code" />
          <ToolBtn onClick={()=>editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={Quote} title="quote" />
        </div>
      )}

      {/* Editor */}
      <div className="min-h-[400px] rounded-xl border p-4" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
        <EditorContent editor={editor} />
      </div>

      {editor && (
        <p className="text-xs text-right" style={{ color:'var(--color-text-muted)' }}>
          {editor.getText().trim().split(/\s+/).filter(Boolean).length} words
        </p>
      )}
    </div>
  );
}
