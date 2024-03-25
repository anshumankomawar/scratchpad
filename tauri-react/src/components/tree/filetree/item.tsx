import { useDocStore, useFileManager } from "@/app_state";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { HTMLAttributes, forwardRef, useEffect, useRef, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
} from "@/components/ui/context-menu";
import { BaseDirectory, rename } from "@tauri-apps/plugin-fs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteDocument, renameFile } from "@/utilities/fileutils";

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, "id"> {
	childCount?: number;
	clone?: boolean;
	collapsed?: boolean;
	depth: number;
	disableInteraction?: boolean;
	disableSelection?: boolean;
	ghost?: boolean;
	handleProps?: any;
	indicator?: boolean;
	indentationWidth: number;
	value: string;
	onCollapse?(): void;
	onRemove?(): void;
	wrapperRef?(node: HTMLLIElement): void;
	foldername: string;
}

export const Item = forwardRef<HTMLDivElement, Props>(
	(
		{
			childCount,
			clone,
			depth,
			disableSelection,
			disableInteraction,
			ghost,
			handleProps,
			indentationWidth,
			indicator,
			collapsed,
			onCollapse,
			onRemove,
			style,
			value,
			wrapperRef,
			foldername,
			...props
		},
		ref,
	) => {
		const [open, setOpen] = useState(false);
		const padding = { marginLeft: `${depth * indentationWidth}px` };
		const docStore = useDocStore((state) => state);
		const fileManager = useFileManager((state) => state);
		const [isEditing, setIsEditing] = useState(false);
		const [inputValue, setInputValue] = useState(props.file.filename);
		const [isRenaming, setIsRenaming] = useState(false);
		const [newFilename, changeNewFilename] = useState(props.file.filename);
		const editRef = useRef(null);

		const selectText = () => {
			const el = editRef.current;
			if (el && document.body.createTextRange) {
				const range = document.body.createTextRange();
				range.moveToElementText(el);
				range.select();
			} else if (window.getSelection && document.createRange) {
				const range = document.createRange();
				range.selectNodeContents(el);
				const sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			}
		};

		useEffect(() => {
			if (editRef?.current && isEditing === true) {
				editRef.current.focus();
			}
		}, [isEditing, editRef]);

		const handleBlur = () => {
			setIsEditing(false);
		};

		const handleKeyDown = async (e) => {
			if (e.key === "Enter" || e.key === "Escape") {
				e.preventDefault();
				setIsEditing(false); // Stop editing on Enter or Escape
				if (e.key === "Enter") {
					await rename(
						props.file.id,
						`${fileManager.dataPath}/${inputValue}.${props.file.filetype}`,
						{
							oldPathBaseDir: BaseDirectory.AppData,
							newPathBaseDir: BaseDirectory.AppData,
						},
					);
					await fileManager.readDir();
					await fileManager.selectFile(
						`${fileManager.dataPath}/${inputValue}.${props.file.filetype}`,
					);
				} else if (e.key === "Escape") {
					setInputValue(props.file.filename);
				}
			}
		};

		return (
			<Dialog open={isRenaming} modal={false}>
				<AlertDialog open={open} onOpenChange={setOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete "
								{props.file.filename}" and remove your data from our servers.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								className="bg-red-400 hover:bg-red-500"
								onClick={async () => {
									await deleteDocument(
										fileManager,
										props.id,
										props.file.id,
										foldername,
										docStore.getEditor(),
									);
								}}
							>
								Continue
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
				<ContextMenu>
					<ContextMenuTrigger asChild>
						<div
							className={cn(
								"list-none rounded-md py-0.5 hover:cursor-pointer",
								clone && "pointer-events-none",
								fileManager.selectedFile?.id === props.id && "bg-accent",
							)}
							//ref={wrapperRef}
							style={padding}
							{...props}
							onClick={() => {
								fileManager.selectFile(props.id);
								docStore.setEditorContent(props.file.content);
							}}
						>
							<div
								className={cn(
									"flex flex-row px-2 py-1 rounded-md justify-start items-center",
									ghost && "",
									clone && "bg-accent",
								)}
								//ref={ref}
								style={style}
								{...handleProps}
							>
								{/*<Inbox className="flex-none w-6 h-4 pr-1 stroke-dull_black dark:stroke-dull_white" />*/}
								<div className="flex flex-grow min-w-0 pr-4">
									<div className="w-full text-ellipsis text-xs overflow-hidden truncate font-medium flex-grow hover:cursor-pointer text-left text-dull_black dark:text-dull_white">
										{value}
									</div>
								</div>
								<div className="flex-grow"></div>
								<div className="flex-none text-xs text-neutral-300 dark:text-neutral-400">
									{props.file.filetype}
								</div>
							</div>
						</div>
					</ContextMenuTrigger>
					<ContextMenuContent>
						<ContextMenuItem
							className="cursor-pointer"
							onClick={() => setIsRenaming(true)}
						>
							Rename File
						</ContextMenuItem>
						<ContextMenuItem
							className="cursor-pointer"
							onSelect={async () => {
								setOpen(true);
								//await deleteDocument(
								//fileManager,
								//props.id,
								//props.file.id,
								//foldername,
								//docStore.getEditor(),
								//);
							}}
						>
							Delete File
						</ContextMenuItem>
					</ContextMenuContent>
				</ContextMenu>
				<DialogContent
					className="bg-white dark:bg-dark2 w-1/3 p-4 rounded-md shadow-md"
					onPointerDownOutside={() => setIsRenaming(false)}
				>
					<div className="flex w-full max-w-sm items-center space-x-2">
						<Input
							autoFocus
							className="border-none"
							type="email"
							placeholder={props.file.filename}
							onChange={(e) => {
								changeNewFilename(e.target.value);
							}}
							onKeyDown={async (e) => {
								if (e.key === "Enter") {
									await renameFile(
										fileManager,
										props.file.id,
										newFilename,
										props.file.filetype,
										foldername,
									);
									setIsRenaming(false);
								} else if (e.key === "Escape") {
									setIsRenaming(false);
								}
							}}
						/>
						<Button
							className="bg-alabaster dark:bg-dark1 shadow-none border text-dull_black dark:text-dull_white hover:bg-accent"
							type="submit"
							onClick={async () => {
								await renameFile(
									fileManager,
									props.file.id,
									newFilename,
									props.file.filetype,
									foldername,
								);
								setIsRenaming(false);
							}}
						>
							rename
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		);
	},
);
