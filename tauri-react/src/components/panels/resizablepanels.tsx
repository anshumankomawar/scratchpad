import { useState } from "react";

export function ResizablePanel({
	initialWidth,
	onResize,
	colorleft,
	colorright,
	children,
	minSize = 50,
	maxSize,
}) {
	const [width, setWidth] = useState(initialWidth);

	const handleMouseDown = (event) => {
		event.preventDefault();
		const startX = event.clientX;

		const handleMouseMove = (moveEvent) => {
			const currentX = moveEvent.clientX;
			const delta = currentX - startX;
			const newWidth = Math.min(Math.max(width + delta, minSize), maxSize);
			setWidth(newWidth);
			if (onResize) {
				onResize(newWidth);
			}
		};

		const handleMouseUp = () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	return (
		<div className={`relative ${colorleft}`} style={{ width: `${width}px` }}>
			{/* Ensure children are constrained and do not overflow */}
			<div className="flex-1 overflow-hidden">{children}</div>
			{/* Use absolute positioning for the resize handle within the parent */}
			<div
				className="absolute right-0 top-0 bottom-0 flex cursor-col-resize"
				style={{ width: "10px" }} // Explicitly set a width for the resize handle
			>
				<div
					onMouseDown={handleMouseDown}
					className="fixed flex cursor-col-resize"
				>
					<div className={`w-1 ${colorleft}`}></div>
					<div className="w-px bg-accent"></div>
					<div className={`w-1 ${colorright}`}></div>
				</div>
			</div>
		</div>
	);
}
