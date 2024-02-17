import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import { useState } from "react";

export default function TopFloatingPanel({
	open,
	toggleTopPanel,
	openCenter,
	setOpenCenter,
}) {
	async function cancelAutoFocus(event) {
		event.preventDefault();
	}

	function onCommandSelect() {
		toggleTopPanel(false);
		setOpenCenter(true);
		console.log("Here");
	}

	return (
		<CommandDialog open={open} modal={false}>
			<Command className="dark:bg-stone-900 font-virgil">
				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Suggestions">
						<CommandItem onSelect={() => onCommandSelect()}>
							Collate
						</CommandItem>
						<CommandItem>Search</CommandItem>
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
