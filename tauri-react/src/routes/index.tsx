import { Panel, useDocStore, usePanelStore, useTreeStore } from "@/app_state";
import CommandPanel from "@/components/command/command";
import BottomPanel from "@/components/panels/bottompanel";
import RightFloatingPanel from "@/components/panels/rightfloatingpanel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTipTapEditor } from "@/context/tiptap_context";
import "@/index.css";
import { cn } from "@/lib/utils";
import "@/tiptap.scss";
import { createFileRoute } from "@tanstack/react-router";
import { EditorContent } from "@tiptap/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
	DndContext,
	DragEndEvent,
	DragMoveEvent,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	DropAnimation,
	KeyboardSensor,
	MeasuringStrategy,
	PointerSensor,
	SensorContext,
	UniqueIdentifier,
	closestCenter,
	pointerWithin,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { sortableTreeKeyboardCoordinates } from "@/components/tree/keyboardCoordinates";
import {
	buildTree,
	flattenTree,
	getProjection,
	removeChildrenOf,
	removeItem,
	setProperty,
} from "@/components/tree/utilities";
import { arrayMove } from "@dnd-kit/sortable";
import { updateDocument, useDocuments } from "@/fetch/documents";
import { FolderTree } from "@/components/tree/foldertree/foldertree";
import ThreePanelLayout from "@/components/panels/threepanel";
import { FileTree } from "@/components/tree/filetree/filetree";
import { DataTableDemo } from "@/components/table/datatable";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

const measuring = {
	droppable: {
		strategy: MeasuringStrategy.Always,
	},
};

function HomeComponent() {
	const panel = usePanelStore((state) => state);
	const { data, refetch } = useDocuments();
	const docStore = useDocStore((state) => state);
	const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
	const [offsetLeft, setOffsetLeft] = useState(0);
	const [currentPosition, setCurrentPosition] = useState<{
		parentId: UniqueIdentifier | null;
		overId: UniqueIdentifier;
	} | null>(null);
	const indicator = false;
	const indentationWidth = 20;
	const treeStore = useTreeStore((state) => state);

	const previousDocRef = useRef(docStore.doc);
	const isUpdatingRef = useRef(false);

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
				if (isUpdatingRef.current) {
					return; // Prevent update if already in progress
				}
				isUpdatingRef.current = true;
				try {
					const doc_id = await updateDocument(
						docStore.doc.filename,
						docStore.doc.folder_id,
						docStore.getEditor()?.getHTML(),
						docStore.doc.id,
            docStore.doc.filetype
					);
					if (docStore.doc.id === previousDocRef.current.id) {
						treeStore.updateTreeOnDocumentUpdate(
							previousDocRef.current.foldername,
							previousDocRef.current.id,
							doc_id,
						);
						docStore.updateDoc({ ...docStore.doc, id: doc_id });
					}
					await refetch();
				} catch (error) {
					console.error("Failed to update document", error);
				} finally {
					isUpdatingRef.current = false; // Reset flag regardless of success or failure
				}
			}
		}

		function handleKeyUp(event) {
			handleKeyUpAsync(event).catch(console.error);
		}

		document.addEventListener("keyup", handleKeyUp);
		return () => document.removeEventListener("keyup", handleKeyUp);
	}, [docStore.updateDoc, docStore.doc, docStore.getEditor(), refetch, panel]);

	useEffect(() => {
		if (data) {
			if (docStore.doc.folder_id === "") {
				if (Object.keys(data).length > 0) {
					docStore.updateFolder(data["unfiled"].id, docStore.doc.foldername);
				}
			}
			treeStore.updateData(data);
		}
	}, [data]);

	const projected =
		treeStore.activeId && overId
			? getProjection(
					treeStore.flattenedTree,
					treeStore.activeId,
					overId,
					offsetLeft,
					indentationWidth,
			  )
			: null;

	const sensorContext: SensorContext = useRef({
		items: treeStore.flattenedTree,
		offset: offsetLeft,
	});
	const [coordinateGetter] = useState(() =>
		sortableTreeKeyboardCoordinates(sensorContext, indicator, indentationWidth),
	);
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				delay: 400,
				tolerance: 10,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter,
		}),
	);

	useEffect(() => {
		sensorContext.current = {
			items: treeStore.flattenedTree,
			offset: offsetLeft,
		};
	}, [treeStore.flattenedTree, offsetLeft]);

	function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
		treeStore.updateActiveId(activeId);
		setOverId(activeId);

		const activeItem = treeStore.flattenedTree.find(
			({ id }) => id === activeId,
		);

		if (activeItem) {
			setCurrentPosition({
				parentId: activeItem.parentId,
				overId: activeId,
			});
		}

		document.body.style.setProperty("cursor", "grabbing");
	}

	function handleDragMove({ delta, over }: DragMoveEvent) {
		const item = treeStore.flattenedTree.find(({ id }) => id === over?.id);
		if (item?.children.length > 0) {
			setOffsetLeft(delta.x);
		}
	}

	function handleDragOver({ delta, over }: DragOverEvent) {
		if (over?.id === "editor") {
			setOverId(treeStore.activeId);
		} else {
			setOverId(over?.id ?? null);
		}
	}

	function findParentWithNullFile(tree, id, parent = null) {
		for (const node of tree) {
			if (node.id === id) {
				return node.file === null
					? node.id
					: parent?.file === null
					  ? parent.id
					  : null;
			}
			if (node.children) {
				const foundParentId = findParentWithNullFile(node.children, id, node);
				if (foundParentId) return foundParentId;
			}
		}
		return null;
	}

	function handleDragEnd({ active, over }: DragEndEvent) {
		resetState();

		if (projected && over?.id === "editor") {
			const file = treeStore.flattenedTree.find(({ id }) => id === active.id);
			docStore.updateDoc(file.file);
			docStore.updateTabs(file.file);
			docStore.getEditor()?.commands.setContent(file.file.content);
			docStore.getEditor()?.commands.focus("start");
		} else if (projected && over) {
			const { depth, parentId } = projected;
			const clonedItems: [] = JSON.parse(
				JSON.stringify(flattenTree(treeStore.flattenedTree)),
			);
			const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
			const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
			const activeTreeItem = clonedItems[activeIndex];

			clonedItems[activeIndex] = {
				...activeTreeItem,
				depth,
				parentId: findParentWithNullFile(clonedItems, parentId),
			};

			const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
			const newItems = buildTree(sortedItems);

			treeStore.updateTree(newItems);
		}

		document.body.style.setProperty("cursor", "auto");
	}

	function handleDragCancel() {
		resetState();
	}

	function resetState() {
		setOverId(null);
		treeStore.updateActiveId(null);
		setOffsetLeft(0);
		setCurrentPosition(null);

		document.body.style.setProperty("cursor", "");
	}

	function handleRemove(id: UniqueIdentifier) {
		treeStore.updateTree(removeItem(treeStore.tree, id));
	}

	function handleCollapse(id: UniqueIdentifier) {
		treeStore.updateTree(
			setProperty(treeStore.tree, id, "collapsed", (value) => {
				return !value;
			}),
		);
	}

	//const dropAnimationConfig: DropAnimation = {
	//keyframes({ transform }) {
	//return [
	//{ opacity: 1, transform: CSS.Transform.toString(transform.initial) },
	//{ opacity: 0, transform: CSS.Transform.toString(transform.initial) }, // Keep the position same as initial
	//];
	//},
	//easing: "ease-out",
	//};

	return (
		<Dialog open={panel.center} onOpenChange={panel.changeCenter}>
			<div className="relative w-full h-full items-center justify-center">
				<CommandPanel editor={docStore.getEditor()} />
				<RightFloatingPanel editor={docStore.getEditor()} />
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
								<Button
									variant={"ghost"}
									size={"toolbar"}
									onClick={() => {
										const updatedItems = [...treeStore.tree];

										const existingItemIndex = updatedItems.findIndex(
											(item) => item.id === "newfolder",
										);

										if (existingItemIndex === -1) {
											const newItem = {
												id: "newfolder",
												children: [],
												file: null,
												collapsed: true,
											};

											updatedItems.push(newItem);
											treeStore.updateTree(updatedItems);
										} else {
											console.error("A 'newfolder' item already exists");
										}
									}}
								>
									<Plus
										size={14}
										className="stroke-dull_black dark:stroke-dull_white"
									/>
								</Button>
							</div>
						</div>
						<div className="px-2 pt-2">
							<DndContext
								sensors={sensors}
								collisionDetection={pointerWithin}
								onDragStart={handleDragStart}
								onDragMove={handleDragMove}
								onDragOver={handleDragOver}
								onDragEnd={handleDragEnd}
								onDragCancel={handleDragCancel}
							>
								<FolderTree
									collapsible
									indicator
									removable
									sortedIds={treeStore.sortedIds}
									handleCollapse={handleCollapse}
									handleRemove={handleRemove}
									projected={projected}
								/>
							</DndContext>
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
									{docStore.doc.foldername}
								</div>
								<Button
									variant={"ghost"}
									size={"toolbar"}
									onClick={() => {
										const updatedItems = [...treeStore.tree];

										const folderIndex = updatedItems.findIndex(
											(item) => item.id === docStore.doc.folder_id,
										);

										if (folderIndex !== -1) {
											const updatedFolder = { ...updatedItems[folderIndex] };
											const fileIndex = updatedFolder.children.findIndex(
												(item) => item.id === "new",
											);

											if (fileIndex === -1) {
												const newItem = {
													id: "new",
													folder_id: docStore.doc.folder_id,
													folder_name: updatedFolder.foldername,
													children: [],
													file: {},
													collapsed: true,
												};

												updatedFolder.children = [
													...updatedFolder.children,
													newItem,
												];

												updatedItems[folderIndex] = updatedFolder;
												treeStore.updateTree(updatedItems);
											}
										} else {
											console.error("Folder not found");
										}
									}}
								>
									<Plus
										size={14}
										className="stroke-dull_black dark:stroke-dull_white"
									/>
								</Button>
							</div>
						</div>
						<div className="px-2 pt-2">
							<DndContext
								sensors={sensors}
								collisionDetection={pointerWithin}
								onDragStart={handleDragStart}
								onDragMove={handleDragMove}
								onDragOver={handleDragOver}
								onDragEnd={handleDragEnd}
								onDragCancel={handleDragCancel}
							>
								<FileTree
									collapsible
									indicator
									removable
									sortedIds={treeStore.sortedIds}
									handleCollapse={handleCollapse}
									handleRemove={handleRemove}
									projected={projected}
								/>
							</DndContext>
						</div>
					</div>
					{/*third panel*/}
					<EditorContent
						className={cn(
							"w-full bg-white dark:bg-background overflow-x-hidden no-scrollbar h-full pb-24 lg:px-24 md:px-12 sm:px-20 px-10",
						)}
            editor={docStore.getEditor()}
					/>
				</ThreePanelLayout>
			</div>
			<DialogContent className="bg-white dark:bg-background h-3/4 w-3/4">
				{panel.centerContent}
			</DialogContent>
		</Dialog>
	);
}
