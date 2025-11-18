'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect } from 'react';
import { EditorToolbar } from './EditorToolbar';

interface TipTapEditorProps {
  content: any;
  onChange: (content: any) => void;
  placeholder?: string;
  editable?: boolean;
  onWordCountChange?: (count: number) => void;
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  editable = true,
  onWordCountChange,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
    ],
    content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[400px]',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(json);
      
      // Update word count
      if (onWordCountChange) {
        const wordCount = editor.storage.characterCount.words();
        onWordCountChange(wordCount);
      }
    },
  });

  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-auto px-6 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

