import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { useCookies } from 'react-cookie';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { routeTree } from './routeTree.gen'
import { AuthProvider, useAuth } from './auth'
import "./index.css"

// Set up a Router instance
const queryClient = new QueryClient()
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  context: {
    auth: undefined!, // This will be set after we wrap the app in an AuthProvider
    cookies: undefined!,
    queryClient: queryClient
  },
})

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const auth = useAuth()
  const [cookies] = useCookies(["active_session"])
  return <RouterProvider router={router} context={{ auth, cookies }} />
}

function App() {
  return (
    <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <InnerApp />
        </QueryClientProvider>
    </AuthProvider>
  )
}

const rootElement = document.getElementById('root')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <div className="h-full w-full">
      <div className="fixed top-0 w-full h-8 bg-transparent z-10" data-tauri-drag-region/>
      <App />
    </div>
  )
}
