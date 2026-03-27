import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "~/components/ui/command"

export interface CityOption {
  id: string
  name: string
  state?: { name: string } | null
}

interface CityComboboxProps {
  cities: CityOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CityCombobox({
  cities,
  value,
  onValueChange,
  placeholder = "Select city…",
  disabled = false,
}: CityComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedCity = cities.find((c) => c.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal h-9 px-3 text-sm"
        >
          {selectedCity
            ? `${selectedCity.name}${selectedCity.state?.name ? ` (${selectedCity.state.name})` : ""}`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search cities..." />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              {cities.map((city) => (
                <CommandItem
                  key={city.id}
                  value={`${city.name} ${city.state?.name || ""}`}
                  onSelect={() => {
                    onValueChange(city.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === city.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">
                    {city.name}
                    {city.state?.name && (
                      <span className="text-slate-400 ml-1">({city.state.name})</span>
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
