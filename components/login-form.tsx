"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Logo } from "@/components/ui/logo";

// Schema de validação
const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Digite um e-mail válido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
});

// Tipo derivado do schema
type LoginFormData = z.infer<typeof loginFormSchema>;

// Interface para as props do componente
interface LoginFormProps extends Omit<React.ComponentProps<"div">, "onSubmit"> {
  onSubmit?: (data: LoginFormData) => void;
}

export function LoginForm({
  className,
  onSubmit,
  ...props
}: LoginFormProps) {
  const [greeting, setGreeting] = useState("Bom dia");

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting("Bom dia");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa tarde");
    } else {
      setGreeting("Boa noite");
    }
  }, []);

  // Form é gerenciado com react-hook-form + zod
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleFormSubmit = (data: LoginFormData) => {
    // Aqui você pode chamar sua função de login
    console.log("Dados do login:", data);
    
    // Se foi passada uma função onSubmit, chama ela
    if (onSubmit) {
      onSubmit(data);
    }
    
    // Exemplo de como você poderia fazer a autenticação
    // loginUser(data.email, data.password);
  };

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-6">
                  {/* Campo de E-mail */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Digite seu e-mail"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campo de Senha */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Digite sua senha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Entrar
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Exportar o tipo para caso seja necessário em outros lugares
export type { LoginFormData };