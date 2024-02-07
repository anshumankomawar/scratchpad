import { useTipTapEditor } from '@/tiptap_context';
import { createFileRoute } from '@tanstack/react-router'
import { EditorContent } from '@tiptap/react'
import '../tiptap.scss'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  const tiptap = useTipTapEditor();

  if(!tiptap) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full h-full px-4">
        <EditorContent className="h-full overflow-x-hidden pt-4" editor={tiptap.editor} />
    </div>
  )
}
