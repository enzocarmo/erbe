import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
  group?: string;
}

interface EnhancedMultiSelectProps<T> {
  options: MultiSelectOption[];
  value: T[];
  onChange: (value: T[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  hasError?: boolean;
  getOptionValue: (option: MultiSelectOption) => T;
  getDisplayValue: (item: T) => string;
  loading?: boolean;
}

export function EnhancedMultiSelect<T>({
  options,
  value = [],
  onChange,
  placeholder,
  searchPlaceholder = "Pesquisar...",
  emptyMessage = "Nenhum item encontrado.",
  hasError = false,
  getOptionValue,
  getDisplayValue,
  loading = false,
}: EnhancedMultiSelectProps<T>) {
  const [open, setOpen] = useState(false);

  const handleSelect = (option: MultiSelectOption) => {
    const optionValue = getOptionValue(option);
    const isSelected = value.some(item => 
      JSON.stringify(item) === JSON.stringify(optionValue)
    );
    
    if (isSelected) {
      onChange(value.filter(item => 
        JSON.stringify(item) !== JSON.stringify(optionValue)
      ));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeItem = (itemToRemove: T) => {
    onChange(value.filter(item => 
      JSON.stringify(item) !== JSON.stringify(itemToRemove)
    ));
  };

  const isSelected = (option: MultiSelectOption) => {
    const optionValue = getOptionValue(option);
    return value.some(item => 
      JSON.stringify(item) === JSON.stringify(optionValue)
    );
  };

  // Agrupar opções
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || 'default';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, MultiSelectOption[]>);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between bg-white hover:bg-accent hover:text-accent-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              value.length === 0 && "text-muted-foreground",
              hasError && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={loading}
          >
            {value.length === 0
              ? placeholder
              : `${value.length} item(s) selecionado(s)`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[400px] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandEmpty>{loading ? "Carregando..." : emptyMessage}</CommandEmpty>
            <CommandList>
              {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <CommandGroup 
                  key={group} 
                  heading={group !== 'default' ? group : undefined}
                >
                  {groupOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => handleSelect(option)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected(option) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {getDisplayValue(item)}
              <button
                type="button"
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => removeItem(item)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}