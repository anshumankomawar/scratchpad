import { ChevronsLeft, Menu, MoreHorizontal } from "lucide-react";
import { Panel, useDndStore, useDocStore, usePanelStore } from "@/app_state";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/theme_context";
import { useStore } from "@/auth";
import { useNavigate } from "@tanstack/react-router";
import SettingsPage from "../settings/settings";
import { useTipTapEditor } from "@/context/tiptap_context";
import {
	SortableContext,
	horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "@/components/dnd/sortableitem";
import { X } from "lucide-react";

export default function Header() {
	const panel = usePanelStore((state) => state);
	const { theme, setTheme } = useTheme();
	const doc = useDocStore((state) => state.doc);
	const updateDoc = useDocStore((state) => state.updateDoc);
	const tabs = useDocStore((state) => state.tabs);
	const store = useStore();
	const navigate = useNavigate({ from: "/" });
	const tiptap = useTipTapEditor();
	const parent = useDndStore((state) => state.parent);
	const updateParent = useDndStore((state) => state.updateParent);
	const deleteTab = useDocStore((state) => state.deleteTab);

	const handleLogout = async () => {
		await store.store.delete("token");
		navigate({ to: "/" });
	};

	const handleDeleteTab = (tab) => {
		deleteTab(tab);
		updateDoc(useDocStore.getState().tabs[0]);
		if (useDocStore.getState().tabs.length > 0) {
			tiptap.editor.commands.setContent(useDocStore.getState().doc.content);
		} else {
			tiptap.editor.commands.setContent("");
		}
	};

	if (!tiptap.editor) {
		return <div></div>;
	}

	return (
		<div
			className={cn(
				"transition-all h-full flex flex-row items-center",
				panel.left ? "pl-40" : "pl-20",
			)}
			data-tauri-drag-region
		>
			<Button
				variant="ghost"
				size="menu"
				className="hover:cursor-pointer"
				onClick={() => panel.togglePanel(Panel.LEFT)}
				asChild
			>
				{panel.left ? (
					<ChevronsLeft className="stroke-dull_black dark:stroke-dark2 dark:stroke-dull_white" />
				) : (
					<Menu className="stroke-dull_black dark:stroke-dull_white" />
				)}
			</Button>
			<div
				className={cn(
					"flex-grow flex-row flex border-none text-dull_black dark:text-dull_white text-sm items-center justify-start h-full space-x-1.5 ml-1",
					panel.left ? "ml-4" : "",
				)}
			>
				<SortableContext items={tabs} strategy={horizontalListSortingStrategy}>
					{tabs.map((tab) => (
						<div
							className={cn(
								"text-xs py-1 px-1.5 hover:bg-accent hover:text-accent-foreground rounded-md flex items-center",
								doc.id === tab.id ? "bg-accent" : "",
							)}
						>
							<SortableItem
								key={tab.id}
								id={tab.filename}
								tab={tab}
								removable
							/>
							<X
								size={10}
								className="hover:stroke-red-400 "
								onClick={() => {
									handleDeleteTab(tab);
								}}
							/>
						</div>
					))}
				</SortableContext>
			</div>
			<div className="flex-grow" />
			<Button
				variant="ghost"
				className="w-min p-2 border-none text-dull_black dark:text-dull_white text-sm"
				size="menu"
			>
				Share
			</Button>
			<Popover>
				<PopoverContent className="w-48 p-1 mr-2 flex flex-col overflow-y-scroll space-y-1 w-32 text-xs text-start">
					<Button
						variant="ghost"
						size="menu"
						className="w-full text-xs justify-start p-2"
						onClick={() => panel.togglePanel(Panel.LEFT)}
					>
						Files
					</Button>
					<Button
						variant="ghost"
						size="menu"
						className="w-full text-xs justify-start p-2"
						onClick={() => {
							panel.setCenterContent(<SettingsPage />);
							panel.setPanel(Panel.CENTER, true);
						}}
					>
						Settings
					</Button>
					<Button
						variant="ghost"
						size="menu"
						className="w-full text-xs justify-start p-2"
						onClick={() => handleLogout()}
					>
						Logout
					</Button>
					<Button
						variant="ghost"
						size="menu"
						className="w-full text-xs justify-between p-2"
						onClick={() => {
							setTheme(theme === "light" ? "dark" : "light");
						}}
					>
						{theme === "light" ? "Dark Mode" : "Light Mode"}
						{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
					</Button>
				</PopoverContent>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						size="menu"
						className="hover:cursor-pointer mr-2"
						asChild
					>
						<MoreHorizontal className="stroke-dull_black dark:stroke-dull_white" />
					</Button>
				</PopoverTrigger>
			</Popover>
		</div>
	);
}
