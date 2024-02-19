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

export default function LeftFloatingPanel({
	open,
	toggleLeftPanel,
	documents,
	updateEditorContent,
}) {
	async function cancelAutoFocus(event) {
		event.preventDefault();
	}

	return (
		<Sheet open={open}>
			<SheetContent
				side="left"
				className="overflow-y-auto bg-white dark:bg-stone-900 border-none drop-shadow-2xl shadow-2xl lg:w-[300px] min-w-[150px] w-[200px] pt-10"
				onOpenAutoFocus={cancelAutoFocus}
				onPointerDownOutside={() => toggleLeftPanel(!open)}
			>
				<SheetHeader>
					<SheetTitle className="flex flex-row font-virgil mb-2">
						<div>Files</div>
						<div className="flex-grow"></div>
						<div className="flex space-x-2">
							<Popover>
								<PopoverTrigger>
									<FolderPlus size={18} />
								</PopoverTrigger>
								<PopoverContent className="font-virgil">
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
								<PopoverContent className="font-virgil">
									<div className="grid gap-4 py-4">
										<div className="grid grid-cols-4 items-center gap-4">
											<Label htmlFor="name" className="text-right">
												Name
											</Label>
											<Input
												id="name"
												placeholder="File Name"
												className="col-span-3"
											/>
										</div>
										<div className="grid grid-cols-4 items-center gap-4">
											<Label htmlFor="icon" className="text-right">
												Folder
											</Label>
											<Select onValueChange={(value) => console.log(value)}>
												<SelectTrigger className="w-[180px] font-virgil">
													<SelectValue
														placeholder="select folder"
														onSelect={(value) => console.log(value)}
													/>
												</SelectTrigger>
												<SelectContent>
													{Object.entries(documents).map(
														([foldername], index) => (
															<SelectItem
																className="font-virgil"
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
										<Button type="submit">Create File</Button>
									</div>
								</PopoverContent>
							</Popover>
						</div>
					</SheetTitle>
				</SheetHeader>
				<Accordion type="multiple" collapsible>
					{Object.entries(documents).map(([foldername, files], index) => (
						<AccordionItem value={foldername} key={index}>
							<AccordionTrigger className="font-virgil space-x-2 space-y-1">
								<GraduationCap
									size={16}
									strokeWidth={1.5}
									style={{ transform: "none" }}
								/>
								<div>{foldername}</div>
								<div className="flex-grow"></div>
							</AccordionTrigger>
							<AccordionContent className="font-virgil text-xs">
								<ul className="list-disc pl-4">
									{files.map((file, index2) => (
										<li
											className="hover:cursor-pointer hover:underline hover:text-slate-700"
											key={index2}
											onClick={() => updateEditorContent(file.content)}
										>
											{file.filename}
										</li>
									))}
								</ul>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</SheetContent>
		</Sheet>
	);
}
