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

export default function BottomPanel({
	theme,
	setTheme,
	editor,
	toggleLeftPanel,
	toggleBottomPanel,
	handleLogout,
}) {
	const [openDialog, setOpenDialog] = useState(false);

	return (
		<Dialog open={openDialog}>
			<div className="z-100 bottom-0 left-0 fixed h-min flex flex-row w-full items-center px-5 py-4 bg-white dark:bg-stone-900">
				<Popover>
					<PopoverContent className="p-1 ml-2 mb-2 flex flex-col overflow-y-scroll space-y-1 w-32  text-xs text-start dark:bg-stone-900">
						<Button
							variant="ghost"
							size="menu"
							className="text-xs justify-start p-2"
							onClick={toggleLeftPanel}
						>
							Open
						</Button>
						<Button
							variant="ghost"
							size="menu"
							className="text-xs justify-start p-2"
							onClick={toggleBottomPanel}
						>
							Files
						</Button>
						<Button
							variant="ghost"
							size="menu"
							className="text-xs justify-start p-2"
							onClick={() => setOpenDialog(true)}
						>
							Settings
						</Button>
						<Button
							variant="ghost"
							size="menu"
							className="text-xs justify-start p-2"
							onClick={handleLogout}
						>
							Logout
						</Button>
						<Button
							variant="ghost"
							size="menu"
							className="text-xs justify-between p-2"
							onClick={() => {
								setTheme(theme === "light" ? "dark" : "light");
							}}
						>
							{theme === "light" ? "Dark Mode" : "Light Mode"}
							{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
						</Button>
					</PopoverContent>
					<PopoverTrigger className="text-start text-xs hover:cursor-pointer">
						Settings
					</PopoverTrigger>
				</Popover>
				<div className="grow"></div>
				<div className="text-xs">filename.txt</div>
				<div className="grow"></div>
				<div className="text-end text-xs">
					{editor.storage.characterCount.words()} |{" "}
					{editor.storage.characterCount.characters()}
				</div>
			</div>
			<DialogContent
				className="bg-white h-5/6 w-5/6  p-8"
				onPointerDownOutside={() => setOpenDialog(false)}
			>
				<SettingsPage />
			</DialogContent>
		</Dialog>
	);
}
