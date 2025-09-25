// app/usuarios/ExcluirUsuarioSheet.tsx
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { excluirUsuario } from "@/lib/servicos/servicoUsuarios";
import { toast } from "sonner"

export default function ExcluirUsuarioSheet({
  aberto, aoMudarAberto, usuario_auth_id, onSucesso,
}: {
  aberto: boolean;
  aoMudarAberto: (v: boolean) => void;
  usuario_auth_id: string;
  onSucesso?: () => void;
}) {

  async function confirmar() {
    try {
      await excluirUsuario(usuario_auth_id);
      toast.success("Usuário excluído!")
      onSucesso?.();
      aoMudarAberto(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao excluir usuário")
    }
  }

  return (
    <Sheet open={aberto} onOpenChange={aoMudarAberto}>
      <SheetContent className="bg-sidebar w-[480px] sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>Excluir usuário</SheetTitle>
          <SheetDescription>Tem certeza? Esta ação é irreversível.</SheetDescription>
        </SheetHeader>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => aoMudarAberto(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={confirmar}>Excluir</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
