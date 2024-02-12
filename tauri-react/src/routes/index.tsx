import { useTipTapEditor } from '@/tiptap_context';
import { createFileRoute } from '@tanstack/react-router'
import { EditorContent } from '@tiptap/react'
import LeftFloatingPanel from '@/components/panels/leftfloatingpanel'
import { useEffect, useState } from 'react'
import '../tiptap.scss'
import '../index.css'
import BottomFloatingPanel from '@/components/panels/bottomfloatingpanel';
import { invoke } from "@tauri-apps/api/core"
import { ToastAction } from "@/components/ui/toast"
import { toast } from '@/components/ui/use-toast';

interface Document {
  id: string,
  filename: string
}

interface LoaderData {
  documents: Document[]
}

import RightFloatingPanel from '@/components/panels/rightfloatingpanel';

export const Route = createFileRoute('/')({
  component: HomeComponent
})


function HomeComponent() {
  const tiptap = useTipTapEditor();
  const [openLeft, setOpenLeft] = useState(false);
  const [openBottom, setOpenBottom] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [openRight, setOpenRight] = useState(false);

  function toggleLeftPanel() {
    setOpenLeft(!openLeft)
  }

  function toggleBottomPanel() {
    setOpenBottom(!openBottom)
  }

  async function updateDocuments() {
    invoke("get_documents")
      .then((res) => {
        console.log("updating documents")
        setDocuments(res.documents)
      })
      .catch((error) => {
        console.log(error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error.code,
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        })
      })
  }

  function toggleRightPanel() {
    setOpenRight(!openRight)
  }

  useEffect(() => {
    function handleKeyUp(event) {
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

    document.addEventListener('keyup', handleKeyUp)
    return () => document.removeEventListener('keyup', handleKeyUp)
  }, [openLeft, openBottom, openRight])

  function onKeyUp(event) {
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'ArrowUp') && event.metaKey) {
      event.preventDefault();
    }
  }

  useEffect(() => {
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [])

  useEffect(() => {
    updateDocuments()
  }, [])

   if(!tiptap.editor) {
     return <div>Loading...</div>
   }

  return (
    <div className="relative w-full h-full px-4 pb-4 items-center justify-center">
        <LeftFloatingPanel open={openLeft} toggleLeftPanel={toggleLeftPanel} documents={documents}/>
        <BottomFloatingPanel open={openBottom} toggleBottomPanel={toggleBottomPanel} updateDocuments={updateDocuments} editor={tiptap.editor}/>
        <RightFloatingPanel open={openRight} toggleRightPanel={toggleRightPanel} editor={tiptap.editor}/>
        <EditorContent className="lg:mx-[250px] mx-[100px] overflow-x-hidden pt-4 no-scrollbar" editor={tiptap.editor} />
    </div>
  )
}
