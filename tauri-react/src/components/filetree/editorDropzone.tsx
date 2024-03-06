import { FC, ReactNode } from "react";
import { useDroppable, UniqueIdentifier } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

export const EditorDropzone: FC<{ children: ReactNode; id: UniqueIdentifier }> = ({
	children,
	id,
}) => {
	const { setNodeRef, isOver } = useDroppable({ id });

  console.log(isOver)

	return (
		<div ref={setNodeRef} className="h-full w-2/3 left-1/2">
			{children}
			<div
				className={cn(
					"absolute w-full h-full top-0",
					isOver && "z-50 bg-red-500 opacity-25",
				)}
			/>
		</div>
	);
};
