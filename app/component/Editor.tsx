// app/component/Editor.tsx
"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export default function Editor({ value, onChange, onBlur }: EditorProps) {
  const [mounted, setMounted] = useState(false);
  
  // Only initialize editor on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: () => {
      if (onBlur) onBlur();
    },
    immediatelyRender: false, // Important for SSR
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  // Clean up editor on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (!mounted) {
    // Return a placeholder during SSR
    return (
      <div className="min-h-48 border border-gray-300 rounded-lg p-4 bg-gray-50">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  return <EditorContent editor={editor} className="min-h-48" />;
}