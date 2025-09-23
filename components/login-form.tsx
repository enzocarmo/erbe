"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { Logo } from "@/components/ui/logo"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [greeting, setGreeting] = useState("Bom dia")

  useEffect(() => {
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 12) {
      setGreeting("Bom dia")
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa tarde")
    } else {
      setGreeting("Boa noite")
    }
  }, [])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <Logo type="logo" width={170} />
        </a>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{greeting}, acesse sua conta</CardTitle>
          <CardDescription>
            Digite seu endereço de e-mail e senha para fazer login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="E-mail"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Senha</Label>
                  </div>
                  <Input id="password" type="password" placeholder="Senha" required />
                </div>
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}