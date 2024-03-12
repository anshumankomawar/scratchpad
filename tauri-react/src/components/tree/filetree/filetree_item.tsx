import React, { CSSProperties } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Item, Props as TreeItemProps } from "./item";
import { iOS } from "@/components/tree/utilities";

interface Props extends TreeItemProps {
	id: UniqueIdentifier;
	foldername: string;
}

const animateLayoutChanges: AnimateLayoutChanges = ({
	isSorting,
	wasDragging,
}) => (isSorting || wasDragging ? false : true);

export function FolderTreeItem({ id, foldername, depth, ...props }: Props) {
	const {
		attributes,
		isDragging,
		isSorting,
		listeners,
		setDraggableNodeRef,
		setDroppableNodeRef,
		transform,
		transition,
	} = useSortable({
		id,
		transition: {
			duration: 400, // milliseconds
			easing: "cubic-bezier(0.25, 1, 0.5, 1)",
		},
	});
	const style: CSSProperties = {
		transform: CSS.Translate.toString(transform),
		transition,
	};

	return (
		<Item
			ref={setDraggableNodeRef}
			wrapperRef={setDroppableNodeRef}
			style={style}
			depth={depth}
			ghost={isDragging}
			disableSelection={iOS}
			disableInteraction={isSorting}
			id={id}
			foldername={foldername}
			handleProps={{
				...attributes,
				...listeners,
			}}
			{...props}
		/>
	);
}
