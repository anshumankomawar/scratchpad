import { PanelBottom, PanelLeft, PanelRight } from "lucide-react";
import { Button } from "../ui/button";

type HeaderProps = {
  isRightPanelOpen: boolean
  setIsRightPanelOpen: (isOpen: boolean) => void
}

export default function Header({ isRightPanelOpen, setIsRightPanelOpen} : HeaderProps) {
  return (
    <div className="fixed top-0 w-full h-11 bg-transparent border z-10 flex flex-row justify-end" data-tauri-drag-region>
      <div className="flex flex-row p-2">
        <Button size="custom" variant={"ghost"}> 
          <PanelLeft className="w-5 h-5 stroke-stone-800" strokeWidth={1.5}/>
        </Button>
        <Button size="custom" variant={"ghost"}> 
          <PanelBottom className="w-5 h-5 stroke-stone-800" strokeWidth={1.5}/>
        </Button>
        <Button size="custom" variant={"ghost"} onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}> 
          <PanelRight className="w-5 h-5 stroke-stone-800" strokeWidth={1.5}/>
        </Button>
      </div>
    </div>
  )
}
