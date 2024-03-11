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
import { SortableTreeItem } from "@/components/filetree/node/SortableTreeItem";
import { CSS } from "@dnd-kit/utilities";
import { useTipTapEditor } from "@/context/tiptap_context";

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
	activeId: UniqueIdentifier | null;
	flattenedItems: FlattenedItem[];
	handleCollapse: (id: UniqueIdentifier) => void;
	handleRemove: (id: UniqueIdentifier) => void;
	projected: any;
}

export function SortableTree({
	collapsible,
	indicator = false,
	indentationWidth = 20,
	removable,
	sortedIds,
	activeId,
	flattenedItems,
	handleCollapse,
	handleRemove,
	projected,
	children,
}: Props) {
	const editor = useTipTapEditor();
	if (!editor) return null;

	return (
		<div className="w-full">
			<SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
				{flattenedItems.map(({ id, children, collapsed, depth, file }) => (
					<SortableTreeItem
						key={id}
						id={id}
						value={id}
						depth={id === activeId && projected ? projected.depth : depth}
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
						file={file}
						editor={editor.editor}
					/>
				))}
			</SortableContext>
		</div>
	);
}
