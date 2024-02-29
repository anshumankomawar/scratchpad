import { Panel, usePanelStore } from "@/app_state";
import CommandPanel from "@/components/command/command";
import BottomPanel from "@/components/panels/bottompanel";
import RightFloatingPanel from "@/components/panels/rightfloatingpanel";
import { LeftPanel } from "@/components/panels/leftpanel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTipTapEditor } from "@/context/tiptap_context";
import "@/index.css";
import { cn } from "@/lib/utils";
import "@/tiptap.scss";
import { createFileRoute } from "@tanstack/react-router";
import { EditorContent } from "@tiptap/react";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const tiptap = useTipTapEditor();
	const panel = usePanelStore((state) => state);

	useEffect(() => {
		function handleKeyUp(event) {
			if (event.key === "ArrowLeft" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				panel.togglePanel(Panel.LEFT);
			} else if (
				event.key === "ArrowRight" &&
				(event.metaKey || event.ctrlKey)
			) {
				event.preventDefault();
				panel.togglePanel(Panel.RIGHT);
			} else if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				panel.togglePanel(Panel.COMMAND);
			} else if (event.key === "Escape") {
				event.preventDefault();
				panel.setPanel(Panel.COMMAND, false);
			}
		}

		document.addEventListener("keyup", handleKeyUp);
		return () => document.removeEventListener("keyup", handleKeyUp);
	}, []);

	if (!tiptap.editor) {
		return <div>Loading...</div>;
	}

	return (
		<Dialog open={panel.center} onOpenChange={panel.changeCenter}>
			<div className="relative w-full h-full px-4 pb-4 items-center justify-center">
				<RightFloatingPanel editor={tiptap.editor} />
				<CommandPanel editor={tiptap.editor} />
				<div className="absolute bg-background h-full left-0 top-0 w-[200px]">
					<LeftPanel editor={tiptap.editor} />
				</div>
				<EditorContent
					className={cn(
						"absolute transition-[left] border-l left-[200px] right-0 z-10 bg-white dark:bg-background overflow-x-hidden no-scrollbar h-full pb-24",
						panel.left ? "left-[200px]" : "left-0",
					)}
					editor={tiptap.editor}
				/>
				<BottomPanel editor={tiptap.editor} />
			</div>
			<DialogContent className="bg-white dark:bg-background h-3/4 w-3/4">
				{panel.centerContent}
			</DialogContent>
		</Dialog>
	);
}
