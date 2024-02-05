import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
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
import { LoginComponentProps } from "./login"

export function LoginForm(props: LoginComponentProps) {
  const handleSubmit = async () => {
    props.handleLogin();
  };

  return (
    <Tabs defaultValue="login" className="w-4/6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="Email" placeholder="Email" value={props.email} 
                onChange={(e) => props.setEmail(e.target.value)} required/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="Password" placeholder="Password" value={props.password} 
                onChange={(e) => props.setPassword(e.target.value)} required/>
            </div>
          </CardContent>
          <CardFooter>
          <Button onClick={() => handleSubmit()}>
              Login
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
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
              <Input id="password" type="email" placeholder="Password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSubmit()}>
              Signup
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
