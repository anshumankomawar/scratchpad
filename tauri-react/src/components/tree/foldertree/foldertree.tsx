import { FolderTreeItem } from "@/components/tree/foldertree/foldertree_item";
import { useTipTapEditor } from "@/context/tiptap_context";
import { useFileManager } from "@/app_state";

export function FolderTree() {
	const editor = useTipTapEditor();
	const fileManager = useFileManager((state) => state);
	if (!editor) return null;

	return (
		<div>
			{Object.entries(fileManager.folders).map(([foldername, content]) => {
				return (
					<FolderTreeItem
						key={content.id}
						id={content.id}
						value={content.id}
						depth={0}
						childCount={content.depth}
						foldername={foldername}
						file={undefined}
						editor={editor.editor}
					/>
				);
			})}
		</div>
	);
}
