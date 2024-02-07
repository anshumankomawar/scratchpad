import { Editor } from "@tiptap/react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Code, Italic, Quote, Strikethrough, Underline } from 'lucide-react'
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";

export default function TiptapControls({ editor }: { editor: Editor | null }) {
  if(!editor) {
    return <>Loading...</>
  }

  const [tab, setTab] = useState("left");

  const onTabChange = (value) => {
    console.log(tab)
    // match the tab value to the editor command
    editor.commands.setTextAlign(value);
    setTab(value);
  }

  return (
    <div className="grid grid-cols-3 gap-1 gap-y-2 justify-items-center items-end">
        <Button variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-accent' : ''}
          size="icon">
          <Bold className="w-4 h-4"/>
        </Button>

        <Button variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-accent' : ''}
          size="icon">
          <Italic className="w-4 h-4"/>
        </Button>

        <Button variant="ghost"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-accent' : ''}
          size="icon">
          <Underline className="w-4 h-4"/>
        </Button>

        <Button variant="ghost"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-accent' : ''}
          size="icon">
          <Strikethrough className="w-4 h-4"/>
        </Button>

        <Button variant="ghost"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-accent' : ''}
          size="icon">
          <Code className="w-4 h-4"/>
        </Button>

        <Button variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-accent' : ''}
          size="icon">
          <Quote className="w-4 h-4"/>
        </Button>

      <div className="col-span-3 w-full">
        <Tabs value={tab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="left" className="data-[state=active]:bg-white">
              <AlignLeft className="w-4 h-4"/>
            </TabsTrigger>
            <TabsTrigger value="center" className="data-[state=active]:bg-white">
              <AlignCenter className="w-4 h-4"/>
            </TabsTrigger>
            <TabsTrigger value="right" className="data-[state=active]:bg-white">
              <AlignRight className="w-4 h-4"/>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
