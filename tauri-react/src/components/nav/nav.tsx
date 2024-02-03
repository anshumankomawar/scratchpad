import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Link, useRouter } from "@tanstack/react-router"
import { LucideIcon } from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: LucideIcon
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {

  const router = useRouter()

  return (
    <nav
      className={cn(
        "flex flex-col p-2 text-start",
        className
      )}
      {...props}
    >
      {items.map((item) => (
            <Link
            to={item.href}
            key={item.href}
            href={item.href}
            className={cn(
                buttonVariants({ variant: item.href === router.state.location.pathname ? "default" : "ghost", size: "sm" }),
                item.href === router.state.location.pathname &&
                "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                "justify-start m-1"
            )}
            >
            <div className="flex flex-row space-between">
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
            </div>
            </Link>
      ))}
    </nav>
  )
}