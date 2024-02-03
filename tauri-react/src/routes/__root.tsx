import { Link, Outlet, Router, createRootRouteWithContext, useRouter } from '@tanstack/react-router'
import { QueryClient, useMutation } from '@tanstack/react-query'
import { useAuth, type AuthContext } from '../auth'
import { useCookies } from 'react-cookie'
import { useState } from 'react'
import LoginComponent from '@/components/login/login'
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from '@/components/ui/toast'
import { invoke } from '@tauri-apps/api/tauri'
import { Button } from '@/components/ui/button'

export interface MyRouterContext {
  auth: AuthContext
  cookies: any,
  queryClient: QueryClient
}

export type LoginType = {
  access_token: string
  token_type: string
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: async ({context}) => {
    const token = await context.auth.store.get("token")
    return {token}
  },
  component: () => {
    const { token } = Route.useLoaderData();
    if (token !== null)
      return <Wrapper/>
    else
      return <RootComponent />
  }
})

function RootComponent() {
  const [cookies] = useCookies(['active_session'])
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

  const mutation2 = useMutation({
    mutationFn: async () => {
      invoke("check")
        .then((message) => console.log("Checking for token: ", message))
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
    setIsSubmitting(true)
    mutation.mutate()
    setIsSubmitting(false)
  }

  const extraButton = async() => {
    mutation2.mutate()
  }

  return (
      <>
          <div>
        <Button onClick={() => extraButton()}>Extra Button</Button>
        <LoginComponent
          handleLogin={handleLogin}
          isSubmitting={isSubmitting}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />
        </div>
      <Toaster/>
      </>
  )
}

function Wrapper() {
  return (
      <>
        <div className="mt-8 px-2 flex gap-2 text-lg">
          <Link
            to="/"
            activeProps={{
              className: 'font-bold',
            }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>{' '}
        </div>
        <hr />
        <Outlet />
        <Toaster/>
      </>
  )
}
