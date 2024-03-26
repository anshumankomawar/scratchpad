import { useDocStore, useFileManager } from "@/app_state";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import { HTMLAttributes, forwardRef, useState } from "react";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deleteFolder, renameFolder } from "@/utilities/fileutils";

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, "id"> {
	childCount?: number;
	id: any;
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
		const [isRenaming, setIsRenaming] = useState(false);
		const [newFoldername, changeNewFoldername] = useState(foldername);
		const fileManager = useFileManager((state) => state);

		return (
			<Dialog open={isRenaming} modal={false}>
				<AlertDialog open={open} onOpenChange={setOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete "
								{foldername}" and remove your data from our servers.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								className="bg-red-400 hover:bg-red-500"
								onClick={async () => {
									await deleteFolder(
										fileManager,
										`${fileManager.dataPath}/${foldername}`,
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
								"list-none rounded-md py-0.5",
								clone && "pointer-events-none",
								fileManager.selectedFolder === foldername && "bg-accent",
							)}
							ref={wrapperRef}
							style={padding}
							{...props}
							onClick={() => {
								fileManager.selectFolder(foldername);
								//docStore.updateFolder(props.id, foldername);
							}}
						>
							<div
								className={cn(
									"flex flex-row px-2 py-1 rounded-md justify-start items-center",
									ghost && "",
									clone && "bg-accent",
								)}
								ref={ref}
								style={style}
								{...handleProps}
							>
								<Inbox className="flex-none w-6 h-4 pr-1 stroke-dull_black dark:stroke-dull_white" />
								{/*<div className="text-xs pr-2">📝</div>*/}
								<div className="flex flex-grow min-w-0 pr-4">
									<div className="rounded-md text-ellipsis text-xs overflow-hidden truncate font-medium flex-grow hover:cursor-pointer text-left text-dull_black dark:text-dull_white">
										{" "}
										{foldername}
									</div>
								</div>
								<div className="flex-grow"></div>
								<div className="flex-none text-xs w-4 text-end text-dull_black dark:text-dull_white">
									{childCount}
								</div>
							</div>
						</div>
					</ContextMenuTrigger>
					<ContextMenuContent>
						<ContextMenuItem
							className="cursor-pointer"
							onSelect={() => setIsRenaming(true)}
						>
							Edit Folder
						</ContextMenuItem>
						<ContextMenuItem
							className="cursor-pointer"
							onSelect={async () => setOpen(true)}
						>
							Delete Folder
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
							placeholder={foldername}
							onChange={(e) => {
								changeNewFoldername(e.target.value);
							}}
							onKeyDown={async (e) => {
								if (e.key === "Enter") {
									await renameFolder(
										fileManager,
										`${fileManager.dataPath}/${foldername}`,
										`${fileManager.dataPath}/${newFoldername}`,
										newFoldername,
									);
									setIsRenaming(false);
								}
							}}
						/>
						<Button
							className="bg-alabaster dark:bg-dark1 shadow-none border text-dull_black dark:text-dull_white hover:bg-accent"
							type="submit"
							onClick={async () => {
								await renameFolder(
									fileManager,
									`${fileManager.dataPath}/${foldername}`,
									`${fileManager.dataPath}/${newFoldername}`,
									newFoldername,
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
