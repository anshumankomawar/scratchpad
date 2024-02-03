import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { StoreProvider, useStore } from './auth'
import "./index.css"

const queryClient = new QueryClient()
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  context: {
    auth: undefined!, 
    queryClient: queryClient,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const auth = useStore()
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  return (
    <StoreProvider>
        <QueryClientProvider client={queryClient}>
          <InnerApp />
        </QueryClientProvider>
    </StoreProvider>
  )
}

const rootElement = document.getElementById('root')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <div className="h-screen w-full">
      <div className="fixed top-0 w-full h-8 bg-transparent z-10" data-tauri-drag-region/>
      <App />
    </div>
  )
}
