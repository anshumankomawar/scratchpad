import { create } from "zustand";
import { flattenTree, removeChildrenOf } from "./components/filetree/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";

interface TreeStore {
	data: any;
	tree: any[];
	sortedIds: UniqueIdentifier[];
	flattenedTree: any[];
	activeId: UniqueIdentifier | null;
	_flattenTree: (data: any, activeIdOverride: UniqueIdentifier | null) => any;
	updateData: (data: any) => void;
	updateTree: (data: any[]) => void;
	updateActiveId: (activeId: UniqueIdentifier | null) => void;
	deleteFile: (fileId: string) => void;
	updateTreeOnDocumentUpdate: (
		foldername: string,
		oldDocId: string,
		newDocId: string,
	) => void;
}

export const useTreeStore = create<TreeStore>((set) => ({
	data: {},
	tree: [],
	sortedIds: [],
	flattenedTree: [],
	activeId: null,
	_flattenTree: (data, activeIdOverride) => {
		const flattenedTree = flattenTree(data);
		const collapsedItems = flattenedTree.reduce<string[]>(
			(acc, { children, collapsed, id, file }) =>
				collapsed && children.length ? [...acc, id, file] : acc,
			[],
		);
		const activeId =
			activeIdOverride !== undefined ? activeIdOverride : this.activeId;
		const newItems = removeChildrenOf(
			flattenedTree,
			activeId ? [activeId, ...collapsedItems] : collapsedItems,
		);
		return {
			flattenedTree: newItems,
			sortedIds: flattenedTree.map((item) => item.id),
		};
	},
	deleteFile: (fileId) =>
		set((state) => {
			const updatedTree = state.tree.map((item) => {
				const updatedChildren = item.children.filter(
					(child) => child.file.id !== fileId,
				);
				return { ...item, children: updatedChildren };
			});
			const { flattenedTree, sortedIds } = state._flattenTree(
				updatedTree,
				state.activeId,
			);
			return {
				...state,
				tree: updatedTree,
				flattenedTree,
				sortedIds,
			};
		}),
	updateTreeOnDocumentUpdate: (foldername, oldDocId, newDocId) =>
		set((state) => {
			const updatedTree = state.flattenedTree.map((item) => {
				if (item.foldername === foldername) {
					const updatedChildren = item.children.map((child) => {
						if (child.id === oldDocId) {
							return { ...child, id: newDocId };
						}
						return child;
					});
					return { ...item, children: updatedChildren };
				}
				return item;
			});
			const { flattenedTree, sortedIds } = state._flattenTree(
				updatedTree,
				state.activeId,
			);
			return {
				...state,
				tree: updatedTree,
				flattenedTree,
				sortedIds,
			};
		}),
	updateData: (data) =>
		set((state) => {
			const newData = Object.entries(data).map(([folderName, files]) => ({
				id: files.id,
				foldername: folderName,
				children: files.documents.map((file) => ({
					folder_id: files.id,
					foldername: folderName,
					id: file.filename,
					children: [],
					file: file,
				})),
				file: null,
				collapsed: true,
			}));

			const { flattenedTree, sortedIds } = state._flattenTree(
				newData,
				state.activeId,
			);
			return {
				...state,
				data: data,
				tree: newData,
				flattenedTree,
				sortedIds,
			};
		}),
	updateTree: (data) =>
		set((state) => {
			const { flattenedTree, sortedIds } = state._flattenTree(
				data,
				state.activeId,
			);
			return {
				...state,
				tree: data,
				flattenedTree,
				sortedIds,
			};
		}),
	updateActiveId: (activeId) =>
		set((state) => {
			const { flattenedTree, sortedIds } = state._flattenTree(
				state.tree,
				activeId,
			);
			return {
				...state,
				activeId,
				flattenedTree,
				sortedIds,
			};
		}),
}));

export const useDocStore = create((set) => ({
	doc: {
		filename: "",
		foldername: "unfiled",
		id: "",
		folder_id: "",
	},
	updateFolder: (folderId, foldername) =>
		set((state) => ({
			doc: { ...state.doc, folder_id: folderId, foldername: foldername },
		})),
	updateFile: (folderId, foldername) =>
		set((state) => ({
			doc: {
				...state.doc,
				folder_id: state.doc.folderId,
				foldername: state.doc.foldername,
			},
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
