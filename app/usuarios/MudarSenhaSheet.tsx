// app/usuarios/MudarSenhaSheet.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import { mudarSenhaUsuario } from "@/lib/servicos/servicoUsuarios";

const esquema = z.object({
  usuario_auth_id: z.string().uuid(),
  nova_senha: z.string().min(6).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/),
});

type Dados = z.infer<typeof esquema>;

export default function MudarSenhaSheet({
  aberto, aoMudarAberto, usuario_auth_id, onSucesso,
}: {
  aberto: boolean;
  aoMudarAberto: (v: boolean) => void;
  usuario_auth_id: string;
  onSucesso?: () => void;
}) {
  const form = useForm<Dados>({
    resolver: zodResolver(esquema),
    defaultValues: { usuario_auth_id, nova_senha: "" },
  });

  async function onSubmit(dados: Dados) {
    try {
      await mudarSenhaUsuario(dados.usuario_auth_id, dados.nova_senha);
      toast.success("Senha alterada com sucesso!")
      onSucesso?.();
      aoMudarAberto(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao alterar senha")
    }
  }

  return (
    <Sheet open={aberto} onOpenChange={aoMudarAberto}>
      <SheetContent className="bg-sidebar w-[480px] sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>Mudar senha</SheetTitle>
          <SheetDescription>Defina uma nova senha para o usuário</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField control={form.control} name="nova_senha" render={({ field }) => (
              <FormItem>
                <FormLabel>Nova senha</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => aoMudarAberto(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
