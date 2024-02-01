import * as React from 'react'
import { flushSync } from 'react-dom'
import {
  createFileRoute,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import axios from 'axios'


import { useAuth } from '../auth'

export type LoginType = {
  access_token: string
  token_type: string
}

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    redirect: z.string().catch('/'),
  }),
  component: LoginComponent,
})

const routeApi = getRouteApi('/login')

function LoginComponent() {
  const auth = useAuth()
  const navigate = useNavigate()

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [name, setName] = React.useState('')

  const search = routeApi.useSearch()

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
        console.log(r)
        return r.data
      } catch (err) {
        console.log(err)
      }
    },
  })

  const handleLogin = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    setIsSubmitting(true)

    // const data = mutation.mutate()
    // console.log(mutation.data)
    mutation.mutate()

    flushSync(() => {
      auth.setUser(name)
    })

    navigate({ to: "/" })
  }

  return (
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
  )
}
