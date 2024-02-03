import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"


export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div>HOME</div>
  )
}
