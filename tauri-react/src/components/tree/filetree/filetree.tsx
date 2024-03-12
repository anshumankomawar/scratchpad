import {
	defaultDropAnimation,
	DropAnimation,
	UniqueIdentifier,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { FlattenedItem, TreeItems } from "./types";
import { FolderTreeItem } from "@/components/tree/filetree/filetree_item";
import { CSS } from "@dnd-kit/utilities";
import { useTipTapEditor } from "@/context/tiptap_context";
import { useDocStore, useTreeStore } from "@/app_state";
import { useState } from "react";
import { saveDocument, useDocuments } from "@/fetch/documents";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

const dropAnimationConfig: DropAnimation = {
	keyframes({ transform }) {
		return [
			{ opacity: 1, transform: CSS.Transform.toString(transform.initial) },
			{
				opacity: 0,
				transform: CSS.Transform.toString({
					...transform.final,
					x: transform.final.x + 5,
					y: transform.final.y + 5,
				}),
			},
		];
	},
	easing: "ease-out",
	sideEffects({ active }) {
		active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
			duration: defaultDropAnimation.duration,
			easing: defaultDropAnimation.easing,
		});
	},
};

interface Props {
	collapsible?: boolean;
	defaultItems?: TreeItems;
	indentationWidth?: number;
	indicator?: boolean;
	removable?: boolean;
	children?: React.ReactNode;
	handleCollapse: (id: UniqueIdentifier) => void;
	handleRemove: (id: UniqueIdentifier) => void;
	projected: any;
}

export function FileTree({
	collapsible,
	indicator = false,
	indentationWidth = 20,
	removable,
	handleCollapse,
	handleRemove,
	projected,
	children,
}: Props) {
	const docStore = useDocStore((state) => state);
	const treeStore = useTreeStore((state) => state);
	const [newFileName, setNewFileName] = useState("");
	const documents = useDocuments();

	function separateFilenameAndExtension(filename: string): {
		name: string;
		extension: string;
	} {
		const lastDotIndex = filename.lastIndexOf(".");
		let name: string;
		let extension: string;

		if (lastDotIndex !== -1) {
			name = filename.substring(0, lastDotIndex);
			extension = filename.substring(lastDotIndex + 1);
		} else {
			name = filename;
			extension = "txt"; // Set extension to txt if there is no period
		}

		// Check if the extension is not one of "txt", "sheet"
		if (extension !== "txt" && extension !== "sheet") {
			console.error('Extension must be "txt" or "sheet"');
			return { name: "", extension: "" }; // Return empty values
		}

		return { name, extension };
	}

	const handleNewDocument = async (name, extension) => {
		const doc_id = await saveDocument(name, docStore.doc.folder_id, extension);
		const newDoc = {
			filename: name,
			foldername: docStore.doc.foldername,
			folder_id: docStore.doc.folder_id,
			id: doc_id,
			content: "",
			filetype: extension,
		};

		docStore.updateDoc(newDoc);
		docStore.setEditorContent("");
		docStore.getEditor()?.chain().focus().setTextSelection(0).run();
		await documents.refetch();
	};

	const updateItemsWithRemoveAndAdd = (folderName, itemIdToRemove, newItem) => {
		treeStore.updateTree(
			treeStore.flattenedTree.map((item) => {
				if (item.foldername === folderName) {
					const updatedChildren = item.children.filter(
						(child) => child.id !== itemIdToRemove,
					);
					if (newItem?.id) {
						updatedChildren.push(newItem);
					}
					return { ...item, children: updatedChildren };
				}
				return item;
			}),
		);
	};

	const removeItemFromFolder = (folderName, itemId) => {
		const updatedItems = treeStore.flattenedTree.map((item) => {
			if (item.foldername === folderName) {
				const updatedChildren = item.children.filter(
					(child) => child.id !== itemId,
				);
				return { ...item, children: updatedChildren };
			}
			return item;
		});

		treeStore.updateTree(updatedItems);
	};

	return (
		<div className="w-full">
			<SortableContext
				items={treeStore.sortedIds}
				strategy={verticalListSortingStrategy}
			>
				{treeStore.flattenedTree.map(
					({ id, foldername, children, collapsed, depth, file }) => {
						if (id !== docStore.doc.folder_id) return;
						return children.map((child) => {
							if (child.id === "new")
								return (
									<div key={child.id} className="h-6 w-full px-1 pt-2">
										<input
											className="text-dull_black dark:text-dull_white bg-transparent rounded-md w-full h-6 p-1 text-xs focus:outline-none focus:outline-accent"
											autoFocus
											value={newFileName}
											onChange={(e) => setNewFileName(e.target.value)}
											onBlur={() => {
												removeItemFromFolder(docStore.doc.foldername, "new");
												setNewFileName("");
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													const { name, extension } =
														separateFilenameAndExtension(newFileName);
													if (name === "" || extension === "") {
														toast({
															variant: "destructive",
															title: "Uh oh! Something went wrong.",
															description: "Please enter a valid filetype",
														});
														return;
													}
													const tempItem = {
														folder_id: docStore.doc.folder_id,
														foldername: docStore.doc.foldername,
														id: name,
														children: [],
														file: {},
														collapsed: true,
														filetype: extension,
														content: docStore.getEmptyContent(extension),
													};
													updateItemsWithRemoveAndAdd(
														docStore.doc.foldername,
														"new",
														tempItem,
													);
													docStore.updateDoc({
														...tempItem,
														filename: tempItem.id,
														foldername: foldername,
													});
													handleNewDocument(name, extension);
													setNewFileName("");
												} else if (e.key === "Escape") {
													e.preventDefault();
													removeItemFromFolder(docStore.doc.foldername, "new");
													setNewFileName("");
												}
											}}
										/>
									</div>
								);
							return (
								<FolderTreeItem
									key={child.id}
									id={child.id}
									value={child.id}
									depth={
										child.id === treeStore.activeId && projected
											? projected.depth
											: child.depth
									}
									indentationWidth={indentationWidth}
									indicator={indicator}
									collapsed={Boolean(child.collapsed && child.children.length)}
									onCollapse={
										collapsible && child.children.length
											? () => handleCollapse(child.id)
											: undefined
									}
									onRemove={
										removable ? () => handleRemove(child.id) : undefined
									}
									childCount={child.children.length}
									foldername={child.foldername}
									file={child.file}
								/>
							);
						});
					},
				)}
			</SortableContext>
		</div>
	);
}
