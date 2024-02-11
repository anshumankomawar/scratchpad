import {
    Sheet,
    SheetContent,
  } from "@/components/ui/sheet"
import { Button } from "../ui/button"

export default function BottomFloatingPanel({open, toggleBottomPanel}) {

  async function cancelAutoFocus(event) {
    event.preventDefault()
  }

  return (
    <Sheet open={open} modal={false}>
      <SheetContent side="bottom" className="bg-white border-none drop-shadow-2xl shadow-2xl h-min p-4" onOpenAutoFocus={cancelAutoFocus}>
        <div className="flex flex-row w-full font-virgil items-center space-x-2">
          <Button variant="ghost"
            onClick={() => {}}
            className=""
          >
            Settings
          </Button>
          |
          <Button variant="ghost"
            onClick={() => {}}
            className=""
          >
            Night Mode 
          </Button>

          <div className="grow"></div>
          <div className="flex flex-col items-end space-y-1">
            <div className="text-end text-xs">
              words 3000 | characters 20000
            </div>
            <div className="text-end text-xs">
              Last sync 2 mins ago...
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}