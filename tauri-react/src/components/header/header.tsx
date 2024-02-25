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
import { Draggable } from "@/components/dnd/draggable";
import {
	SortableContext, horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableItem from "@/components/dnd/sortableitem";

export default function Header({ items }) {
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

	const containers = ['A', 'B', 'C'];
	const draggableMarkup = (
		<Draggable id="draggable">Drag me</Draggable>
	)


	const handleLogout = async () => {
		await store.store.delete("token");
		navigate({ to: "/" });
	};

	if (!tiptap.editor) {
		return <div>Loading...</div>;
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
			{Object.entries(tabs).map(
				([tab, metadata], index) => (
					<Button
						className=""
						value={tab}
						key={index}
						onClick={() => {
							updateDoc(metadata)
							tiptap.editor.commands.setContent(metadata.content)
						}}
					>
						{tab}
					</Button>
				),
			)}
			{/* <SortableContext 
        items={tabs}
        strategy={horizontalListSortingStrategy}
      >
        {items.map(id => <SortableItem key={id} id={id} />)}
      </SortableContext> */}
			{/* <Button
				variant="ghost"
				className={cn(
					"w-min p-2 border-none text-dull_black dark:text-dull_white text-sm",
					panel.left ? "ml-4" : "",
				)}
				size="menu"
			>
				{doc.filename}
			</Button> */}
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
