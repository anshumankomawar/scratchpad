import Tiptap from '@/components/tiptap/tiptap'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="h-full px-4 pb-2">
      <Tiptap /> 
    </div>
  )
}
