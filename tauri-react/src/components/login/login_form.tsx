import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoginComponentProps } from "./login"

export function LoginForm(props: LoginComponentProps) {
  const handleSubmit = async () => {
    props.handleLogin();
  };

  return (
    <div className = "font-virgil">
      <div className="space-y-4 w-full items-center">
          <Input id="email" type="Email" placeholder="Email" value={props.email} 
          onChange={(e) => props.setEmail(e.target.value)} required/>
          <Input id="password" type="Password" placeholder="Password" value={props.password} 
          onChange={(e) => props.setPassword(e.target.value)} required/>
        <div className="w-full items-center justify-center flex pt-2"> 
          <Button className="font-virgil w-[80px] h-[24px]" onClick={() => handleSubmit()}>Login</Button>
        </div>
      </div>

    </div>

    // <Tabs defaultValue="login" className="w-4/6">
    //   <TabsList className="grid w-full grid-cols-2">
    //     <TabsTrigger value="login">Login</TabsTrigger>
    //     <TabsTrigger value="signup">Sign Up</TabsTrigger>
    //   </TabsList>
    //   <TabsContent value="login">
    //     <Card>
    //       <CardHeader>
    //         <CardTitle className="font-virgil">Login</CardTitle>
    //       </CardHeader>
    //       <CardContent className="space-y-2">
    //         <div className="space-y-1">
    //           <Label className="font-virgil" htmlFor="email">Email</Label>
    //           <Input id="email" type="Email" placeholder="Email" value={props.email} 
    //             onChange={(e) => props.setEmail(e.target.value)} required/>
    //         </div>
    //         <div className="space-y-1">
    //           <Label className="font-virgil" htmlFor="password">Password</Label>
    //           <Input id="password" type="Password" placeholder="Password" value={props.password} 
    //             onChange={(e) => props.setPassword(e.target.value)} required/>
    //         </div>
    //       </CardContent>
    //       <CardFooter>
    //       <Button className="font-virgil" onClick={() => handleSubmit()}>
    //           Login
    //         </Button>
    //       </CardFooter>
    //     </Card>
    //   </TabsContent>
    //   <TabsContent value="signup">
    //     <Card>
    //       <CardHeader>
    //         <CardTitle className="font-virgil">Sign Up</CardTitle>
    //       </CardHeader>
    //       <CardContent className="space-y-2">
    //         <div className="space-y-1">
    //           <Label className="font-virgil" htmlFor="fullname">Full Name</Label>
    //           <Input id="fullname" type="fullname" placeholder="Full Name"/>
    //         </div>
    //         <div className="space-y-1">
    //           <Label className="font-virgil" htmlFor="email">Email</Label>
    //           <Input id="email" type="email" placeholder="Email"/>
    //         </div>
    //         <div className="space-y-1">
    //           <Label className="font-virgil" htmlFor="password">Password</Label>
    //           <Input id="password" type="email" placeholder="Password" />
    //         </div>
    //       </CardContent>
    //       <CardFooter>
    //         <Button onClick={() => handleSubmit()}>
    //           Signup
    //         </Button>
    //       </CardFooter>
    //     </Card>
    //   </TabsContent>
    // </Tabs>
  )
}
