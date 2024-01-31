import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"

import { useAuth } from '../auth'
import "../styles.css"
export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  const auth = useAuth()
  return (
    <div className="p-2 bg-white w-screen h-screen">
      <h3>Welcome Home!</h3>
      <Button>Click me</Button>
      <p>
        <Link to="/dashboard" className="font-semibold">
          {auth.isAuthenticated ? 'Go' : 'Try going'} to the dashboard page
        </Link>
      </p>
    </div>
  )
}