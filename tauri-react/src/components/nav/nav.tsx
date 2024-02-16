import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
	isCollapsed: boolean;
	items: {
		href: string;
		title: string;
		icon: LucideIcon;
	}[];
}

export function SidebarNav({
	className,
	items,
	isCollapsed,
	...props
}: SidebarNavProps) {
	const router = useRouter();

	return (
		<div data-collapsed={isCollapsed}>
			<nav
				className={cn("flex flex-col p-2 text-start space-y-1", className)}
				{...props}
			>
				{items.map((item) =>
					isCollapsed ? (
						<Link
							to={item.href}
							key={item.href}
							href={item.href}
							className={cn(
								buttonVariants({
									variant:
										item.href === router.state.location.pathname
											? "default"
											: "ghost",
									size: "sm",
								}),
								item.href === router.state.location.pathname &&
									"dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
							)}
						>
							<item.icon className="h-4 w-4" />
						</Link>
					) : (
						<Link
							to={item.href}
							key={item.href}
							href={item.href}
							className={cn(
								buttonVariants({
									variant:
										item.href === router.state.location.pathname
											? "default"
											: "ghost",
									size: "sm",
								}),
								item.href === router.state.location.pathname &&
									"dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
								"justify-start",
							)}
						>
							<div className="flex flex-row space-between">
								<item.icon className="mr-2 h-4 w-4" />
								{item.title}
							</div>
						</Link>
					),
				)}
			</nav>
		</div>
	);
}
