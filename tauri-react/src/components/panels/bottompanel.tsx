import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { useState } from "react";
import SettingsPage from "../settings/settings";
import { usePanelStore, Panel } from "@/app_state";

export default function BottomPanel({
	theme,
	setTheme,
	editor,
	handleLogout,
	filename,
}) {
	const [openDialog, setOpenDialog] = useState(false);
	const panel = usePanelStore((state) => state);

	return (
		<Dialog open={openDialog}>
			<div className="fixed z-50 left-0 bottom-0 h-min w-full justify-between items-center px-5 py-4">
				<Popover>
					<PopoverContent className="w-full p-1 ml-2 mb-2 flex flex-col overflow-y-scroll space-y-1 w-32  text-xs text-start">
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
							onClick={() => setOpenDialog(true)}
						>
							Settings
						</Button>
						<Button
							variant="ghost"
							size="menu"
							className="w-full text-xs justify-start p-2"
							onClick={handleLogout}
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
					<PopoverTrigger className="absolute left-4 bottom-4 text-start text-xs hover:cursor-pointer">
						Settings
					</PopoverTrigger>
				</Popover>
				<div className="absolute right-4 bottom-4 text-end text-xs text-nowrap">
					{editor.storage.characterCount.words()} |{" "}
					{editor.storage.characterCount.characters()}
				</div>
			</div>
			<DialogContent
				className="bg-white dark:bg-background h-5/6 w-5/6  p-8"
				onPointerDownOutside={() => setOpenDialog(false)}
			>
				<SettingsPage />
			</DialogContent>
		</Dialog>
	);
}
