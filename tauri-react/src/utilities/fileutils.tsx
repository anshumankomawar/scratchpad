import { DocStore, FileManagerState } from "@/app_state";
import { toast } from "@/components/ui/use-toast";
import SyncManager from "@/utilities/sync";
import {
	BaseDirectory,
	mkdir,
	remove,
	rename,
	writeFile,
} from "@tauri-apps/plugin-fs";
import { Editor } from "@tiptap/react";

export async function renameFile(
	fileManager: FileManagerState,
	id: string,
	newFilename: string,
	filetype: string,
	foldername: string,
) {
	const oldPathParts = id.split("/");
	oldPathParts[oldPathParts.length - 1] = newFilename; // Replace the last part with newFilename
	const newPath = `${oldPathParts.join("/")}.${filetype}`;

	await rename(id, newPath, {
		oldPathBaseDir: BaseDirectory.AppData,
		newPathBaseDir: BaseDirectory.AppData,
	});

	await fileManager.readDir();
	fileManager.selectFile(newPath);
	fileManager.selectFolder(foldername.split("/")[1]);

	//toast({
	//duration: 500,
	//description: "Renamed file.",
	//});

	const syncManager = SyncManager.getInstance(
		fileManager.syncPath,
		BaseDirectory.AppData,
	);

	syncManager.renameOperation({
		type: "file",
		timestamp: new Date().toISOString(),
		oldPath: id,
		newPath: newPath,
		newFilename,
	});
}

export async function renameFolder(
	fileManager: FileManagerState,
	oldPath: string,
	newPath: string,
	newFoldername: string,
) {
	await rename(oldPath, newPath, {
		oldPathBaseDir: BaseDirectory.AppData,
		newPathBaseDir: BaseDirectory.AppData,
	});

	await fileManager.readDir();
	fileManager.selectFolder(newFoldername);

	//toast({
	//duration: 500,
	//description: "Renamed folder.",
	//});

	const syncManager = SyncManager.getInstance(
		fileManager.syncPath,
		BaseDirectory.AppData,
	);

	syncManager.renameOperation({
		type: "folder",
		timestamp: new Date().toISOString(),
		oldPath,
		newPath,
		newFilename: newFoldername,
	});
}

export async function deleteFolder(
	fileManager: FileManagerState,
	path: string,
	foldername: string,
	editor: Editor,
) {
	await remove(path, {
		recursive: true,
		baseDir: BaseDirectory.AppData,
	});

	if (fileManager.selectedFolder === foldername) {
		fileManager.selectFolder(null);
	}

	if (fileManager.selectedFile?.foldername === foldername) {
		fileManager.selectFile(null);
		editor.commands.setContent("");
	}

	await fileManager.readDir();

	//toast({
	//duration: 500,
	//description: "Deleted folder.",
	//});

	const syncManager = SyncManager.getInstance(
		fileManager.syncPath,
		BaseDirectory.AppData,
	);

	syncManager.deleteOperation({
		type: "folder",
		timestamp: new Date().toISOString(),
		path: `${path}`,
	});
}

export async function deleteDocument(
	fileManager: FileManagerState,
	id: string,
	file_id: string,
	foldername: string,
	editor: Editor,
) {
	await remove(file_id, {
		baseDir: BaseDirectory.AppData,
	});
	if (fileManager.selectedFile?.id === id) {
		await fileManager.selectFile(null);
		editor.commands.setContent("");
		fileManager.selectFolder(foldername.split("/")[1]);
	}
	await fileManager.readDir();
	fileManager.selectFolder(foldername.split("/")[1]);

	//toast({
	//duration: 500,
	//description: "Deleted file.",
	//});

	const syncManager = SyncManager.getInstance(
		fileManager.syncPath,
		BaseDirectory.AppData,
	);

	syncManager.deleteOperation({
		type: "file",
		timestamp: new Date().toISOString(),
		path: `${file_id}`,
	});
}

export async function updateFileContent(
	editor: Editor,
	fileManager: FileManagerState,
) {
	const encoder = new TextEncoder();
	const data = encoder.encode(editor?.getHTML());
	if (fileManager.selectedFile?.content === editor?.getHTML()) {
		return;
	}

	await writeFile(fileManager.selectedFile.id, data, {
		baseDir: BaseDirectory.AppData,
	});
	await fileManager.readDir();
	//toast({
	//duration: 500,
	//description: "Updated file content.",
	//});

	const syncManager = SyncManager.getInstance(
		fileManager.syncPath,
		BaseDirectory.AppData,
	);
	await syncManager.updateOperation({
		type: "file",
		timestamp: new Date().toISOString(),
		path: fileManager.selectedFile.id,
		content: editor.getHTML(),
		filename: fileManager.selectedFile.filename,
		extension: fileManager.selectedFile.filetype,
	});
}

export function separateFilenameAndExtension(filename: string): {
	name: string;
	extension: string;
} {
	const lastDotIndex = filename.lastIndexOf(".");
	let name: string;
	let extension: string;

	if (lastDotIndex !== -1) {
		name = filename.substring(0, lastDotIndex);
		extension = filename.substring(lastDotIndex + 1);
	} else {
		name = filename;
		extension = "txt";
	}

	if (extension !== "txt" && extension !== "sheet") {
		console.error('Extension must be "txt" or "sheet"');
		return { name: "", extension: "" };
	}

	return { name, extension };
}

export async function createLocalDocument(
	docStore: DocStore,
	fileManager: FileManagerState,
	input: string,
	path?: string | null,
) {
	if (input.endsWith("/")) {
		const targetFolder =
			path ?? `${fileManager.dataPath}/${fileManager.selectedFolder}`;
		const folderPath = `${targetFolder}/${input.slice(0, -1)}`;
		await handleNewFolder(fileManager, folderPath);
		return;
	}
	const { name, extension } = separateFilenameAndExtension(input);

	if (name === "" || extension === "") {
		console.error("Name and extension must be provided");
		return;
	}

	const targetFolder =
		path ?? `${fileManager.dataPath}/${fileManager.selectedFolder}`;
	const filePath = `${targetFolder}/${name}.${extension}`;

	const encoder = new TextEncoder();
	const data = encoder.encode("");

	await writeFile(filePath, data, {
		createNew: true,
		baseDir: BaseDirectory.AppData,
	})
		.then(async () => {
			const syncManager = SyncManager.getInstance(
				fileManager.syncPath,
				BaseDirectory.AppData,
			);

			await syncManager.addOperation({
				type: "file",
				timestamp: new Date().toISOString(),
				path: filePath,
				filename: name,
				folderpath: `${targetFolder}`,
				extension: extension,
				content: "",
			});

			await fileManager.readDir();
			docStore.setEditorContent("");
			docStore.getEditor()?.chain().focus().setTextSelection(0).run();
			fileManager.selectFile(filePath);

			//toast({
			//duration: 500,
			//description: "Created file.",
			//});

			const parentFolder = targetFolder.split("/")[1];

			fileManager.selectFolder(parentFolder);
		})
		.catch((err) => {
			fileManager.selectFile(filePath);
			toast({
				duration: 500,
				description: "File already exists.",
				variant: "destructive",
			});
		});
}

export async function handleNewFolder(
	fileManager: FileManagerState,
	path: string,
) {
	const folderPath = `${fileManager.dataPath}/${path}`;
	await mkdir(folderPath, {
		baseDir: BaseDirectory.AppData,
	});
	await fileManager.readDir();
	//toast({
	//duration: 500,
	//description: "Created folder.",
	//});

	const syncManager = SyncManager.getInstance(
		fileManager.syncPath,
		BaseDirectory.AppData,
	);

	const foldername = folderPath.split("/")[1];

	syncManager.addOperation({
		type: "folder",
		timestamp: new Date().toISOString(),
		path: folderPath,
		filename: foldername,
	});
}
