import { useDroppable } from "@dnd-kit/core";

export default function TabPanel(props) {
	const { isOver, setNodeRef } = useDroppable({
		id: "droppable",
	});
	const style = {
		color: isOver ? "green" : undefined,
	};

	return (
		<div className="w-full" ref={setNodeRef} style={style}>
			{props.children}
		</div>
	);
}
