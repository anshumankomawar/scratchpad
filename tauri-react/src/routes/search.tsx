import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useStore } from '../auth'
import { invoke } from '@tauri-apps/api/core'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { SearchPage } from '@/components/search/search'

export const Route = createFileRoute('/search')({
  loader: async ({ context, location }) => {
    const token = await context.auth.store.get("token")
    if (token == null) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: SearchComponent,
})

function SearchComponent() {
    return (
        <div className="w-full h-full pt-4">
            <SearchPage/>
        </div>
        
    )
  
}
