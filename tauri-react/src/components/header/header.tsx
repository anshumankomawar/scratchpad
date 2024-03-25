import { MoreHorizontal } from "lucide-react";
import {
	Panel,
	useDndStore,
	useDocStore,
	useFileManager,
	usePanelStore,
} from "@/app_state";
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
import AccountPage from "../account/account";

export default function Header() {
	const panel = usePanelStore((state) => state);
	const { theme, setTheme } = useTheme();
	const store = useStore();
	const navigate = useNavigate({ from: "/" });
	const fileManager = useFileManager((state) => state);

	const handleLogout = async () => {
		await store.store.delete("token");
		navigate({ to: "/" });
	};

	return (
		<div
			className={cn(
				"transition-all h-full flex flex-row items-center",
				panel.left ? "pl-36" : "pl-20",
			)}
			data-tauri-drag-region
		>
			<div className="flex-grow" />
			{fileManager.isSyncing && (
				<div className="text-xs text-dull_black dark:text-dull_white">
					Syncing <div></div>
				</div>
			)}
			{/*{fileManager.isSyncing ? (
				<div className="text-xs text-dull_black dark:text-dull_white">
					Syncing...
				</div>
			) : (
				<div className="text-xs text-dull_black dark:text-dull_white">
					Last sync... {fileManager.lastSync}
				</div>
			)}*/}
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
						onClick={() => {
							panel.setCenterContent(<AccountPage />);
							panel.setPanel(Panel.CENTER, true);
						}}
					>
						Account
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
					<Button
						variant="ghost"
						size="menu"
						className="w-full text-xs justify-start p-2"
						onClick={() => handleLogout()}
					>
						Logout
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
