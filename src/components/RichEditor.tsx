import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

type RichEditorProps = {
  content?: string;
  onChange?: (html: string) => void;
};

export default function RichEditor({ content, onChange }: RichEditorProps) {
  const editor = useEditor({
    content: content || '',
    extensions: [StarterKit],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  return <EditorContent editor={editor} className="rich-editor" />;}
