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
	const editor = useTipTapEditor();
	const docStore = useDocStore((state) => state);
	const treeStore = useTreeStore((state) => state);
	if (!editor) return null;
	const [newFileName, setNewFileName] = useState("");
	const documents = useDocuments();

	const handleNewDocument = async () => {
		const doc_id = await saveDocument(newFileName, docStore.doc.folder_id);
		const newDoc = {
			filename: newFileName,
			foldername: docStore.doc.foldername,
			folder_id: docStore.doc.folder_id,
			id: doc_id,
			content: "",
		};

		await documents.refetch();
		docStore.updateDoc(newDoc);
		editor.editor.commands.setContent("");
		editor.editor.chain().focus().setTextSelection(0).run();
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
		let updatedItems = treeStore.flattenedTree.map((item) => {
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
													const tempItem = {
														folder_id: docStore.doc.folder_id,
														foldername: docStore.doc.foldername,
														id: newFileName,
														children: [],
														file: {},
														collapsed: true,
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
													if (newFileName !== "") {
														handleNewDocument();
													}
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
									editor={editor.editor}
								/>
							);
						});
					},
				)}
			</SortableContext>
		</div>
	);
}
