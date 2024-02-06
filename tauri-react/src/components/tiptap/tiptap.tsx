import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

// define your extension array
const extensions = [
  StarterKit,
]

const content = '<p>Hello World!</p>'

const Tiptap = () => {
  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class: 'h-full overflow-y-auto outline-none',
      },
    },
  })

  if (!editor) {
    return <>Loading...</> 
  }

  return (
    <EditorContent className="h-full" editor={editor} />
  )
}

export default Tiptap
