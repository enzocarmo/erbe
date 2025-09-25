"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multiselect";
import { useDepartamentos } from "@/hooks/useDepartamentos";
import { useLojas } from "@/hooks/useLojas";
import { useRelatorios } from "@/hooks/useRelatorios";
import { editarUsuario } from "@/lib/servicos/servicoUsuarios";
import { toast } from "sonner";

const esquema = z.object({
  usuario_auth_id: z.string().uuid(),
  nome: z.string().min(1),
  email: z.string().email(),
  departamentos: z.array(z.string()),
  lojas: z.array(z.string()),
  relatorios: z.array(z.string()),
  permissoes: z.array(z.string()).optional(),
  foto_perfil: z.instanceof(File).optional(),     // upload novo
  foto_perfil_url: z.string().url().optional(),   // url já existente
});

type DadosForm = z.infer<typeof esquema>;

export default function EditarUsuarioSheet({
  aberto,
  aoMudarAberto,
  dadosIniciais,
  onSucesso,
}: {
  aberto: boolean;
  aoMudarAberto: (v: boolean) => void;
  dadosIniciais: {
    usuario_auth_id: string;
    nome: string;
    email: string;
    departamentos: string[];
    lojas: string[];
    relatorios: string[];
    permissoes: string[];
    foto_perfil?: string | null;
  };
  onSucesso?: () => void;
}) {
  const { departamentos } = useDepartamentos();
  const { lojas } = useLojas();
  const { relatorios } = useRelatorios();

  const form = useForm<DadosForm>({
    resolver: zodResolver(esquema),
    defaultValues: {
      usuario_auth_id: dadosIniciais.usuario_auth_id,
      nome: dadosIniciais.nome,
      email: dadosIniciais.email,
      departamentos: dadosIniciais.departamentos ?? [],
      lojas: dadosIniciais.lojas ?? [],
      relatorios: dadosIniciais.relatorios ?? [],
      permissoes: dadosIniciais.permissoes ?? [],
      foto_perfil_url: dadosIniciais.foto_perfil ?? undefined,
    },
  });

  const departamentosOptions = departamentos.map((d) => ({
    value: d.codigo,
    label: `${d.descricao} - ${d.codigo}`,
  }));

  const lojasOptions = lojas.map((l) => ({
    value: l.Codigo,
    label: l.Codigo,
  }));

  const relatoriosOptions = relatorios.map((r) => ({
    value: r.id,
    label: r.nome,
  }));

  async function onSubmit(dados: DadosForm) {
  try {
    let fotoUrl = dados.foto_perfil_url;

    const payloadBase = {
      usuario_auth_id: dados.usuario_auth_id,
      nome: dados.nome,
      email: dados.email,
      departamentos: dados.departamentos.map((codigo) => {
        const d = departamentos.find((x) => x.codigo === codigo);
        return { departamento_codigo: codigo, departamento_nome: d?.descricao ?? "" };
      }),
      lojas: dados.lojas.map((codigo) => {
        const l = lojas.find((x) => x.Codigo === codigo);
        return { loja_codigo: codigo, loja_municipio: l?.Municipio ?? null };
      }),
      permissoes: dados.permissoes ?? [],
      relatorios: dados.relatorios,
    } as const;

    const payload = fotoUrl
      ? { ...payloadBase, foto_perfil_url: fotoUrl }
      : payloadBase;

    await editarUsuario(payload);

    toast.success("Usuário atualizado com sucesso!");
    onSucesso?.();
    aoMudarAberto(false);
  } catch (e: any) {
    toast.error(e?.message ?? "Erro ao atualizar usuário");
  }
}

  return (
    <Sheet open={aberto} onOpenChange={aoMudarAberto}>
      <SheetContent className="bg-sidebar w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Editar usuário</SheetTitle>
          <SheetDescription>Atualize os dados do usuário</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-6"
          >
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departamentos"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Departamentos</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={departamentosOptions}
                      value={field.value}
                      onChange={field.onChange}
                      hasError={!!fieldState.error}
                      placeholder="Selecione os departamentos"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lojas"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Lojas</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={lojasOptions}
                      value={field.value}
                      onChange={field.onChange}
                      hasError={!!fieldState.error}
                      placeholder="Selecione as lojas"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relatorios"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Relatórios</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={relatoriosOptions}
                      value={field.value}
                      onChange={field.onChange}
                      hasError={!!fieldState.error}
                      placeholder="Selecione os relatórios"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => aoMudarAberto(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
