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
import { FolderTreeItem } from "@/components/tree/foldertree/foldertree_item";
import { CSS } from "@dnd-kit/utilities";
import { useTipTapEditor } from "@/context/tiptap_context";
import { useDocStore, useTreeStore } from "@/app_state";
import { saveDocument, useDocuments } from "@/fetch/documents";
import { useState } from "react";
import { addFolder } from "@/fetch/folder";

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
	sortedIds: UniqueIdentifier[];
	handleCollapse: (id: UniqueIdentifier) => void;
	handleRemove: (id: UniqueIdentifier) => void;
	projected: any;
}

export function FolderTree({
	collapsible,
	indicator = false,
	indentationWidth = 20,
	removable,
	sortedIds,
	handleCollapse,
	handleRemove,
	projected,
	children,
}: Props) {
	const editor = useTipTapEditor();
	const docStore = useDocStore((state) => state);
	const treeStore = useTreeStore((state) => state);
	if (!editor) return null;
	const [newFoldername, setNewFoldername] = useState("");
	const documents = useDocuments();

	const handleNewFolder = async () => {
		let folder_id = await addFolder(newFoldername);
		await documents.refetch();
		docStore.updateFolder(folder_id, newFoldername);
	};

	const removeFolder = (folderId) => {
		let updatedItems = treeStore.flattenedTree.filter(
			(item) => item.id !== folderId,
		);
		treeStore.updateTree(updatedItems);
	};

	const updateFoldersWithRemoveAndAdd = () => {
		const updatedItems = treeStore.flattenedTree.filter(
			(item) => item.id !== "newfolder",
		);
		const newItem = {
			id: newFoldername,
			foldername: newFoldername,
			children: [],
			file: null,
			collapsed: true,
		};

		updatedItems.push(newItem);
		treeStore.updateTree(updatedItems);
		docStore.updateFolder(newFoldername, newFoldername);
	};

	return (
		<div className="w-full">
			<SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
				{treeStore.flattenedTree.map(
					({ id, foldername, children, collapsed, depth, file }) => {
						if (id === "newfolder")
							return (
								<div key={id} className="w-full px-1 pt-2">
									<input
										className="text-dull_white bg-transparent rounded-md w-full h-6 p-1 text-xs focus:outline-none focus:outline-accent"
										autoFocus
										value={newFoldername}
										onChange={(e) => setNewFoldername(e.target.value)}
										onBlur={() => {
											removeFolder("newfolder");
											setNewFoldername("");
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												updateFoldersWithRemoveAndAdd();
												if (newFoldername !== "") {
													handleNewFolder();
												}
												setNewFoldername("");
											} else if (e.key === "Escape") {
												e.preventDefault();
												removeFolder("newfolder");
												setNewFoldername("");
											}
										}}
									/>
								</div>
							);
						if (file) return;
						return (
							<FolderTreeItem
								key={id}
								id={id}
								value={id}
								depth={
									id === treeStore.activeId && projected
										? projected.depth
										: depth
								}
								indentationWidth={indentationWidth}
								indicator={indicator}
								collapsed={Boolean(collapsed && children.length)}
								onCollapse={
									collapsible && children.length
										? () => handleCollapse(id)
										: undefined
								}
								onRemove={removable ? () => handleRemove(id) : undefined}
								childCount={children.length}
								foldername={foldername}
								file={file}
								editor={editor.editor}
							/>
						);
					},
				)}
			</SortableContext>
		</div>
	);
}
