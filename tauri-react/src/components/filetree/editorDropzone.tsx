import { FC, ReactNode } from "react";
import { useDroppable, UniqueIdentifier } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

export const EditorDropzone: FC<{ id: UniqueIdentifier }> =
	({ id }) => {
		const { setNodeRef, isOver } = useDroppable({ id });

		return (
			<div ref={setNodeRef} className="h-full">
				<div
					className={cn(
						"absolute w-full h-full top-0",
						isOver && "z-50 bg-red-500 opacity-25",
					)}
				/>
			</div>
		);
	};
