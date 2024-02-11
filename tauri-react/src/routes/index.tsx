import { useTipTapEditor } from '@/tiptap_context';
import { createFileRoute } from '@tanstack/react-router'
import { EditorContent } from '@tiptap/react'
import LeftFloatingPanel from '@/components/panels/leftfloatingpanel'
import { useEffect, useState } from 'react'
import '../tiptap.scss'
import '../index.css'
import BottomFloatingPanel from '@/components/panels/bottomfloatingpanel';

export const Route = createFileRoute('/')({
  component: HomeComponent,
})


function HomeComponent() {
  const tiptap = useTipTapEditor();
  const [openLeft, setOpenLeft] = useState(false);
  const [openBottom, setOpenBottom] = useState(false);

  function toggleLeftPanel() {
    setOpenLeft(!openLeft)
  }

  function toggleBottomPanel() {
    setOpenBottom(!openBottom)
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'ArrowLeft' && event.metaKey) {
        event.preventDefault();
        setOpenLeft(!openLeft)
      } else if (event.key === 'ArrowDown' && event.metaKey) {
        event.preventDefault();
        setOpenBottom(!openBottom)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [openLeft, openBottom])

   if(!tiptap.editor) {
     return <div>Loading...</div>
   }

  return (
    <div className="relative w-full h-full px-4 pb-4">
        <LeftFloatingPanel open={openLeft} toggleLeftPanel={toggleLeftPanel}/>
        <BottomFloatingPanel open={openBottom} toggleBottomPanel={toggleBottomPanel}/>
        <EditorContent className="lg:mx-[250px] mx-[100px] overflow-x-hidden pt-4 no-scrollbar" editor={tiptap.editor} />
    </div>
  )
}
