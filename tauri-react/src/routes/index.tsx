import { useTipTapEditor } from "@/context/tiptap_context";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EditorContent } from "@tiptap/react";
import { useStore } from "@/auth";
import LeftFloatingPanel from "@/components/panels/leftfloatingpanel";
import { useEffect } from "react";
import CommandPanel from "@/components/command/command";
import "@/tiptap.scss";
import "@/index.css";
import RightFloatingPanel from "@/components/panels/rightfloatingpanel";
import { useTheme } from "@/context/theme_context";
import BottomPanel from "@/components/panels/bottompanel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Panel, useDocStore, usePanelStore } from "@/app_state";
import CollatePanel from "@/components/collate/collate";

interface Document {
	id: string;
	filename: string;
}

interface LoaderData {
	documents: Document[];
}

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const tiptap = useTipTapEditor();
	const store = useStore();
	const navigate = useNavigate({ from: "/" });
	const { theme, setTheme } = useTheme();
	const panel = usePanelStore((state) => state);
	const doc = useDocStore((state) => state.doc);

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

	const handleLogout = async () => {
		await store.store.delete("token");
		navigate({ to: "/" });
	};

	if (!tiptap.editor) {
		return <div>Loading...</div>;
	}

	return (
		<Dialog open={panel.center} onOpenChange={panel.changeCenter}>
			<div className="relative w-full h-full px-4 pb-4 items-center justify-center">
				<LeftFloatingPanel editor={tiptap.editor} />
				<RightFloatingPanel editor={tiptap.editor} />
				<CommandPanel editor={tiptap.editor} />
				<EditorContent
					className="lg:mx-[250px] mx-[100px] overflow-x-hidden pt-4 no-scrollbar"
					editor={tiptap.editor}
				/>
				<BottomPanel
					theme={theme}
					setTheme={setTheme}
					editor={tiptap.editor}
					handleLogout={handleLogout}
					filename={doc.filename}
				/>
			</div>
			<DialogContent className="bg-white h-3/4 w-3/4">
				<CollatePanel />
			</DialogContent>
		</Dialog>
	);
}
