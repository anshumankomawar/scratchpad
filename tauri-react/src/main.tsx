import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'
import { AuthProvider, useAuth } from './auth'
import "./index.css"

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    auth: undefined!, // This will be set after we wrap the app in an AuthProvider
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
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
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
