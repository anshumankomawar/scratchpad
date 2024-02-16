import { PanelBottom, PanelLeft, PanelRight } from "lucide-react";
import { Button } from "../ui/button";
import { CommandDialogDemo } from "../command/command";

type HeaderProps = {
	isRightPanelOpen: boolean;
	isLeftPanelOpen: boolean;
	setIsRightPanelOpen: (isOpen: boolean) => void;
	setIsLeftPanelOpen: (isOpen: boolean) => void;
};

export default function Header({
	isRightPanelOpen,
	setIsRightPanelOpen,
	isLeftPanelOpen,
	setIsLeftPanelOpen,
}: HeaderProps) {
	return (
		<div
			className="fixed top-0 w-full h-11 bg-transparent border z-10 flex flex-row justify-end"
			data-tauri-drag-region
		>
			<div className="flex flex-row p-2">
				<CommandDialogDemo />
				<Button
					size="custom"
					variant={"ghost"}
					onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
				>
					<PanelLeft className="w-5 h-5 stroke-stone-800" strokeWidth={1.5} />
				</Button>
				<Button size="custom" variant={"ghost"}>
					<PanelBottom className="w-5 h-5 stroke-stone-800" strokeWidth={1.5} />
				</Button>
				<Button
					size="custom"
					variant={"ghost"}
					onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
				>
					<PanelRight className="w-5 h-5 stroke-stone-800" strokeWidth={1.5} />
				</Button>
			</div>
		</div>
	);
}
