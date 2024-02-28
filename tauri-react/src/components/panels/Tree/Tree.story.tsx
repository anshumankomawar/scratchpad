import { SortableTree } from "./SortableTree";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import {
	GraduationCap,
	NotepadText,
	FolderPlus,
	ShoppingBag,
	Bell,
	StickyNote,
	FilePlus,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { saveDocument, useDocuments } from "@/fetch/documents";
import { Panel, useDocStore, usePanelStore } from "@/app_state";

export const AllFeatures = ({ editor }) => {
	const updateDoc = useDocStore((state) => state.updateDoc);
	const documents = useDocuments();
	const doc = useDocStore((state) => state.doc);
	const updateTabs = useDocStore((state) => state.updateTabs);

	const handleNewDocument = async () => {
		const doc_id = await saveDocument(doc.filename, doc.foldername);
		await documents.refetch();
		editor.commands.setContent("");
		editor.chain().focus().setTextSelection(0).run();
		const newDoc = {
			filename: doc.filename,
			foldername: doc.foldername,
			id: doc_id,
			content: "",
		};

		updateDoc(newDoc);
		updateTabs(newDoc);
	};

	return (
		<div className="bg-alabaster dark:bg-dark2 h-full pt-10 overflow-scroll">
			<div className="flex flex-row mb-2 justify-end space-x-2 sticky top-5 bg-alabaster dark:bg-dark2 pb-2 px-5 align-bottom">
				<Popover>
					<PopoverTrigger>
						<FolderPlus
							size={16}
							className="stroke-dull_black dark:stroke-dull_white"
						/>
					</PopoverTrigger>
					<PopoverContent className="">
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="name" className="text-right">
									Name
								</Label>
								<Input
									id="name"
									placeholder="Folder Name"
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="icon" className="text-right">
									Icon
								</Label>
								<Select>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="select one" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="one">
											<GraduationCap size={20} />
										</SelectItem>
										<SelectItem value="two">
											<NotepadText size={20} />
										</SelectItem>
										<SelectItem value="three">
											<ShoppingBag size={20} />
										</SelectItem>
										<SelectItem value="four">
											<Bell size={20} />
										</SelectItem>
										<SelectItem value="five">
											<StickyNote size={20} />
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="flex justify-center text-sm">
							<Button type="submit">Create Folder</Button>
						</div>
					</PopoverContent>
				</Popover>
				<Popover>
					<PopoverTrigger>
						<FilePlus
							size={16}
							className="stroke-dull_black dark:stroke-dull_white"
						/>
					</PopoverTrigger>
					<PopoverContent className="">
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="name" className="text-right">
									Name
								</Label>
								<Input
									id="name"
									onChange={(e) => {
										updateDoc({
											...doc,
											filename: e.target.value,
										});
									}}
									placeholder="File Name"
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="icon" className="text-right">
									Folder
								</Label>
								<Select
									defaultValue={document.foldername}
									onValueChange={(value) =>
										updateDoc({
											...doc,
											foldername: value,
										})
									}
								>
									<SelectTrigger className="w-[180px] ">
										<SelectValue
											placeholder="select folder"
											onSelect={(value) => console.log(value)}
										/>
									</SelectTrigger>
									<SelectContent>
										{Object.entries(documents.data).map(
											([foldername], index) => (
												<SelectItem className="" value={foldername} key={index}>
													{foldername}
												</SelectItem>
											),
										)}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="flex justify-center text-sm">
							<Button onClick={() => handleNewDocument()} type="submit">
								Create File
							</Button>
						</div>
					</PopoverContent>
				</Popover>
			</div>
			<SortableTree collapsible indicator removable />
		</div>
	);
};
