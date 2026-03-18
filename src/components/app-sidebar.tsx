"use client"

import * as React from "react"

//import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, FolderIcon, UsersIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon, DatabaseIcon, FileChartColumnIcon, FileIcon, CommandIcon, ListIcon, BoxIcon } from "lucide-react"
import { NavInventory } from "@/components/nav-inventory"
import { NavAdmin } from "./nav-admin"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Customers",
      url: "/customers",
      icon: (
        <UsersIcon
        />
      ),
    },
    {
      title: "Farmers",
      url: "/farmers",
      icon: (
        <UsersIcon
        />
      ),
    },
    {
      title: "Categories",
      url: "/categories",
      icon: (
        <ListIcon
        />
      ),
    },
    {
      title: "Products",
      url: "/products",
      icon: (
        <FolderIcon
        />
      ),
    },
  
  ],
  navInventory: [
    {
      title: "Boxes",
      url: "/boxes",
      icon: (
        <BoxIcon
        />
      ),
    },
    {
      title: "Box Versions",
      url: "/box-versions",
      icon: (
        <BoxIcon
        />
      ),
    },
    {
      title: "Box Items",
      url: "/box-items",
      icon: (
        <BoxIcon
        />
      ),
    },
    {
      title: "Harvests",
      url: "/harvests",
      icon: (
        <BoxIcon
        />
      ),
    }
  ],
  navAdmin: [
    {
      title: "Subscriptions",
      url: "/subscriptions",
      icon: (
        <FileTextIcon
        />
      ),
    },
  ],
  navClouds: [
    {
      title: "Orders",
      icon: (
        <CameraIcon
        />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Subscriptions",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Payments",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Payments",
          url: "#",
        },
        {
          title: "Archived Payments",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
    // {
    //   title: "Search",
    //   url: "#",
    //   icon: (
    //     <SearchIcon
    //     />
    //   ),
    // },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: (
        <DatabaseIcon
        />
      ),
    },
    {
      name: "Reports",
      url: "#",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: (
        <FileIcon
        />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">CSA Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavInventory items={data.navInventory} />
        <NavAdmin items={data.navAdmin} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
