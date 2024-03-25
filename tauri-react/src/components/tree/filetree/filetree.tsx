import { FolderTreeItem } from "@/components/tree/filetree/filetree_item";
import { useFileManager } from "@/app_state";
import { Separator } from "@/components/ui/separator";
import NewFileMenu from "./newfile";

export function FileTree() {
	const fileManager = useFileManager((state) => state);

	function extractPathAfterSelectedFolder(childId, selectedFolder) {
		return childId
			.split(`/`)
			.slice(childId.split(`/`).indexOf(selectedFolder) + 1)
			.join(`/`);
	}

	const folderContents = fileManager.files[fileManager.selectedFolder] || [];

	return (
		<div className="w-full">
			{folderContents.map((content) => {
				if (content.type === "folder") {
					return (
						<div
							className="flex flex-col pb-2 pt-6 w-full"
							key={`folder-${content.id}`}
						>
							<div className="flex flex-row justify-between items-center w-full pb-1">
								<div className="text-neutral-300 dark:text-neutral-400 text-xs px-2 pb-1">
									{content.foldername}
								</div>
								<NewFileMenu path={content.id} />
							</div>
							<Separator />
						</div>
					);
				}

				return (
					<FolderTreeItem
						key={content.id}
						id={content.id}
						value={content.filename}
						depth={0}
						childCount={0}
						foldername={content.foldername}
						file={content}
					/>
				);
			})}
		</div>
	);
}
