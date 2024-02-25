import { useDocStore } from "@/app_state";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";

export default function SortableItem(props) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: props.id });

	const docStore = useDocStore((state) => state);

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<div
				className={cn(
					"text-xs align-center hover:bg-accent hover:text-accent-foreground rounded-md p-1.5",
					docStore.doc.filename == props.id ? "bg-accent" : "",
				)}
			>
				{props.id}
			</div>
		</div>
	);
}
