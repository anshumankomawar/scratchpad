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

import { GraduationCap, NotepadText } from "lucide-react";
  

export default function LeftFloatingPanel({ open, toggleLeftPanel, documents }) {

  async function cancelAutoFocus(event) {
    event.preventDefault()
  }

  return (
    <Sheet open={open} modal={false}>
      <SheetContent side="left" className="overflow-y-auto bg-white dark:bg-stone-900 border-none drop-shadow-2xl shadow-2xl lg:w-[300px] min-w-[150px] w-[200px] pt-10" onOpenAutoFocus={cancelAutoFocus}>
        <SheetHeader>
        <SheetTitle className="font-virgil">Files</SheetTitle>
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
