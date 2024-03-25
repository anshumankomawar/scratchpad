import { BaseDirectory, readFile, writeFile } from "@tauri-apps/plugin-fs";

type OperationType = "add" | "delete" | "rename" | "update";
type ItemType = "file" | "folder";

interface BaseOperation {
	timestamp: string;
	type: ItemType;
}

interface AddOperation extends BaseOperation {
	path: string;
	content?: string; // Base64 encoded content for files, optional
	filename: string; // Filename for files, optional
	extension?: string; // Filename for files, optional
	folderpath?: string; // Path to the folder containing the file, optional
}

interface DeleteOperation extends BaseOperation {
	path: string;
}

interface RenameOperation extends BaseOperation {
	oldPath: string;
	newPath: string;
	newFilename: string;
}

interface UpdateOperation extends BaseOperation {
	path: string;
	content: string;
	filename: string;
	extension: string;
}

interface SyncData {
	add: AddOperation[];
	delete: DeleteOperation[];
	rename: RenameOperation[];
	update: UpdateOperation[];
}

class SyncManager {
	private filePath: string;
	private baseDir: BaseDirectory;
	private static instance: SyncManager;

	private constructor(filePath: string, baseDir: BaseDirectory) {
		this.filePath = filePath;
		this.baseDir = baseDir;
	}

	public static getInstance(
		filePath: string,
		baseDir: BaseDirectory,
	): SyncManager {
		if (!SyncManager.instance) {
			SyncManager.instance = new SyncManager(filePath, baseDir);
		}
		return SyncManager.instance;
	}

	public static isEmptySyncData(data: SyncData): boolean {
		return (
			data.add.length === 0 &&
			data.delete.length === 0 &&
			data.rename.length === 0 &&
			data.update.length === 0
		);
	}

	public async readSyncFile(): Promise<SyncData> {
		try {
			const dataUint8Array = await readFile(this.filePath, {
				baseDir: this.baseDir,
			});
			const decoder = new TextDecoder("utf-8");
			const data = decoder.decode(dataUint8Array);
			return JSON.parse(data);
		} catch (error) {
			console.error("Error reading sync file:", error);
			return { add: [], delete: [], rename: [], update: [] };
		}
	}

	public async resetSyncFile(): Promise<void> {
		try {
			await this.writeSyncFile({ add: [], delete: [], rename: [], update: [] });
		} catch (error) {
			console.error("Error resetting sync file:", error);
		}
	}

	public async resetSwapFile(): Promise<void> {
		try {
			const data = { add: [], delete: [], rename: [], update: [] };
			const dataUint8Array = new TextEncoder().encode(
				JSON.stringify(data, null, 2),
			);
			await writeFile("sync_swap.json", dataUint8Array, {
				baseDir: this.baseDir,
			});
		} catch (error) {
			console.error("Error resetting swap file:", error);
		}
	}

	public async swapSyncFile(): Promise<void> {
		try {
			const data = await readFile("sync_swap.json", {
				baseDir: this.baseDir,
			});
			await writeFile(this.filePath, data, {
				baseDir: this.baseDir,
			});
		} catch (error) {
			console.error("Error setting sync file:", error);
		}
	}

	private async writeSyncFile(data: SyncData): Promise<void> {
		const dataString = JSON.stringify(data, null, 2);
		const encoder = new TextEncoder();
		await writeFile(this.filePath, encoder.encode(dataString), {
			baseDir: this.baseDir,
		});
	}

	private updateFilePathsForFolderRename(
		oldPath: string,
		newPath: string,
		data: SyncData,
		foldername: string,
	) {
		// Helper function to update file and folder paths within a folder for add and update operations
		const updatePath = (op: AddOperation | UpdateOperation) => {
			if (op.path.startsWith(oldPath)) {
				const updatedPath = op.path.replace(oldPath, newPath);
				const pathSegments = updatedPath.split("/");
				// Assumes the last segment after the last '/' is the filename for files
				const updatedFilename =
					pathSegments[pathSegments.length - 1].split(".")[0];
				return {
					...op,
					path: updatedPath,
					filename: op.type === "folder" ? foldername : updatedFilename,
					// For files, update the extension if necessary based on new path
					extension:
						op.type === "file"
							? pathSegments[pathSegments.length - 1].split(".")[1] ??
							  op.extension
							: op.extension,
				};
			}
			return op;
		};

		// Update paths for both add and update operations
		data.add = data.add.map(updatePath);
		data.update = data.update.map(updatePath);
	}

	public async addOperation(operation: AddOperation): Promise<void> {
		const data = await this.readSyncFile();
		data.add.push(operation);
		await this.writeSyncFile(data);
	}

	public async updateOperation(operation: UpdateOperation): Promise<void> {
		const data = await this.readSyncFile();
		const indexInAdd = data.add.findIndex((op) => op.path === operation.path);
		if (indexInAdd !== -1) {
			// If found in add, update the content
			data.add[indexInAdd].content = operation.content;
		} else {
			// If not found in add, add it to update
			data.update.push(operation);
		}
		await this.writeSyncFile(data);
	}

	private removeFolderOperations(path: string, data: SyncData) {
		const normalizedPath = path.endsWith("/") ? path : `${path}/`;

		data.add = data.add.filter((op) => !op.path.startsWith(normalizedPath));
		data.update = data.update.filter(
			(op) => !op.path.startsWith(normalizedPath),
		);
		data.delete = data.delete.filter(
			(op) => !op.path.startsWith(normalizedPath),
		);
	}

	public async deleteOperation(operation: DeleteOperation): Promise<void> {
		const data = await this.readSyncFile();
		if (operation.type === "folder") {
			this.removeFolderOperations(operation.path, data);
		}
		const indexInAdd = data.add.findIndex((op) => op.path === operation.path);
		if (indexInAdd !== -1) {
			data.add.splice(indexInAdd, 1);
		} else {
			const indexInUpdate = data.update.findIndex(
				(op) => op.path === operation.path,
			);
			if (indexInUpdate !== -1) {
				data.update.splice(indexInUpdate, 1);
			}
			const indexInDelete = data.delete.findIndex(
				(op) => op.path === operation.path,
			);
			if (indexInDelete === -1) {
				data.delete.push(operation);
			}
		}
		await this.writeSyncFile(data);
	}

	public async renameOperation(operation: RenameOperation): Promise<void> {
		const data = await this.readSyncFile();
		if (operation.type === "folder") {
			this.updateFilePathsForFolderRename(
				operation.oldPath,
				operation.newPath,
				data,
				operation.newFilename,
			);
		}
		const indexInAdd = data.add.findIndex(
			(op) => op.path === operation.oldPath,
		);
		if (indexInAdd !== -1) {
			// If found in add, rename it
			data.add[indexInAdd].path = operation.newPath;
			data.add[indexInAdd].filename = operation.newFilename;
		} else {
			const indexInUpdate = data.update.findIndex(
				(op) => op.path === operation.oldPath,
			);
			if (indexInUpdate !== -1) {
				// If found in update, rename it
				data.update[indexInUpdate].path = operation.newPath;
				data.update[indexInUpdate].filename = operation.newFilename;
			} else {
				// If not found in add or update, add it to rename
				data.rename.push(operation);
			}
		}

		await this.writeSyncFile(data);
	}
}

export default SyncManager;
