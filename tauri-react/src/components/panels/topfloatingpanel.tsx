import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "../ui/button";
import Save from "../save/save";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@/components/ui/command";
import { useEffect } from "react";

export default function TopFloatingPanel({ open, toggleTopPanel }) {
	async function cancelAutoFocus(event) {
		event.preventDefault();
	}

	return (
		<CommandDialog open={open} modal={false}>
			<Command className="dark:bg-stone-900 font-virgil">
				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Suggestions">
						<CommandItem>Calendar</CommandItem>
						<CommandItem>Search Emoji</CommandItem>
						<CommandItem>Calculator</CommandItem>
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup heading="Settings">
						<CommandItem>Profile</CommandItem>
						<CommandItem>Billing</CommandItem>
						<CommandItem>Settings</CommandItem>
					</CommandGroup>
				</CommandList>
			</Command>
		</CommandDialog>
	);
}
