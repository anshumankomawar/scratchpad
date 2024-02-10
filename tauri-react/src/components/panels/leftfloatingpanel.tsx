import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"


export default function LeftFloatingPanel() {
  return (
    <Sheet side="left" classNamew="w-[400px]">
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="left" className="bg-white">
            <SheetHeader>
            <SheetTitle>Are you absolutely sure?</SheetTitle>
            <SheetDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
            </SheetDescription>
            </SheetHeader>
        </SheetContent>
        </Sheet>
  )
}






