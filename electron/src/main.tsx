import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { useCookies } from 'react-cookie';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { routeTree } from './routeTree.gen'
import { AuthProvider, useAuth } from './auth'
import "./index.css"
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from '@tanstack/react-router'


// Set up a Router instance
const queryClient = new QueryClient()
const hashHistory = createHashHistory()

const router = createRouter({
  routeTree,
  history: hashHistory,
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

  const section = {
    "-webkit-app-region": "drag"
  };

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <div className="h-screen w-full">
        <div className="fixed top-0 w-full h-8 bg-transparent z-10" style={section}/>
        <App />
      </div>
    </React.StrictMode>,

  )

// Remove Preload scripts loading
postMessage({ payload: 'removeLoading' }, '*')

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
