import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"


export default function LeftFloatingPanel({open, toggleLeftPanel}) {
  return (
        <Sheet open={open}>
            <SheetContent side="left" className="bg-white lg:w-[200px] min-w-[150px] w-[150px] pt-10" onInteractOutside={() => toggleLeftPanel()}>
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
