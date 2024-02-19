import { useTipTapEditor } from "@/context/tiptap_context";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EditorContent } from "@tiptap/react";
import { useStore } from "@/auth";
import LeftFloatingPanel from "@/components/panels/leftfloatingpanel";
import { useEffect, useState } from "react";
import CommandPanel from "@/components/command/command";
import "@/tiptap.scss";
import "@/index.css";
import { invoke } from "@tauri-apps/api/core";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import RightFloatingPanel from "@/components/panels/rightfloatingpanel";
import { useTheme } from "@/context/theme_context";
import BottomPanel from "@/components/panels/bottompanel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SearchPanel from "@/components/search/search_panel";
import { useDocuments } from "@/fetch/documents";
import { Panel, useDocStore, usePanelStore } from "@/app_state";

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
	const [currDoc, setCurrDoc] = useState({
		filename: "",
		foldername: "unfiled",
		id: ""
	});
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
			} else if (event.key === " " && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
        panel.togglePanel(Panel.COMMAND);
			} else if (event.key === "Escape") {
				event.preventDefault();
				panel.togglePanel(Panel.COMMAND);
			}
		}

		document.addEventListener("keyup", handleKeyUp);
		return () => document.removeEventListener("keyup", handleKeyUp);
	}, []);

	function onKeyUp(event) {
		if (
			(event.key === "ArrowLeft" ||
				event.key === "ArrowRight" ||
				event.key === "ArrowDown" ||
				event.key === " ") &&
			event.ctrlKey
		) {
			event.preventDefault();
		}
	}

	const handleLogout = async () => {
		await store.store.delete("token");
		navigate({ to: "/" });
	};

	useEffect(() => {
		document.addEventListener("keyup", onKeyUp);
		return () => {
			document.removeEventListener("keyup", onKeyUp);
		};
	}, []);

	if (!tiptap.editor) {
		return <div>Loading...</div>;
	}

	function updateEditorContent(content) {
		tiptap.editor.commands.setContent(content);
	}

	return (
		<Dialog open={panel.center} onOpenChange={panel.changeCenter}>
			<div className="relative w-full h-full px-4 pb-4 items-center justify-center">
				<LeftFloatingPanel
					updateEditorContent={updateEditorContent}
					document={currDoc}
					setDocument={setCurrDoc}
				/>
				<RightFloatingPanel
					editor={tiptap.editor}
				/>
				<CommandPanel
					editor={tiptap.editor}
					document={currDoc}
				/>
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
				<SearchPanel />
			</DialogContent>
		</Dialog>
	);
}
