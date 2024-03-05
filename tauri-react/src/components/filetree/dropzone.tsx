import { FC, ReactNode } from "react";
import { useDroppable, UniqueIdentifier } from "@dnd-kit/core";

export const DropZone: FC<{ children: ReactNode; id: UniqueIdentifier }> = ({
	children,
	id,
}) => {
	const { setNodeRef, isOver } = useDroppable({ id });

	console.log(isOver);
	return (
		<div ref={setNodeRef} className="h-full w-full">
			{children}
		</div>
	);
};

