import { useTipTapEditor } from '@/tiptap_context';
import { createFileRoute } from '@tanstack/react-router'
import { EditorContent } from '@tiptap/react'
import '../tiptap.scss'
import '../index.css'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  const tiptap = useTipTapEditor();

  if(!tiptap.editor) {
    return <div>Loading...</div>
  }

  return (
    <div className="relative w-full h-full px-4 pb-4">
        <EditorContent className="h-full overflow-x-hidden pt-4 no-scrollbar" editor={tiptap.editor} />
    </div>
  )
}
