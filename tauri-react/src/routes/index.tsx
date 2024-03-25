import { Panel, useDocStore, useFileManager, usePanelStore } from "@/app_state";
import CommandPanel from "@/components/command/command";
import RightFloatingPanel from "@/components/panels/rightfloatingpanel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import "@/index.css";
import { cn } from "@/lib/utils";
import "@/tiptap.scss";
import { createFileRoute } from "@tanstack/react-router";
import { EditorContent } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { FolderTree } from "@/components/tree/foldertree/foldertree";
import ThreePanelLayout from "@/components/panels/threepanel";
import { FileTree } from "@/components/tree/filetree/filetree";
import NewFileMenu from "@/components/tree/filetree/newfile";
import NewFolderMenu from "@/components/tree/foldertree/newfolder";
import { updateFileContent } from "@/utilities/fileutils";
import { performSync } from "@/fetch/documents";
import WelcomeScreen from "@/welcome";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const panel = usePanelStore((state) => state);
	const fileManager = useFileManager((state) => state);
	const docStore = useDocStore((state) => state);
	const previousDocRef = useRef(docStore.doc);

	useEffect(() => {
		previousDocRef.current = docStore.doc;
	}, [docStore.doc]);

	useEffect(() => {
		async function handleKeyUpAsync(event) {
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
				panel.setPanel(Panel.COMMAND, true);
			} else if (event.key === "Escape") {
				event.preventDefault();
				panel.setPanel(Panel.COMMAND, false);
			} else if (event.key === "s" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				updateFileContent(docStore.getEditor(), fileManager);
			}
		}

		function handleKeyUp(event) {
			handleKeyUpAsync(event).catch(console.error);
		}

		document.addEventListener("keyup", handleKeyUp);
		return () => document.removeEventListener("keyup", handleKeyUp);
	}, [
		panel,
		fileManager.selectedFile,
		fileManager.files,
		fileManager,
		docStore.getEditor,
	]);

	return (
		<Dialog open={panel.center} onOpenChange={panel.changeCenter}>
			<div className="relative w-full h-full items-center justify-center">
				<CommandPanel />
				{/* <BottomPanel editor={docStore.getEditor()} /> */}
				<ThreePanelLayout>
					{/*first panel*/}
					<div className="flex flex-col w-full">
						<div className="h-10 border-b items-start justify-center align-middle flex flex-col">
							<div
								className="flex flex-row w-full justify-between items-end px-1"
								data-tauri-drag-region
							>
								<div
									className="ml-20 text-sm text-dull_black dark:text-dull_white font-medium cursor-default"
									data-tauri-drag-region
								>
									Collate
								</div>
								<NewFolderMenu />
							</div>
						</div>
						<div className="px-2 pt-2">
							<FolderTree />
						</div>
					</div>
					{/*second panel*/}
					<div className="flex flex-col w-full">
						<div className="h-10 border-b items-start justify-center align-middle flex flex-col">
							<div
								className="flex flex-row w-full justify-between items-end px-1 pl-4"
								data-tauri-drag-region
							>
								<div
									className="text-sm text-dull_black dark:text-dull_white cursor-default"
									data-tauri-drag-region
								>
									{fileManager.selectedFolder}
								</div>
								{fileManager.selectedFolder && <NewFileMenu />}
							</div>
						</div>
						<div className="px-2 pt-2">
							<FileTree />
						</div>
					</div>
					{/*third panel*/}
					{fileManager.selectedFile ? (
						<EditorContent
							className={cn(
								"w-full bg-white dark:bg-background overflow-x-hidden no-scrollbar h-full pb-24 lg:px-24 md:px-12 sm:px-20 px-10",
							)}
							editor={docStore.getEditor()}
						/>
					) : (
						<WelcomeScreen />
					)}
					{/*<Excalidraw theme={theme === "dark" ? "dark" : "white"} />*/}
				</ThreePanelLayout>
				<RightFloatingPanel
				//editor={docStore.getEditor(fileManager.selectedFile.filetype)}
				/>
			</div>
			<DialogContent className="bg-white dark:bg-background h-3/4 w-3/4">
				{panel.centerContent}
			</DialogContent>
		</Dialog>
	);
}
