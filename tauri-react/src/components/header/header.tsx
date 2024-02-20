import { ChevronsLeft, Menu, MoreHorizontal } from "lucide-react";
import { Panel, useDocStore, usePanelStore } from "@/app_state";
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

export default function Header() {
	const panel = usePanelStore((state) => state);
	const { theme, setTheme } = useTheme();
	const doc = useDocStore((state) => state);
	const store = useStore();
	const navigate = useNavigate({ from: "/" });

	const handleLogout = async () => {
		await store.store.delete("token");
		navigate({ to: "/" });
	};

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
			<Button
				variant="ghost"
				className={cn(
					"w-min p-2 border-none text-dull_black dark:text-dull_white text-sm",
					panel.left ? "ml-4" : "",
				)}
				size="menu"
			>
				{doc.doc.filename}
			</Button>
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
