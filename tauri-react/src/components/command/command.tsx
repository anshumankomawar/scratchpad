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

export default function CommandPanel({
	open,
	toggleTopPanel,
	openCenter,
	setOpenCenter,
	document,
	editor
}) {
	async function cancelAutoFocus(event) {
		event.preventDefault();
	}

	function onCommandSelect() {
		toggleTopPanel(false);
		setOpenCenter(true);
		console.log("Here");
	}

	function onCommandSave() {
		invoke("update_document", { filename: document.filename, content: editor.getHTML(), foldername: document.foldername, currId: document.id })
			.then((doc_id) => {
				console.log(doc_id);
			})
			.catch((error) => {
				console.log(error);
				toast({
					variant: "destructive",
					title: "Uh oh! Something went wrong.",
					description: error.code,
					action: <ToastAction altText="Try again">Try again</ToastAction>,
				});
			})
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
