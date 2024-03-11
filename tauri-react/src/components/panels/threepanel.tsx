import { usePanelStore } from "@/app_state";
import React, { useState, useEffect, useRef } from "react";

const ThreePanelLayout = ({
	minLeftPanelWidth = 200,
	minCenterPanelWidth = 200,
	children,
}) => {
	const containerRef = useRef(null);
	const panelStore = usePanelStore((state) => state);
	const [containerWidth, setContainerWidth] = useState(window.innerWidth);
	const [leftWidth, setLeftWidth] = useState(minLeftPanelWidth);
	const [centerWidth, setCenterWidth] = useState(minCenterPanelWidth);

	useEffect(() => {
		const handleResize = () => {
			setContainerWidth(containerRef.current.offsetWidth);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleDrag = (panel) => (e) => {
		e.preventDefault();
		const startX = e.clientX;

		const handleMouseMove = (moveEvent) => {
			const delta = moveEvent.clientX - startX;
			if (panel === "left") {
				const newLeftWidth = Math.min(
					Math.max(leftWidth + delta, minLeftPanelWidth),
					containerWidth / 3,
				);
				setLeftWidth(newLeftWidth);
			} else if (panel === "center") {
				const newCenterWidth = Math.min(
					Math.max(centerWidth + delta, minCenterPanelWidth),
					containerWidth / 3,
				);
				setCenterWidth(newCenterWidth);
			}
		};

		const handleMouseUp = () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	// Assuming children is an array of three elements
	const [leftChild, centerChild, rightChild] = React.Children.toArray(children);

	interface DividerProps {
		panel: string;
	}

	function Divider({ panel }: DividerProps) {
		return (
			<div
				onMouseDown={handleDrag(panel)}
				style={{
					cursor: "col-resize",
					position: "relative",
					width: "1px", // Keep the visual divider line at 1px
					height: "100%", // Ensure it fills the parent's height
					backgroundColor: "transparent", // The main divider area is transparent
				}}
			>
				<div
					style={{
						position: "absolute",
						left: "-2px", // Extend 2px to the left
						right: "-2px", // And 2px to the right
						top: 0,
						bottom: 0,
						width: "5px", // Total width including negative margins
						margin: "0 auto", // Center the clickable area
						cursor: "col-resize",
						backgroundColor: "transparent", // Keep this area transparent
					}}
				>
					<div
						className="bg-accent"
						style={{
							width: "1px",
							height: "100%",
							marginLeft: "2px", // Position the line in the middle
						}}
					/>
				</div>
			</div>
		);
	}

	// Adjusting the layout based on showAllPanels
	const layoutStyle = panelStore.left
		? { display: "flex", width: "100%", height: "100%" }
		: { display: "flex", width: "100%", height: "100%" }; // Full width and height for single panel

	return (
		<div ref={containerRef} style={layoutStyle}>
			{panelStore.left && (
				<>
					<div
						style={{
							width: `${leftWidth}px`,
							minHeight: "100%",
							overflow: "auto",
						}}
					>
						{leftChild}
					</div>
					<Divider panel={"left"} />
					<div
						className="bg-alabaster dark:bg-dark2"
						style={{
							width: `${centerWidth}px`,
							minHeight: "100%",
							overflow: "auto",
						}}
					>
						{centerChild}
					</div>
					<Divider panel={"center"} />
				</>
			)}
			<div
				style={{
					flexGrow: 1,
					width: panelStore.left
						? `${containerWidth - leftWidth - centerWidth}px`
						: "100%", // Full width if only the third panel is shown
					minHeight: "100%",
					overflow: "auto",
				}}
			>
				{rightChild}
			</div>
		</div>
	);
};

export default ThreePanelLayout;
