import { useTipTapEditor } from '@/tiptap_context';
import { createFileRoute } from '@tanstack/react-router'
import { EditorContent } from '@tiptap/react'
import LeftFloatingPanel from '@/components/panels/leftfloatingpanel'
import { useEffect, useState } from 'react'
import '../tiptap.scss'
import '../index.css'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})


function HomeComponent() {
  const tiptap = useTipTapEditor();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'ArrowLeft' && event.metaKey) {
        console.log('Command + Left Arrow pressed', open, !open);
        setOpen(!open)
        console.log(open)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // if(!tiptap.editor) {
  //   return <div>Loading...</div>
  // }

  return (
    <div className="relative w-full h-full px-4 pb-4">
        <LeftFloatingPanel open={open} />
        <EditorContent className="h-full overflow-x-hidden pt-4 no-scrollbar" editor={tiptap.editor} />
    </div>
  )
}
