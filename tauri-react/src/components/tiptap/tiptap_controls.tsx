import { Editor } from "@tiptap/react";
import { AArrowDown, AArrowUp, AlignCenter, AlignLeft, AlignRight, Bold, Code, Italic, List, ListTodo, Quote, Strikethrough, Subscript, Superscript, Underline } from 'lucide-react'
import { Button } from "../ui/button";
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import { FontSelector } from "./font-selector";
import { HeadingSelector } from "./heading_selector";

export default function TiptapControls({ editor }: { editor: Editor | null }) {
  if(!editor) {
    return <>Loading...</>
  }

  const [tab, setTab] = useState("left");
  const [fontSize, setFontSize] = useState("12");

  const onTabChange = (value) => {
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

        <Button variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-accent' : ''}
          size="icon">
          <List className="w-4 h-4"/>
        </Button>

        <Button variant="ghost"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={editor.isActive('taskList') ? 'bg-accent' : ''}
          size="icon">
          <ListTodo className="w-4 h-4"/>
        </Button>

        <Button variant="ghost"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={editor.isActive('subscript') ? 'bg-accent' : ''}
          size="icon">
          <Subscript className="w-4 h-4"/>
        </Button>

        <Button variant="ghost"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={editor.isActive('superscript') ? 'bg-accent' : ''}
          size="icon">
          <Superscript className="w-4 h-4"/>
        </Button>

        <Button variant="ghost"
          onClick={() => {
            setFontSize(`${parseInt(fontSize) + 1}`)
            editor.chain().focus().setFontSize(fontSize).run()
          }}
          className={editor.isActive('superscript') ? 'bg-accent' : ''}
          size="icon">
          <AArrowUp className="w-4 h-4"/>
        </Button>

        <Button variant="ghost"
          onClick={() => {
            setFontSize(`${parseInt(fontSize) - 1}`)
            editor.chain().focus().setFontSize(fontSize).run()
          }}
          className={editor.isActive('superscript') ? 'bg-accent' : ''}
          size="icon">
          <AArrowDown className="w-4 h-4"/>
        </Button>

      <div className="col-span-3 w-full">
        <Tabs value={editor.isActive({ textAlign: 'left' }) ? "left" : editor.isActive({ textAlign: 'right' }) ? "right" : "center"} onValueChange={onTabChange}>
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

      <Badge variant="secondary" className="font-normal col-span-3 w-full h-8 flex flex-row justify-between">
        <div>words:</div>
        <div>{editor.storage.characterCount.words()}</div>
      </Badge>

      <HeadingSelector editor={editor} className="col-span-3 w-full h-8"/>
      <FontSelector editor={editor} className="col-span-3 w-full h-8"/>
    </div>
  )
}
