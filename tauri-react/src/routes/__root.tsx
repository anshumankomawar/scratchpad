import { Outlet, createRootRouteWithContext, useRouter } from '@tanstack/react-router'
import { QueryClient, useMutation } from '@tanstack/react-query'
import { type StoreContext } from '../auth'
import { useState } from 'react'
import LoginComponent from '@/components/login/login'
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from '@/components/ui/toast'
import { invoke } from '@tauri-apps/api/core'
import {
  LayoutDashboard,
  FileSearch,
  NotebookPen
} from "lucide-react"
import { SidebarNav } from '@/components/nav/nav'
import RightPanel from '@/components/panels/rightpanel'
import Header from '@/components/header/header'
import TiptapControls from '@/components/tiptap/tiptap_controls'
import { useTipTapEditor } from '@/tiptap_context'
import LeftPanel from '@/components/panels/leftpanel'

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
  loader: async ({ context }) => {
    const token = await context.auth.store.get("token")
    return { token }
  },
  component: () => {
    const { token } = Route.useLoaderData<LoaderData>();
    if (token !== null)
      return <ProtectedRoute2 />
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
      <Toaster />
    </>
  )
}

const sidebarItems = [
  {
    title: "Home",
    label: "",
    icon: NotebookPen,
    href: "/",
    variant: "default",
  },
  {
    title: "Search",
    label: "",
    icon: FileSearch,
    href: "/search",
    variant: "ghost",
  },
  {
    title: "Dashboard",
    label: "",
    icon: LayoutDashboard,
    href: "/dashboard",
    variant: "ghost",
  }
]

function RightPanelContent() {
  const tiptap = useTipTapEditor();

  return (
    <TiptapControls editor={tiptap.editor}/>
  )
}

function LeftPanelContent() {
  return (
    <SidebarNav
      isCollapsed={false}
      items={sidebarItems}
    >
    </SidebarNav>
  )
}

function ProtectedRoute2() {
  return (
    <div className='h-full w-full'>
      <div className="pt-6">
        <Outlet />
      </div>
    </div>

  )
}

function ProtectedRoute() {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false)

  return (
    <div className='h-full w-full'>
      <Header isRightPanelOpen={isRightPanelOpen} setIsRightPanelOpen={setIsRightPanelOpen} isLeftPanelOpen={isLeftPanelOpen} setIsLeftPanelOpen={setIsLeftPanelOpen}/>
      <div className="pt-11 w-full h-full flex flex-row">
        <LeftPanel isLeftPanelOpen={isLeftPanelOpen} children={LeftPanelContent()}/>
        <div className="overflow-x-scroll w-full h-full">
              <div className="px-4 h-full">
                <Outlet />
              </div>
          <Toaster />
        </div>
        <RightPanel isRightPanelOpen={isRightPanelOpen} children={RightPanelContent()}/>
      </div>
    </div>
  )
}
