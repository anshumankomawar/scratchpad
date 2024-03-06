import { FC, ReactNode } from "react";
import { useDroppable, UniqueIdentifier } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

export const DropZone: FC<{ children: ReactNode; id: UniqueIdentifier }> = ({
	children,
	id,
}) => {
	const { setNodeRef, isOver } = useDroppable({ id });

	return (
		<div ref={setNodeRef} className="h-full w-full">
			{children}
			<div
				className={cn(
					"absolute left-[200px] w-full h-full",
					isOver && "z-50 bg-purple-500 opacity-25",
				)}
			/>
		</div>
	);
};
