import {
	IconCamera,
	IconFileAi,
	IconFileDescription,
	IconInnerShadowTop,
	IconSettings,
	IconCirclePlusFilled,
	IconPlusFilled,
} from "@tabler/icons-react";

import { NavDocuments } from "./nav-documents";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "#/components/ui/sidebar";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "New Chat",
			url: "#",
			icon: IconCirclePlusFilled,
		},
	],
	navClouds: [
		{
			title: "Capture",
			icon: IconCamera,
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
			title: "Proposal",
			icon: IconFileDescription,
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
			title: "Prompts",
			icon: IconFileAi,
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
	],
	navSecondary: [
		{
			title: "Settings",
			url: "#",
			icon: IconSettings,
		},
	],
	documents: [
		{
			name: "Product Launch Strategy",
			url: "#",
		},
		{
			name: "Q4 Marketing Plan",
			url: "#",
		},
		{
			name: "Budget Review 2024",
			url: "#",
		},
		{
			name: "Team Meeting Notes",
			url: "#",
		},
		{
			name: "Customer Feedback Analysis",
			url: "#",
		},
		{
			name: "Website Redesign Ideas",
			url: "#",
		},
		{
			name: "Sales Pipeline Review",
			url: "#",
		},
		{
			name: "Content Calendar Planning",
			url: "#",
		},
		{
			name: "Competitor Analysis",
			url: "#",
		},
		{
			name: "Email Campaign Draft",
			url: "#",
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:p-1.5!"
						>
							<a href="#" className="text-inherit!">
								<IconInnerShadowTop className="size-5!" />
								<span className="text-base font-semibold">Senja.</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavDocuments items={data.documents} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
		</Sidebar>
	);
}
