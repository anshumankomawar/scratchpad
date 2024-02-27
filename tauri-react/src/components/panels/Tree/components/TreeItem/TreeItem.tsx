import React, { forwardRef, HTMLAttributes } from "react";
import classNames from "classnames";

import { Action, Handle, Remove } from "../../../components";
import styles from "./TreeItem.module.css";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
		const padding = { paddingLeft: `${depth * indentationWidth}px` };
		return (
			<li
				className={cn("list-none", clone && "pl-5 pt-5 pointer-events-none")}
				ref={wrapperRef}
				style={padding}
				{...props}
			>
				<div
					className={cn(
						"flex flex-row px-2 py-1 rounded-md",
						ghost && "bg-accent bg-accent",
						clone && "bg-transparent border-none",
					)}
					ref={ref}
					style={style}
				>
					<Handle {...handleProps} />
					<Button variant="ghost" onClick={onCollapse} className="size-6 p-1">
						{collapsed ? <ChevronRight /> : <ChevronDown />}
					</Button>
					<div className="flex-grow pb-0.5 pl-0.5 text-ellipsis text-sm overflow-hidden truncate">
						{value}
					</div>
				</div>
			</li>
		);
	},
);
