import { useDocStore } from "@/app_state";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import { HTMLAttributes, forwardRef } from "react";

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
		const padding = { marginLeft: `${depth * indentationWidth}px` };
		const docStore = useDocStore((state) => state);
		return (
			<div
				className={cn(
					"list-none rounded-md pb-0.5 py-0.5",
					clone && "pointer-events-none",
					docStore.doc.filename === props.id && "bg-accent",
				)}
				ref={wrapperRef}
				style={padding}
				{...props}
				onClick={() => {
					props.editor.commands.setContent(props.file.content);
					docStore.updateDoc({ ...props.file, foldername: foldername });
					//docStore.updateTabs(props.file);
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
					{/*<Inbox className="flex-none w-6 h-4 pr-1 stroke-dull_black dark:stroke-dull_white" />*/}
					<div className="flex flex-grow min-w-0 pr-4">
						<div className="rounded-md text-ellipsis text-xs overflow-hidden truncate font-medium flex-grow hover:cursor-pointer text-left text-dull_black dark:text-dull_white">
							{value}
						</div>
					</div>
					<div className="flex-grow"></div>
					<div className="flex-none text-xs w-4 text-end text-gray-300 dark:text-gray-500">
						.txt
					</div>
				</div>
			</div>
		);
	},
);
