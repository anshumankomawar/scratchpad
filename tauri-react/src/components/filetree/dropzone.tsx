import { FC, ReactNode } from "react";
import { useDroppable, UniqueIdentifier } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { EditorDropzone } from "@/components/filetree/editorDropzone";
import { EditorContent } from "@tiptap/react";
import { useTipTapEditor } from "@/context/tiptap_context";

export const DropZone: FC<{
	children: ReactNode;
	id: UniqueIdentifier;
	leftPanel: boolean;
}> = ({ children, id, leftPanel }) => {
	const { setNodeRef, isOver } = useDroppable({ id });

  const tiptap = useTipTapEditor();

  if (!tiptap.rightEditor) {
		return <div />;
	}

	return (
		<div ref={setNodeRef} className="h-full w-full">
			{children}
			<div
				className={leftPanel ? "w-2/5 h-full left-3/5 absolute" : "left-1/2 w-1/2 absolute h-full"}
			>
				<EditorDropzone id="second-editor"/>
			</div>
			<div
				className={cn(
					"absolute left-1/5 w-full h-full",
					isOver && "z-50 bg-purple-500 opacity-25",
				)}
			/>
		</div>
	);
};
