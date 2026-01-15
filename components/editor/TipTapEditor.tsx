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
  onGenerateContent?: () => void;
  generating?: boolean;
  canGenerate?: boolean;
  onExport?: () => void;
  onEditorReady?: (editor: any) => void;
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  editable = true,
  onWordCountChange,
  onGenerateContent,
  generating = false,
  canGenerate = false,
  onExport,
  onEditorReady,
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
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none h-full prose-invert',
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

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar 
        editor={editor}
        onGenerateContent={onGenerateContent}
        generating={generating}
        canGenerate={canGenerate}
        onExport={onExport}
      />
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}

