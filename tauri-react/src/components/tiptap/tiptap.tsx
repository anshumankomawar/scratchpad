import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Code, Italic, Strikethrough, Underline as UnderlineIcon } from 'lucide-react'
import { Underline } from '@tiptap/extension-underline'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import './tiptap.scss'

const lowlight = createLowlight()
lowlight.register('js', javascript)

// define your extension array
const extensions = [
  StarterKit,
  Underline,
  CodeBlockLowlight.configure({
    lowlight,
  })
]

const content = `<p>Hello World!`

const Tiptap = () => {
  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class: 'h-full overflow-y-auto outline-none border rounded-md p-2',
      },
    },
  })

  if (!editor) {
    return <>Loading...</>
  }
  console.log(lowlight.listLanguages())
  return (
    <div className="h-full flex space-x-4">
      
      <EditorContent className="h-full flex-1 " editor={editor} />
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
    </div>
  )
}

export default Tiptap
