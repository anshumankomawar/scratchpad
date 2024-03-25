import { useDocStore, useFileManager } from "@/app_state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { createLocalDocument } from "@/utilities/fileutils";
import { useState } from "react";

export default function NewFileMenu({ path = null }) {
	const fileManager = useFileManager((state) => state);
	const docStore = useDocStore((state) => state);
	const [isOpened, setIsOpened] = useState(false);

	return (
		<Popover open={isOpened}>
			<PopoverTrigger asChild>
				<Button
					variant={"ghost"}
					size={"toolbar"}
					onClick={() => setIsOpened(true)}
				>
					<Plus
						size={14}
						className="stroke-dull_black dark:stroke-dull_white"
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-1">
				<Input
					className="text-dull_black dark:text-dull_white border text-xs rounded-sm"
					onBlur={() => setIsOpened(false)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							createLocalDocument(docStore, fileManager, e.target.value, path);
							setIsOpened(false);
						} else if (e.key === "Escape") {
							setIsOpened(false);
						}
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
