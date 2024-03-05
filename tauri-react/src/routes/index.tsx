import { Panel, useDocStore, usePanelStore } from "@/app_state";
import CommandPanel from "@/components/command/command";
import BottomPanel from "@/components/panels/bottompanel";
import RightFloatingPanel from "@/components/panels/rightfloatingpanel";
import { LeftPanel } from "@/components/panels/leftpanel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTipTapEditor } from "@/context/tiptap_context";
import "@/index.css";
import { cn } from "@/lib/utils";
import "@/tiptap.scss";
import { createFileRoute } from "@tanstack/react-router";
import { EditorContent } from "@tiptap/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DropZone } from "@/components/filetree/dropzone";
import { SortableTree } from "@/components/filetree/SortableTree";
import {
	DndContext,
	DragEndEvent,
	DragMoveEvent,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	DropAnimation,
	KeyboardSensor,
	MeasuringStrategy,
	PointerSensor,
	SensorContext,
	UniqueIdentifier,
	closestCenter,
	pointerWithin,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { sortableTreeKeyboardCoordinates } from "@/components/filetree/keyboardCoordinates";
import {
	buildTree,
	flattenTree,
	getProjection,
	removeChildrenOf,
	setProperty,
} from "@/components/filetree/utilities";
import { arrayMove } from "@dnd-kit/sortable";
import { useDocuments } from "@/fetch/documents";
import { createPortal } from "react-dom";
import { SortableTreeItem } from "@/components/filetree/node/SortableTreeItem";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

const measuring = {
	droppable: {
		strategy: MeasuringStrategy.Always,
	},
};

function HomeComponent() {
	const tiptap = useTipTapEditor();
	const panel = usePanelStore((state) => state);

	useEffect(() => {
		function handleKeyUp(event) {
			if (event.key === "ArrowLeft" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				panel.togglePanel(Panel.LEFT);
			} else if (
				event.key === "ArrowRight" &&
				(event.metaKey || event.ctrlKey)
			) {
				event.preventDefault();
				panel.togglePanel(Panel.RIGHT);
			} else if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				panel.togglePanel(Panel.COMMAND);
			} else if (event.key === "Escape") {
				event.preventDefault();
				panel.setPanel(Panel.COMMAND, false);
			}
		}

		document.addEventListener("keyup", handleKeyUp);
		return () => document.removeEventListener("keyup", handleKeyUp);
	}, []);

	if (!tiptap.editor) {
		return <div>Loading...</div>;
	}

	const { data } = useDocuments();
	const docStore = useDocStore((state) => state);
	const [items, setItems] = useState(() => []);
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
	const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
	const [offsetLeft, setOffsetLeft] = useState(0);
	const [currentPosition, setCurrentPosition] = useState<{
		parentId: UniqueIdentifier | null;
		overId: UniqueIdentifier;
	} | null>(null);
	const indicator = false;
	const indentationWidth = 20;

	useEffect(() => {
		if (data) {
			const newItems = Object.entries(data).map(([folderName, files]) => ({
				id: folderName,
				children: files.map((file) => ({
					id: file.filename,
					children: [],
					file: file,
				})),
				file: null,
			}));
			setItems(newItems);
		}
	}, [data]);

	const flattenedItems = useMemo(() => {
		const flattenedTree = flattenTree(items);
		const collapsedItems = flattenedTree.reduce<string[]>(
			(acc, { children, collapsed, id, file }) =>
				collapsed && children.length ? [...acc, id, file] : acc,
			[],
		);

		return removeChildrenOf(
			flattenedTree,
			activeId ? [activeId, ...collapsedItems] : collapsedItems,
		);
	}, [activeId, items]);

	const projected =
		activeId && overId
			? getProjection(
					flattenedItems,
					activeId,
					overId,
					offsetLeft,
					indentationWidth,
			  )
			: null;

	const sensorContext: SensorContext = useRef({
		items: flattenedItems,
		offset: offsetLeft,
	});
	const [coordinateGetter] = useState(() =>
		sortableTreeKeyboardCoordinates(sensorContext, indicator, indentationWidth),
	);
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				delay: 200,
				tolerance: 10,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter,
		}),
	);

	const sortedIds = useMemo(
		() => flattenedItems.map(({ id }) => id),
		[flattenedItems],
	);
	const activeItem = activeId
		? flattenedItems.find(({ id }) => id === activeId)
		: null;

	useEffect(() => {
		sensorContext.current = {
			items: flattenedItems,
			offset: offsetLeft,
		};
	}, [flattenedItems, offsetLeft]);

	function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
		setActiveId(activeId);
		setOverId(activeId);

		const activeItem = flattenedItems.find(({ id }) => id === activeId);

		if (activeItem) {
			setCurrentPosition({
				parentId: activeItem.parentId,
				overId: activeId,
			});
		}

		document.body.style.setProperty("cursor", "grabbing");
	}

	function handleDragMove({ delta, over }: DragMoveEvent) {
		if (over?.id !== "editor") {
			setOffsetLeft(delta.x);
		}
	}

	function handleDragOver({ delta, over }: DragOverEvent) {
		if (over?.id === "editor") {
			setOverId(activeId);
		} else {
			setOverId(over?.id ?? null);
		}
	}

	function findParentWithNullFile(tree, id, parent = null) {
		for (const node of tree) {
			if (node.id === id) {
				return node.file === null
					? node.id
					: parent?.file === null
					  ? parent.id
					  : null;
			}
			if (node.children) {
				const foundParentId = findParentWithNullFile(node.children, id, node);
				if (foundParentId) return foundParentId;
			}
		}
		return null;
	}

	function handleDragEnd({ active, over }: DragEndEvent) {
		resetState();

		if (projected && over?.id === "editor") {
			const file = flattenedItems.find(({ id }) => id === active.id);
			docStore.updateDoc(file.file);
			docStore.updateTabs(file.file);
			tiptap.editor?.commands.setContent(file.file.content);
			tiptap.editor?.commands.focus("start");
			return;
		}

		if (projected && over) {
			const { depth, parentId } = projected;
			const clonedItems: FlattenedItem[] = JSON.parse(
				JSON.stringify(flattenTree(items)),
			);
			const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
			const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
			const activeTreeItem = clonedItems[activeIndex];

			clonedItems[activeIndex] = {
				...activeTreeItem,
				depth,
				parentId: findParentWithNullFile(clonedItems, parentId),
			};

			const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
			const newItems = buildTree(sortedItems);

			setItems(newItems);
		}
	}

	function handleDragCancel() {
		resetState();
	}

	function resetState() {
		setOverId(null);
		setActiveId(null);
		setOffsetLeft(0);
		setCurrentPosition(null);

		document.body.style.setProperty("cursor", "");
	}

	function handleRemove(id: UniqueIdentifier) {
		setItems((items) => removeItem(items, id));
	}

	function handleCollapse(id: UniqueIdentifier) {
		setItems((items) =>
			setProperty(items, id, "collapsed", (value) => {
				return !value;
			}),
		);
	}

	function tree() {
		return (
			<SortableTree
				collapsible
				indicator
				removable
				sortedIds={sortedIds}
				handleCollapse={handleCollapse}
				handleRemove={handleRemove}
				projected={projected}
				flattenedItems={flattenedItems}
				activeId={activeId}
			/>
		);
	}

	const dropAnimationConfig: DropAnimation = {
		keyframes({ transform }) {
			return [
				{ opacity: 1, transform: CSS.Transform.toString(transform.initial) },
				{ opacity: 0, transform: CSS.Transform.toString(transform.initial) }, // Keep the position same as initial
			];
		},
		easing: "ease-out",
		// Removed the sideEffects function since you want to eliminate the additional animation
	};

	return (
		<Dialog open={panel.center} onOpenChange={panel.changeCenter}>
			<div className="relative w-full h-full px-4 pb-4 items-center justify-center">
				<RightFloatingPanel editor={tiptap.editor} />
				<CommandPanel editor={tiptap.editor} />
				<DndContext
					sensors={sensors}
					collisionDetection={pointerWithin}
					onDragStart={handleDragStart}
					onDragMove={handleDragMove}
					onDragOver={handleDragOver}
					onDragEnd={handleDragEnd}
					onDragCancel={handleDragCancel}
				>
					<div className="w-full h-full">
						<div className="absolute left-0 top-0 w-[200px] h-full overflow-y-auto bg-alabaster dark:bg-dark2">
							<LeftPanel editor={tiptap.editor} child={tree()} />
						</div>
						<DropZone id="editor">
							<EditorContent
								className={cn(
									"absolute transition-[left] border-l left-[200px] right-0 z-10 bg-white dark:bg-background overflow-x-hidden no-scrollbar h-full pb-24",
									panel.left ? "left-[200px]" : "left-0",
								)}
								editor={tiptap.editor}
							/>
						</DropZone>
						{createPortal(
							<DragOverlay zIndex={100000} dropAnimation={dropAnimationConfig}>
								{activeId && activeItem ? (
									<SortableTreeItem
										id={activeId}
										depth={activeItem.depth}
										clone
										value={activeId.toString()}
										indentationWidth={0}
									/>
								) : null}
							</DragOverlay>,
							document.body,
						)}
					</div>
				</DndContext>
				<BottomPanel editor={tiptap.editor} />
			</div>
			<DialogContent className="bg-white dark:bg-background h-3/4 w-3/4">
				{panel.centerContent}
			</DialogContent>
		</Dialog>
	);
}
