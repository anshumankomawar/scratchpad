import { Link, Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClient, useMutation } from '@tanstack/react-query'
import { type AuthContext } from '../auth'
import { useCookies } from 'react-cookie'
import { useState } from 'react'
import LoginComponent from '@/components/login/login'
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from '@/components/ui/toast'
import axios from 'axios'

interface MyRouterContext {
  auth: AuthContext
  cookies: any, 
  queryClient: QueryClient
}

export type LoginType = {
  access_token: string
  token_type: string
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const [cookies] = useCookies(['active_session'])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        const headers = {
          'Access-Control-Allow-Origin': 'http://localhost:8000',
          'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS'
        }
        const r = await axios
          .postForm<LoginType>("http://localhost:8000/login", {
            username: email,
            password: password 
          }, {
            headers: headers,
            withCredentials: true,
          })
        console.log(r)
        console.log(r.data)
        console.log(document.cookie)

        console.log(cookies.active_session)
        return r.data
      } catch (err: any) {
        console.log(err);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: err.code,
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        })
      }
    },
  })

  const handleLogin = async () => {
    setIsSubmitting(true)
    mutation.mutate()
    setIsSubmitting(false)
  }

  return (
      <>
    {cookies.active_session === 1 ? (
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
      </>
    ) : (
        <LoginComponent
          handleLogin={handleLogin}
          isSubmitting={isSubmitting}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />
    )}
      <Toaster/>
      </>
  )
}
