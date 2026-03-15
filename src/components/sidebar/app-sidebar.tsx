import {
	IconCirclePlusFilled,
	IconInnerShadowTop,
	IconTrash,
} from "@tabler/icons-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "#/components/ui/sidebar";
import { NavDocuments } from "./nav-documents";
import { NavMain } from "./nav-main";

const data = {
	navMain: [
		{
			title: "New Chat",
			url: "/",
			icon: IconCirclePlusFilled,
		},
	],
};

import { useEffect } from "react";
import { useSessionsStore } from "@/hooks/use-sessions-store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { sessions, fetchSessions, isLoaded, clearAllSessions } =
		useSessionsStore();

	useEffect(() => {
		if (!isLoaded) {
			fetchSessions();
		}
	}, [isLoaded, fetchSessions]);

	const chatItems = sessions.map((s) => ({
		id: s.id,
		name: s.title,
		url: `/chat/${s.id}`,
		isLoading: s.isLoading,
	}));

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:p-1.5!"
						>
							<a href="/" className="text-inherit!">
								<IconInnerShadowTop className="size-5!" />
								<span className="text-base font-semibold">Senja.</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavDocuments items={chatItems} />
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<SidebarMenuButton className="text-destructive hover:text-destructive hover:bg-destructive/10">
									<IconTrash className="size-4" />
									<span>Delete All Chats</span>
								</SidebarMenuButton>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete
										all your chat sessions and messages.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={clearAllSessions}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										Delete All
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
