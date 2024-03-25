import { create } from "zustand";
import { Editor } from "@tiptap/react";
import { BaseDirectory, lstat, readDir, readFile } from "@tauri-apps/plugin-fs";

interface FileItem {
	id: string;
	content: string;
	filename: string;
	foldername: string;
	folder_id: string;
	created_at: string;
	isActive: true;
	filetype: string;
	type: "file";
}

interface FolderItem {
	id: string;
	foldername: string;
	folder_id: string;
	type: "folder";
}

type DirectoryContent = FileItem | FolderItem;

interface FolderContents {
	[key: string]: DirectoryContent[];
}

export interface FileManagerState {
	baseDir: BaseDirectory;
	files: FolderContents;
	folders: { [folderName: string]: { depth: number; id: string } };
	selectedFile: FileItem | null;
	selectedFolder: string | null;
	syncPath: string;
	dataPath: string;
	isSyncing: boolean;
	lastSync: string | null;
	toggleIsSyncing: () => void;
	setDataPath: (path: string) => void;
	updateFiles: (files: FolderContents) => void;
	readDir: () => Promise<void>;
	selectFolder: (id: string) => void;
	selectFile: (id: string) => void;
}

async function flattenDirectoryContents(
	dirPath: string,
	baseDir: BaseDirectory,
): Promise<DirectoryContent[]> {
	const parentFiles: DirectoryContent[] = [];
	const folderItemsWithContents: DirectoryContent[] = [];
	const entries = await readDir(dirPath, { baseDir });

	for (const entry of entries) {
		const relativeFilePath = `${dirPath}/${entry.name}`;

		if (entry.isFile && entry.name !== ".DS_Store") {
			const content = await readFile(relativeFilePath, { baseDir });
			const decoder = new TextDecoder("utf-8");
			const text = decoder.decode(content);
			const fileStat = await lstat(relativeFilePath, { baseDir });

			parentFiles.push({
				id: relativeFilePath,
				content: text,
				filename: entry.name.split(".")[0],
				foldername: dirPath,
				folder_id: dirPath,
				created_at:
					fileStat.birthtime?.toISOString() ?? new Date().toISOString(),
				isActive: true,
				filetype: entry.name.split(".").pop() ?? "txt",
				type: "file",
			});
		} else if (entry.isDirectory) {
			const folderItem: DirectoryContent = {
				id: relativeFilePath,
				foldername: entry.name,
				folder_id: dirPath,
				type: "folder",
			};

			const nestedItems = await flattenDirectoryContents(
				relativeFilePath,
				baseDir,
			);

			folderItemsWithContents.push(folderItem, ...nestedItems);
		}
	}

	return [...parentFiles, ...folderItemsWithContents];
}

async function mapDirectoryToJson(
	dirPath: string,
	baseDir: BaseDirectory,
): Promise<FolderContents> {
	const result: FolderContents = {};
	const entries = await readDir(dirPath, { baseDir });

	for (const entry of entries.filter((entry) => entry.isDirectory)) {
		const subDirPath = `${dirPath}/${entry.name}`;
		const flattenedContents = await flattenDirectoryContents(
			subDirPath,
			baseDir,
		);
		result[entry.name] = flattenedContents;
	}

	return result;
}

function findDocumentById(
	folders: FolderContents,
	documentId: string,
): DirectoryContent | null {
	for (const folderName in folders) {
		const contents = folders[folderName];
		const document = contents.find((doc) => doc.id === documentId);
		if (document) {
			return document;
		}
	}
	return null;
}

export const useFileManager = create<FileManagerState>((set, get) => ({
	baseDir: BaseDirectory.AppData,
	files: {},
	folders: {},
	selectedFile: null,
	selectedFolder: null,
	syncPath: "sync.json",
	dataPath: "",
	isSyncing: false,
	lastSync: null,
	updateFiles: (files) => set({ files }),
	toggleIsSyncing: () => set((state) => ({ isSyncing: !state.isSyncing })),
	setDataPath: (path) => set((state) => ({ ...state, dataPath: path })),
	readDir: async () => {
		const folders: { [folderName: string]: { depth: number; id: string } } = {};
		const entries = await readDir(get().dataPath, {
			baseDir: BaseDirectory.AppData,
		});
		for (const entry of entries) {
			if (entry.isDirectory) {
				const folderId = `${get().dataPath}/${entry.name}`;
				const flattenedContents = await flattenDirectoryContents(
					folderId,
					BaseDirectory.AppData,
				);
				const fileCount = flattenedContents.filter(
					(content) => content.type === "file",
				).length;

				folders[entry.name] = {
					depth: fileCount,
					id: folderId,
				};
			}
		}

		set({
			folders,
			files: await mapDirectoryToJson(get().dataPath, BaseDirectory.AppData),
		});
	},
	selectFolder: (id) => {
		set({ selectedFolder: id });
	},
	selectFile: (id) =>
		set((state) => {
			let selectedFile = null;
			let selectedFolder = null;
			if (id) {
				selectedFile = findDocumentById(state.files, id);

				if (selectedFile && selectedFile.type === "file") {
					const folderPath = selectedFile.folder_id;
					const pathSegments = folderPath.split("/");
					const filesIndex = pathSegments.indexOf(state.dataPath);
					if (filesIndex !== -1 && pathSegments.length > filesIndex + 1) {
						selectedFolder = pathSegments[filesIndex + 1];
					}
				}
			}

			return {
				...state,
				selectedFile,
				selectedFolder,
			};
		}),
}));

interface DocMetadata {
	filename: string;
	foldername: string;
	id: string;
	folder_id: string;
	filetype: string;
	content: string;
}

export interface DocStore {
	doc: DocMetadata;
	textEditor: Editor | null;
	sheetEditor: Editor | null;
	getEditor: () => Editor | null;
	getEmptyContent: (filetype: string) => string;
	setEditorContent: (content: string) => void;
	updateFolder: (folderId: string, foldername: string) => void;
	updateDoc: (newDoc: DocMetadata) => void;
	updateTabs: (newTab: DocMetadata) => void;
	swapTabs: (tab1: DocMetadata, tab2: DocMetadata) => void;
	deleteTab: (toDelete: DocMetadata) => void;
}

export const useDocStore = create<DocStore>((set, get) => ({
	doc: {
		filename: "",
		foldername: "unfiled",
		id: "",
		folder_id: "",
		filetype: "",
		content: "",
	},
	textEditor: null,
	sheetEditor: null,
	getEmptyContent: (filetype) => {
		switch (filetype) {
			case "txt": {
				return "";
			}
			case "sheet": {
				return `
          <table>
            <tbody>
              <tr>
                <th></th>
                <th></th>
                <th></th>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `;
			}
			default:
				return "";
		}
	},
	getEditor: () => {
		const filetype = useFileManager.getState().selectedFile?.filetype;

		switch (filetype) {
			case "txt":
				return get().textEditor;
			case "sheet":
				return get().sheetEditor;
			default:
				return null;
		}
	},
	setEditorContent: (content) => {
		const filetype = useFileManager.getState().selectedFile?.filetype;

		switch (filetype) {
			case "txt": {
				get().textEditor?.commands.setContent(content);
				break;
			}
			case "sheet": {
				if (content === "") {
					get().sheetEditor?.commands.setContent(
						get().getEmptyContent("sheet"),
					);
				} else {
					get().sheetEditor?.commands.setContent(content);
				}

				break;
			}
			default: {
				get().textEditor?.commands.setContent(get().getEmptyContent("intro"));
				break;
			}
		}
	},
	updateFolder: (folderId, foldername) =>
		set((state) => ({
			doc: { ...state.doc, folder_id: folderId, foldername: foldername },
		})),
	updateDoc: (newDoc) => set((state) => ({ doc: newDoc })),
	tabs: [],
	updateTabs: (newTab) =>
		set((state) => {
			const exists = state.tabs.some((tab) => tab.filename === newTab.filename);
			if (!exists) {
				return { tabs: [...state.tabs, newTab] };
			}
			return { tabs: [...state.tabs] };
		}),
	swapTabs: (tab1, tab2) =>
		set((state) => {
			const index1 = state.tabs.findIndex((tab) => tab.filename === tab1.id);
			const index2 = state.tabs.findIndex((tab) => tab.filename === tab2.id);
			[state.tabs[index1], state.tabs[index2]] = [
				state.tabs[index2],
				state.tabs[index1],
			];
			return { tabs: [...state.tabs] };
		}),
	deleteTab: (toDelete) =>
		set((state) => ({
			tabs: state.tabs.filter((tab) => tab.id !== toDelete.id),
		})),
}));

export const useDndStore = create((set) => ({
	parent: "",
	updateParent: (newParent) => set((state) => ({ parent: newParent })),
}));

interface PanelState {
	left: boolean;
	command: boolean;
	right: boolean;
	center: boolean;
	centerContent: React.ReactNode;
	togglePanel: (panel: Panel) => void;
	setPanel: (panel: Panel, isOpen: boolean) => void;
	changeCommand: (open: boolean) => void;
	changeCenter: (open: boolean) => void;
	setCenterContent: (content: React.ReactNode) => void;
}

export enum Panel {
	LEFT = "left",
	RIGHT = "right",
	COMMAND = "command",
	CENTER = "center",
}

export const usePanelStore = create<PanelState>((set) => ({
	left: true,
	command: false,
	right: false,
	center: false,
	centerContent: null,
	togglePanel: (panel: Panel) =>
		set((state) => {
			switch (panel) {
				case Panel.COMMAND:
					return { command: !state.command };
				case Panel.LEFT:
					return { left: !state.left };
				case Panel.RIGHT:
					return { right: !state.right };
				case Panel.CENTER:
					return { center: !state.center };
			}
		}),
	setPanel: (panel: Panel, open: boolean) =>
		set((state) => {
			switch (panel) {
				case Panel.COMMAND:
					return { command: open };
				case Panel.LEFT:
					return { left: open };
				case Panel.RIGHT:
					return { right: open };
				case Panel.CENTER:
					return { center: open };
			}
		}),
	changeCommand: (open: boolean) => set(() => ({ command: open })),
	changeCenter: (open: boolean) => set(() => ({ center: open })),
	setCenterContent: (content: React.ReactNode) =>
		set(() => ({ centerContent: content })),
}));
