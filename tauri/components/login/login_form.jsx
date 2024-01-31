"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Link from "next/link"
import { setCookie, getCookies, getCookie } from 'cookies-next';
import { redirect, useRouter } from 'next/navigation'
import { getUser, authorizedFetch } from "@/lib/api_helpers"

export function LoginForm() {

  const router = useRouter()

  const handleSubmit = async () => {
    let formData = new FormData();
    formData.append('username', 'noah@gmail.com');
    formData.append('password', '123');
    const res = await fetch('http://localhost:8000/login', {
      method: 'POST',
      body: formData,
      cache: 'no-store'
    })
    const tokenData = await res.json();
    setCookie('token', tokenData.access_token);
    router.push("/home")
    const data = await authorizedFetch(getUser)
    if (!data) {
      router.push("/")
    }
  };

  return (
    <Tabs defaultValue="login" className="w-3/5">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            {/* <CardDescription>
              Login into your account and get scratchin
            </CardDescription> */}
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="Email" placeholder="Email" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="Password" placeholder="Password" />
            </div>
          </CardContent>
          <CardFooter>
          <Button onClick={() => handleSubmit()}>
              Login
              {/* <Link className={buttonVariants({variant: 'outline'})} href="/home">Get Scratchin</Link> */}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            {/* <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription> */}
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="fullname">Full Name</Label>
              <Input id="fullname" type="fullname" placeholder="Full Name"/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Email"/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Password"/>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => submitForm()}>
              Signup
              {/* <Link className={buttonVariants({variant: 'outline'})} href="/home">Get Scratchin</Link> */}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
