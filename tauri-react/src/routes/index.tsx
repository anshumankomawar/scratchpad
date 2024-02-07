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
    <div className="h-full px-4">
      <div className="h-full flex space-x-4">
        <EditorContent className="h-full flex-1 " editor={tiptap.editor} />
      </div>
    </div>
  )
}
