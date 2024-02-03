import { Link, Outlet, Router, createRootRouteWithContext, useRouter } from '@tanstack/react-router'
import { QueryClient, useMutation } from '@tanstack/react-query'
import { type StoreContext } from '../auth'
import { useState } from 'react'
import LoginComponent from '@/components/login/login'
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from '@/components/ui/toast'
import { invoke } from '@tauri-apps/api/tauri'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export interface MyRouterContext {
  auth: StoreContext
  queryClient: QueryClient
}

export type LoginType = {
  access_token: string
  token_type: string
}

interface LoaderData {
  token: string
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: async ({context}) => {
    const token = await context.auth.store.get("token")
    return {token}
  },
  component: () => {
    const { token } = Route.useLoaderData<LoaderData>();
    if (token !== null)
      return <ProtectedRoute />
    else
      return <PublicRoute />
  }
})

function PublicRoute() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: async () => {
      invoke("login", { username: email, password: password })
        .then((_) => {
          router.invalidate() 
          console.log("Successfully logged in!")
        })
        .catch((error) => {
          console.log(error);
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.code,
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          })
        })
    },
  })

  const handleLogin = async () => {
    // TODO: Don't let multiple requests go through when logging in
    setIsSubmitting(true)
    mutation.mutate()
    setIsSubmitting(false)
  }

  return (
      <>
        <LoginComponent
          handleLogin={handleLogin}
          isSubmitting={isSubmitting}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />
        <Toaster/>
      </>
  )
}

function ProtectedRoute() {
  return (
      <div className="pt-8 w-full h-full">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} maxSize={30}>
            <div className="px-2 flex gap-2 flex-col">
              <Link
                to="/"
                activeProps={{
                  className: 'font-bold',
                }}
                activeOptions={{ exact: true }}
              >
                Home
              </Link>{' '}
              <Link
                to="/dashboard"
                activeProps={{
                  className: 'font-bold',
                }}
                activeOptions={{ exact: true }}
              >
                Dashboard
              </Link>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <div className="px-4">
              <Outlet />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        <Toaster/>
      </div>
  )
}
