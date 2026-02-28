'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Undo, Redo } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BetaNotesEditorProps {
  value: string; // HTML string
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function BetaNotesEditor({
  value,
  onChange,
  placeholder = 'Write goals, instructions, or context for your beta users...',
  disabled = false,
}: BetaNotesEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'beta-notes-editor min-h-[140px] px-3 py-2.5 text-[13px] leading-relaxed focus:outline-none text-text-primary',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. when beta card is first expanded)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      // Only update if different to avoid cursor jump
      if (value === '' || value === '<p></p>') {
        editor.commands.clearContent();
      } else if (value !== current) {
        editor.commands.setContent(value || '');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  const ToolBtn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title?: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors',
        active
          ? 'bg-accent-muted text-accent-primary'
          : 'text-text-tertiary hover:text-text-primary hover:bg-bg-hover'
      )}
    >
      {children}
    </button>
  );

  return (
    <>
      {/* Scoped prose styles for the editor content */}
      <style>{`
        .beta-notes-editor h2 { font-size: 15px; font-weight: 600; margin: 10px 0 4px; color: var(--text-primary); }
        .beta-notes-editor h3 { font-size: 13px; font-weight: 600; margin: 8px 0 3px; color: var(--text-primary); }
        .beta-notes-editor p { margin: 0 0 6px; }
        .beta-notes-editor p:last-child { margin-bottom: 0; }
        .beta-notes-editor ul { list-style: disc; padding-left: 18px; margin: 4px 0 6px; }
        .beta-notes-editor ol { list-style: decimal; padding-left: 18px; margin: 4px 0 6px; }
        .beta-notes-editor li { margin-bottom: 2px; }
        .beta-notes-editor strong { font-weight: 600; color: var(--text-primary); }
        .beta-notes-editor em { font-style: italic; }
        .beta-notes-editor .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text-tertiary, #666);
          pointer-events: none;
          height: 0;
        }
      `}</style>

      <div className="border border-border-subtle rounded-lg overflow-hidden">
        {/* Toolbar */}
        {!disabled && (
          <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border-subtle bg-bg-card">
            <ToolBtn
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </ToolBtn>

            <div className="w-px h-4 bg-border-subtle mx-1" />

            <ToolBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Heading"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              title="Subheading"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </ToolBtn>

            <div className="w-px h-4 bg-border-subtle mx-1" />

            <ToolBtn
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Bullet list"
            >
              <List className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Numbered list"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </ToolBtn>

            <div className="flex-1" />

            <ToolBtn
              onClick={() => editor.chain().focus().undo().run()}
              title="Undo"
            >
              <Undo className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().redo().run()}
              title="Redo"
            >
              <Redo className="w-3.5 h-3.5" />
            </ToolBtn>
          </div>
        )}

        {/* Editor content */}
        <div className="bg-bg-elevated">
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
}
