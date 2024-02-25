import { create } from "zustand";

export const useDocStore = create((set) => ({
	doc: {
		filename: "",
		foldername: "unfiled",
		id: "",
	},
	updateDoc: (newDoc) => set((state) => ({ doc: newDoc })),
	tabs: {},
	updateTabs: (newTab) => set((state) => ({ tabs: {...state.tabs, [newTab.filename]: newTab } })),
}));

export const useDndStore = create((set) => ({
	parent: "",
	updateParent:  (newParent) => set((state) => ({ parent: newParent }))
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
	left: false,
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
