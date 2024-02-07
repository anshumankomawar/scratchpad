import { cn } from "@/lib/utils"

type RightPanelProps = {
  isRightPanelOpen: boolean,
  children?: React.ReactNode
}

export default function RightPanel({ isRightPanelOpen, children }: RightPanelProps) {
  return (
    <div className={cn("border-l w-3/12 md:w-3/12 lg:w-1/12 transition-all duration-500 ease-out overflow-hidden", { "w-0 md:w-0 lg:w-0": !isRightPanelOpen })}>
      <div className="p-2 h-full w-full">
        {children}
      </div>
    </div>
  )
}

