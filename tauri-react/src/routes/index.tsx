import { useTipTapEditor } from '@/tiptap_context';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { EditorContent } from '@tiptap/react'
import { useStore } from '@/auth'
import LeftFloatingPanel from '@/components/panels/leftfloatingpanel'
import { useEffect, useState } from 'react'
import '../tiptap.scss'
import '../index.css'
import BottomFloatingPanel from '@/components/panels/bottomfloatingpanel';
import TopFloatingPanel from '@/components/panels/topfloatingpanel'
import { invoke } from "@tauri-apps/api/core"
import { ToastAction } from "@/components/ui/toast"
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button'

interface Document {
  id: string,
  filename: string
}

interface LoaderData {
  documents: Document[]
}

import RightFloatingPanel from '@/components/panels/rightfloatingpanel';
import Save from '@/components/save/save';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/theme_context';

export const Route = createFileRoute('/')({
  component: HomeComponent
})


function HomeComponent() {
  const tiptap = useTipTapEditor();
  const store = useStore()
  const navigate = useNavigate({ from: '/' })
  const { theme, setTheme } = useTheme()
  const [openLeft, setOpenLeft] = useState(false);
  const [openBottom, setOpenBottom] = useState(false);
  const [openTop, setOpenTop] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  const [documents, setDocuments] = useState([]);

  function toggleLeftPanel() {
    setOpenLeft(!openLeft)
  }

  function toggleBottomPanel() {
    setOpenBottom(!openBottom)
  }

  function toggleTopPanel() {
    setOpenTop(!openTop)
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
      if (event.key === 'ArrowLeft' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpenLeft(!openLeft)
      } else if (event.key === 'ArrowDown' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpenBottom(!openBottom)
      } else if (event.key === 'ArrowRight' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpenRight(!openRight)
      } else if (event.key === ' ' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpenTop(!openTop)
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setOpenTop(false)
      }
    }

    document.addEventListener('keyup', handleKeyUp)
    return () => document.removeEventListener('keyup', handleKeyUp)
  }, [openLeft, openBottom, openRight, openTop])

  function onKeyUp(event) {
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === ' ') && event.ctrlKey) {
      event.preventDefault();
    }
  }

  const handleLogout = async () => {
    await store.store.delete("token")
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
        <TopFloatingPanel open={openTop} toggleTopPanel={toggleTopPanel} /> 
        <EditorContent className="lg:mx-[250px] mx-[100px] overflow-x-hidden pt-4 no-scrollbar" editor={tiptap.editor} />
        <div className="z-100 bottom-0 left-0 fixed h-min flex flex-row w-full font-virgil items-center px-5 py-4 bg-white dark:bg-stone-900">
          <Popover>
            <PopoverContent className='p-1 ml-2 mb-2 flex flex-col overflow-y-scroll space-y-1 w-32 font-virgil text-xs text-start dark:bg-stone-900'>
              <Button variant="ghost" size="menu" className="text-xs justify-start p-2" onClick={toggleLeftPanel}>Open</Button>
              <Button variant="ghost" size="menu" className="text-xs justify-start p-2" onClick={toggleBottomPanel}>Files</Button>
              <Button variant="ghost" size="menu" className="text-xs justify-start p-2" onClick={handleLogout}>Logout</Button>
              <Button variant="ghost" size="menu" className="text-xs justify-between p-2" onClick={() => { 
                setTheme(theme === "light" ? "dark" : "light") 
              }}>
                {theme === "light" ? "Dark Mode" : "Light Mode"} 
                {theme === "light" ? <Moon size={16}/> : <Sun size={16}/>}
              </Button>
            </PopoverContent>
            <PopoverTrigger className='text-start text-xs hover:cursor-pointer'>Settings</PopoverTrigger>
          </Popover>
          <div className="grow"></div>
          <div className="text-xs">filename.txt</div>
          <div className="grow"></div>
          <div className="text-end text-xs">
            {tiptap.editor.storage.characterCount.words()} | {tiptap.editor.storage.characterCount.characters()}
          </div>
        </div>
    </div>
  )
}
