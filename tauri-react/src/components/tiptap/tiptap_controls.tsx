import { Editor } from "@tiptap/react";
import { Bold, Code, Italic, Strikethrough, Underline as UnderlineIcon } from 'lucide-react'

export default function TiptapControls({ editor }: { editor: Editor | null }) {
  if(!editor) {
    return <>Loading...</>
  }

  return (
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active bg-gray-200 rounded p-2' : 'p-2'}
          >
            <Bold strokeWidth={3}/>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active bg-gray-200 rounded p-2' : 'p-2'}
          >
            <Italic/>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'is-active bg-gray-200 rounded p-2' : 'p-2'}
          >
            <UnderlineIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active bg-gray-200 rounded p-2' : 'p-2'}
          >
            <Strikethrough />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'is-active bg-gray-200 rounded p-2' : 'p-2'}
          >
            <Code />
          </button>
        </div>
  )
}
