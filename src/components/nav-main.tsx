"use client"

import type * as React from "react"
import { useMemo, useState } from "react"
//import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { SearchIcon, MoreHorizontalIcon } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"

export function NavMain({
  items,
  searchItems,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
  searchItems?: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [expanded, setExpanded] = useState(false)

  const defaultSearchable = useMemo(
    () => items.filter((item) => item.url && item.url !== "#"),
    [items],
  )

  const allSearchable = useMemo(
    () =>
      (searchItems ?? items).filter(
        (item) => item.url && item.url !== "#",
      ),
    [searchItems, items],
  )

  const showAll = query.trim() || expanded
  const displayItems = showAll ? allSearchable : defaultSearchable
  const hasMore = allSearchable.length > defaultSearchable.length

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              onClick={() => setOpen(true)}
            >
              <SearchIcon/>
              <span>Search</span>
            </SidebarMenuButton>
            <CommandDialog
              open={open}
              onOpenChange={(next) => {
                setOpen(next)
                if (!next) {
                  setQuery("")
                  setExpanded(false)
                }
              }}
            >
              <Command>
                <CommandInput
                  placeholder="Search pages..."
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Pages">
                    {displayItems.map((item) => (
                      <CommandItem
                        key={item.url}
                        value={item.title}
                        onSelect={() => {
                          setOpen(false)
                          setQuery("")
                          setExpanded(false)
                          navigate(item.url)
                        }}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </CommandItem>
                    ))}
                    {!showAll && hasMore && (
                      <CommandItem
                        key="__see-more__"
                        value="See more..."
                        onSelect={() => setExpanded(true)}
                      >
                        <MoreHorizontalIcon className="size-4" />
                        <span className="text-muted-foreground">See more...</span>
                      </CommandItem>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </CommandDialog>
            {/* <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <MailIcon
              />
              <span className="sr-only">Inbox</span>
            </Button> */}
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} render={<NavLink to={item.url} />}>
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
