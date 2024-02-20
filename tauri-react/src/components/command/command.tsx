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
import { updateDocument, useDocuments } from "@/fetch/documents";
import { Panel, useDocStore, usePanelStore } from "@/app_state";
import { useTheme } from "@/context/theme_context";
import CollatePanel from "../collate/collate";
import SettingsPage from "../settings/settings";

export default function CommandPanel({ editor }) {
	const documents = useDocuments();
	const doc = useDocStore((state) => state.doc);
	const panel = usePanelStore((state) => state);
	const { theme, setTheme } = useTheme();

	async function onCommandCollate() {
		panel.setCenterContent(<CollatePanel />);
		panel.togglePanel(Panel.COMMAND);
		panel.setPanel(Panel.CENTER, true);
	}

	async function onCommandSettings() {
		panel.setCenterContent(<SettingsPage />);
		panel.togglePanel(Panel.COMMAND);
		panel.setPanel(Panel.CENTER, true);
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
			<Command>
				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Suggestions">
						<CommandItem onSelect={() => onCommandCollate()}>
							Collate
						</CommandItem>
						<CommandItem onSelect={() => onCommandSave()}>Save</CommandItem>
						<CommandItem>Search</CommandItem>
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup heading="Settings">
						<CommandItem
							onSelect={() => setTheme(theme === "light" ? "dark" : "light")}
						>
							Theme
						</CommandItem>
						<CommandItem>Profile</CommandItem>
						<CommandItem>Billing</CommandItem>
						<CommandItem onSelect={() => onCommandSettings()}>
							Settings
						</CommandItem>
					</CommandGroup>
				</CommandList>
			</Command>
		</CommandDialog>
	);
}
