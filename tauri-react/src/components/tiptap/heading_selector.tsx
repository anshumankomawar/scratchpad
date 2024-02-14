import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Level } from "@tiptap/extension-heading";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Editor } from "@tiptap/react";

const frameworks = [
	{
		value: "h4",
		label: "paragraph",
	},
	{
		value: "h3",
		label: "H3",
	},
	{
		value: "h2",
		label: "H2",
	},
	{
		value: "h1",
		label: "H1",
	},
];

export function HeadingSelector({
	editor,
	className,
}: { editor: Editor | null; className: string }) {
	if (!editor) return;

	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("h4");

	return (
		<div className={className}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						size="font"
						className="w-full justify-between font-normal text-xs"
					>
						{value
							? frameworks.find((framework) => framework.value === value)?.label
							: "h4"}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0">
					<Command>
						<CommandInput placeholder="Search font..." />
						<CommandEmpty>No framework found.</CommandEmpty>
						<CommandGroup>
							{frameworks.map((framework) => (
								<CommandItem
									key={framework.value}
									value={framework.value}
									onSelect={(currentValue) => {
										setValue(currentValue);
										editor.chain().focus().toggleHeading({ level: 2 }).run();
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === framework.value ? "opacity-100" : "opacity-0",
										)}
									/>
									{framework.label}
								</CommandItem>
							))}
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
