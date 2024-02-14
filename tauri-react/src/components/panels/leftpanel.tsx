import { cn } from "@/lib/utils";

type LeftPanelProps = {
	isLeftPanelOpen: boolean;
	children?: React.ReactNode;
};

export default function LeftPanel({
	isLeftPanelOpen: isRightPanelOpen,
	children,
}: LeftPanelProps) {
	return (
		<div
			className={cn(
				"border-r min-w-[150px] w-1/12 transition-all duration-250 ease-in-out overflow-hidden",
				{ "min-w-0 w-0 md:w-0 lg:w-0 -translate-x-full": !isRightPanelOpen },
			)}
		>
			<div className="p-2 h-full w-full">{children}</div>
		</div>
	);
}
