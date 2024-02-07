import * as React from 'react'
import { useEditor, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import TextAlign from '@tiptap/extension-text-align'
import { createLowlight } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import './tiptap.scss'

export interface TiptapContext {
  editor: Editor | null
}

const TiptapContext = React.createContext<TiptapContext | null>(null)

export function TiptapProvider({ children }: { children: React.ReactNode }) {
  const lowlight = createLowlight()
  lowlight.register('js', javascript)

  // define your extension array
  const extensions = [
    StarterKit,
    Blockquote,
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    CodeBlockLowlight.configure({
      lowlight,
    })
  ]

  const content = `<p>Hello World!</p>`
  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class: 'h-full overflow-y-auto overflow-x-auto outline-none rounded-md',
      },
    },
  })

  return (
    <TiptapContext.Provider value={{ editor }}>
      {children}
    </TiptapContext.Provider>
  )
}

export function useTipTapEditor() {
  const context = React.useContext(TiptapContext)
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}
