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
import { invoke } from "@tauri-apps/api/core";
import { toast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import { updateDocument, useDocuments } from "@/fetch/documents";

export default function CommandPanel({
	open,
	toggleTopPanel,
	openCenter,
	setOpenCenter,
	document,
	editor
}) {
  const documents = useDocuments()

	async function cancelAutoFocus(event) {
		event.preventDefault();
	}

	function onCommandSelect() {
		toggleTopPanel(false);
		setOpenCenter(true);
		console.log("Here");
	}

	async function onCommandSave() {
		await updateDocument(document.filename, document.foldername, editor.getHTML(), document.id)
    await documents.refetch()
	}

	return (
		<CommandDialog open={open} modal={false}>
			<Command className="dark:bg-stone-900 ">
				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Suggestions">
						<CommandItem onSelect={() => onCommandSelect()}>
							Collate
						</CommandItem>
						<CommandItem onSelect={() => onCommandSave()}>
							Save
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
