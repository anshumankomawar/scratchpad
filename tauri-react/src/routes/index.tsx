import Tiptap from '@/components/tiptap/tiptap'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="h-full py-2 px-4">
      <Tiptap /> 
    </div>
  )
}
