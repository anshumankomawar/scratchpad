import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"


export default function LeftFloatingPanel({open}) {
  return (
        <Sheet side="left" open={open}>
            <SheetContent side="left" className="bg-white w-1/5 pt-10">
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
