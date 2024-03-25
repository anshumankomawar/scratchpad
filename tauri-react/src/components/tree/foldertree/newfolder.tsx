import { useDocStore, useFileManager } from "@/app_state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { handleNewFolder } from "@/utilities/fileutils";
import { useState } from "react";

export default function NewFolderMenu({ path = null }) {
	const fileManager = useFileManager((state) => state);
	const docStore = useDocStore((state) => state);
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button variant={"ghost"} size={"toolbar"}>
					<Plus
						size={14}
						className="stroke-dull_black dark:stroke-dull_white"
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-1">
				<Input
					className="text-dull_black dark:text-dull_white border text-xs rounded-sm"
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleNewFolder(fileManager, e.target.value);
							setIsOpen(false);
						}
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
