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
import { Panel, useDocStore, usePanelStore } from "@/app_state";

export default function CommandPanel({ editor }) {
	const documents = useDocuments();
	const doc = useDocStore((state) => state.doc);
	const panel = usePanelStore((state) => state);

	async function cancelAutoFocus(event) {
		event.preventDefault();
	}

	function onCommandSelect() {
		panel.togglePanel(Panel.COMMAND);
		panel.setPanel(Panel.CENTER, true);
		console.log("Here");
	}

	async function onCommandSave() {
		panel.togglePanel(Panel.COMMAND);
		await updateDocument(
			doc.filename,
			doc.foldername,
			editor.getHTML(),
			doc.id,
		);
		await documents.refetch();
	}

	return (
		<CommandDialog
			open={panel.command}
			modal={false}
			onOpenChange={panel.changeCommand}
		>
			<Command className="dark:bg-stone-900">
				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Suggestions">
						<CommandItem onSelect={() => onCommandSelect()}>
							Collate
						</CommandItem>
						<CommandItem onSelect={() => onCommandSave()}>Save</CommandItem>
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
