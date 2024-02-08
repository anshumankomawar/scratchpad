import { createFileRoute, redirect } from '@tanstack/react-router'
import { SearchPage } from '@/components/search/search'
import { useState } from 'react'

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
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    // TODO: Don't let multiple requests go through when logging in
    setIsLoading(true)
    mutation.mutate()
    setIsLoading(false)
  }
    return (
        <div className="w-full h-full pt-4">
            <SearchPage/>
        </div>
        
    )
  
}
