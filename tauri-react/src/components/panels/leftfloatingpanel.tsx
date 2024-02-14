import { useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
  } from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GraduationCap, NotepadText, FolderPlus, ShoppingBag, Bell, StickyNote } from "lucide-react";
  

export default function LeftFloatingPanel({ open, toggleLeftPanel, documents }) {
  const [showAddFolder, setShowAddFolder] = useState(false);

  async function cancelAutoFocus(event) {
    event.preventDefault()
  }

  return (
    <Sheet open={open}>
      <SheetContent side="left" className="overflow-y-auto bg-white dark:bg-stone-900 border-none drop-shadow-2xl shadow-2xl lg:w-[300px] min-w-[150px] w-[200px] pt-10" onOpenAutoFocus={cancelAutoFocus} onPointerDownOutside={() => toggleLeftPanel(!open)}>
        <SheetHeader>
        <SheetTitle className="flex flex-row font-virgil mb-2 ">
          <div>Files</div>
          <div className="flex-grow"></div>
          <Popover>
            <PopoverTrigger><FolderPlus size={18}/></PopoverTrigger>
              <PopoverContent className="font-virgil">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                <Input id="name" value="Art101" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="icon" className="text-right">
                  Icon
                </Label>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="select one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one"><GraduationCap size={20}/></SelectItem>
                  <SelectItem value="two"><NotepadText size={20}/></SelectItem>
                  <SelectItem value="three"><ShoppingBag size={20}/></SelectItem>
                  <SelectItem value="four"><Bell size={20}/></SelectItem>
                  <SelectItem value="five"><StickyNote size={20}/></SelectItem>
                </SelectContent>
              </Select>
              </div>
              </div>
              <div className="flex justify-center text-sm">
                <Button type="submit">Create Folder</Button>
              </div>
              </PopoverContent>
          </Popover>
        </SheetTitle>
        </SheetHeader>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
              <AccordionTrigger className="font-virgil space-x-2 space-y-1">
                <GraduationCap size={16} strokeWidth={1.5} style={{ transform: 'none' }}/>
                <div>CSC366</div>
                <div className="flex-grow"></div>
              </AccordionTrigger>
            <AccordionContent className="font-virgil text-xs">
            <ul className="list-disc pl-4">
                <li>Document 1</li>
                <li>Document 2</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
          <AccordionItem value="item-2">
            <AccordionTrigger className="font-virgil space-x-2 space-y-1">
                <GraduationCap size={16} strokeWidth={1.5} style={{ transform: 'none' }}/>
                <div>English142</div>
                <div className="flex-grow"></div>
              </AccordionTrigger>
              <AccordionContent className="font-virgil text-xs">
              <ul className="list-disc pl-4">
                  <li>Essay 1</li>
                  <li>Peer Review</li>
                </ul>
              </AccordionContent>
          </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
          <AccordionItem value="item-3">
          <AccordionTrigger className="font-virgil space-x-2 space-y-1">
                <NotepadText size={16} strokeWidth={1.5} style={{ transform: 'none' }}/>
                <div>Misc</div>
                <div className="flex-grow"></div>
              </AccordionTrigger>
              <AccordionContent className="font-virgil text-xs">
              <ul className="list-disc pl-4">
                  <li>Bank Info</li>
                  <li>Grocery List</li>
                </ul>
              </AccordionContent>
          </AccordionItem>
          </Accordion>
        {/* <div className="flex flex-col space-y-2">
        {documents.map((document, index) => (
          <div key={index} className="font-virgil">
            {document.filename}
          </div>
        ))}
        </div> */}
      </SheetContent>
    </Sheet>
  )
}