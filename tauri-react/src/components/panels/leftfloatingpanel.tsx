import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
  } from "@/components/ui/sheet"


export default function LeftFloatingPanel({open, toggleLeftPanel}) {
  async function cancelAutoFocus(event) {
    event.preventDefault()
  }

  return (
    <Sheet open={open} modal={false}>
      <SheetContent side="left" className="bg-white border-none drop-shadow-2xl shadow-2xl lg:w-[200px] min-w-[150px] w-[150px] pt-10" onOpenAutoFocus={cancelAutoFocus}>
        <SheetHeader>
        <SheetTitle className="font-virgil">Files</SheetTitle>
        <SheetDescription className="font-virgil">
            Data about the different files will go here
        </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}
