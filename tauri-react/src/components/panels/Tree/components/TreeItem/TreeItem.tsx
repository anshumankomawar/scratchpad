import classNames from "classnames";
import React, { forwardRef, HTMLAttributes } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Action, Handle, Remove } from "../../../components";
import styles from "./TreeItem.module.css";
import { Panel, useDocStore, usePanelStore } from "@/app_state";

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
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
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
			...props
		},
		ref,
	) => {
		const padding = { marginLeft: `${depth * indentationWidth}px` };
		const docStore = useDocStore((state) => state);
		return (
			<li
				className={cn(
					"list-none hover:bg-accent rounded-md",
					clone && "pl-5 pt-5 pointer-events-none",
				)}
				ref={wrapperRef}
				style={padding}
				{...props}
				onClick={() => {
					console.log("clicked");
					if (props.file !== null) {
						console.log("file");
						props.editor.commands.setContent(props.file.content);
						docStore.updateDoc(props.file);
						docStore.updateTabs(props.file);
					} else {
						console.log("folder");
						onCollapse();
					}
				}}
			>
				<div
					className={cn(
						"flex flex-row px-2 py-1 rounded-md justify-center items-center",
						ghost && "bg-accent ",
						clone && "bg-transparent border-none",
					)}
					ref={ref}
					style={style}
					{...handleProps}
				>
					{/*<Handle {...handleProps} />*/}
					{childCount > 0 && (
						<div className="hover:cursor-pointer">
							{collapsed ? (
								<ChevronRight size={12} strokeWidth={2} />
							) : (
								<ChevronDown size={12} strokeWidth={2} />
							)}
						</div>
					)}
					<div className="flex-grow pb-0.5 pl-1 rounded-md text-ellipsis text-xs overflow-hidden truncate hover:cursor-pointer">
						{value}
					</div>
				</div>
			</li>
		);
	},
);
