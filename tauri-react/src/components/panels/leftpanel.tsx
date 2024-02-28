import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

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
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	GraduationCap,
	NotepadText,
	FolderPlus,
	ShoppingBag,
	Bell,
	StickyNote,
	FilePlus,
} from "lucide-react";
import { saveDocument, useDocuments } from "@/fetch/documents";
import { Panel, useDocStore, usePanelStore } from "@/app_state";

export default function LeftPanel({ editor }) {
	const documents = useDocuments();
	const doc = useDocStore((state) => state.doc);
	const tabs = useDocStore((state) => state.tabs);
	const updateDoc = useDocStore((state) => state.updateDoc);
	const updateTabs = useDocStore((state) => state.updateTabs);
	const panel = usePanelStore((state) => state);

	async function cancelAutoFocus(event) {
		event.preventDefault();
	}

	const handleNewDocument = async () => {
		// TODO: Add error handling
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
		<div className="bg-alabaster dark:bg-dark2 h-full w-full pt-12 px-4 ">
			<SheetHeader>
				<SheetTitle className="flex flex-row mb-2">
					<div>Files</div>
					<div className="flex-grow"></div>
					<div className="flex space-x-2">
						<Popover>
							<PopoverTrigger>
								<FolderPlus size={18} />
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
								<FilePlus size={18} />
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
														<SelectItem
															className=""
															value={foldername}
															key={index}
														>
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
				</SheetTitle>
			</SheetHeader>
			<Accordion type="multiple">
				{Object.entries(documents.data).map(([foldername, files], index) => (
					<AccordionItem value={foldername} key={index}>
						<AccordionTrigger className="space-x-2 space-y-1">
							<GraduationCap
								size={16}
								strokeWidth={1.5}
								style={{ transform: "none" }}
							/>
							<div>{foldername}</div>
							<div className="flex-grow"></div>
						</AccordionTrigger>
						<AccordionContent className="text-xs">
							<ul className="list-disc pl-4">
								{files.map((file, index2) => (
									<ContextMenu>
										<ContextMenuTrigger>
											<li
												className="hover:cursor-pointer hover:underline hover:text-slate-700"
												key={index2}
												onClick={() => {
													editor.commands.setContent(file.content);
													updateDoc(file);
													updateTabs(file);
													console.log("left", useDocStore.getState().tabs);
												}}
											>
												{file.filename}
											</li>
										</ContextMenuTrigger>
										<ContextMenuContent>
											<ContextMenuItem>Rename</ContextMenuItem>
											<ContextMenuItem>Delete</ContextMenuItem>
											<ContextMenuItem>Move</ContextMenuItem>
										</ContextMenuContent>
									</ContextMenu>
								))}
							</ul>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
}
