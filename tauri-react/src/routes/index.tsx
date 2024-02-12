import { useTipTapEditor } from '@/tiptap_context';
import { createFileRoute } from '@tanstack/react-router'
import { EditorContent } from '@tiptap/react'
import LeftFloatingPanel from '@/components/panels/leftfloatingpanel'
import { useEffect, useState } from 'react'
import '../tiptap.scss'
import '../index.css'
import BottomFloatingPanel from '@/components/panels/bottomfloatingpanel';
import RightFloatingPanel from '@/components/panels/rightfloatingpanel';

export const Route = createFileRoute('/')({
  component: HomeComponent,
})


function HomeComponent() {
  const tiptap = useTipTapEditor();
  const [openLeft, setOpenLeft] = useState(false);
  const [openBottom, setOpenBottom] = useState(false);
  const [openRight, setOpenRight] = useState(false);

  function toggleLeftPanel() {
    setOpenLeft(!openLeft)
  }

  function toggleBottomPanel() {
    setOpenBottom(!openBottom)
  }

  function toggleRightPanel() {
    setOpenRight(!openRight)
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'ArrowLeft' && event.metaKey) {
        event.preventDefault();
        setOpenLeft(!openLeft)
      } else if (event.key === 'ArrowDown' && event.metaKey) {
        event.preventDefault();
        setOpenBottom(!openBottom)
      } else if (event.key === 'ArrowRight' && event.metaKey) {
        event.preventDefault();
        setOpenRight(!openRight)
      }
    }
    document.addEventListener('keyup', handleKeyDown)
    return () => document.removeEventListener('keyup', handleKeyDown)
  }, [openLeft, openBottom, openRight])

  function onKeyDown(event) {
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'ArrowUp') && event.metaKey) {
      event.preventDefault();
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [])

   if(!tiptap.editor) {
     return <div>Loading...</div>
   }

  return (
    <div className="relative w-full h-full px-4 pb-4 items-center justify-center">
        <LeftFloatingPanel open={openLeft} toggleLeftPanel={toggleLeftPanel}/>
        <BottomFloatingPanel open={openBottom} toggleBottomPanel={toggleBottomPanel}/>
        <RightFloatingPanel open={openRight} toggleRightPanel={toggleRightPanel} editor={tiptap.editor}/>
        <EditorContent className="lg:mx-[250px] mx-[100px] overflow-x-hidden pt-4 no-scrollbar" editor={tiptap.editor} />
    </div>
  )
}
