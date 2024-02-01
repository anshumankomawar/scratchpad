import { Link, Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClient, useMutation } from '@tanstack/react-query'
import { type AuthContext } from '../auth'
import { useCookies } from 'react-cookie'
import axios from 'axios'
import { useState } from 'react'

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
  const [name, setName] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        const r = await axios
          .postForm<LoginType>("http://localhost:8000/login", {
            username: name,
            password: "100"
          }, {
            withCredentials: true,
          })
        return r.data
      } catch (err) {
        console.log(err)
      }
    },
  })

  const handleLogin = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
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
      <div className="p-2">
        <h3>Login page</h3>
        <form className="mt-4" onSubmit={handleLogin}>
          <fieldset
            disabled={isSubmitting}
            className="flex flex-col gap-2 max-w-sm"
          >
            <div className="flex gap-2 items-center">
              <label htmlFor="username-input" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              {isSubmitting ? 'Loading...' : 'Login'}
            </button>
          </fieldset>
        </form>
      </div>
    )}
      </>
  )
}
