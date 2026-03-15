import { IconDots, IconSearch, IconPencil, IconTrash } from "@tabler/icons-react";
import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "#/components/ui/sidebar";
import { Input } from "#/components/ui/input";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { useSessionsStore } from "@/hooks/use-sessions-store";
import { Button } from "../ui/button";

const MAX_VISIBLE_ITEMS = 7;

export function NavDocuments({
	items,
}: {
	items: {
		id: string;
		name: string;
		url: string;
		isLoading?: boolean;
	}[];
}) {
	const [showAll, setShowAll] = React.useState(false);
	const [query, setQuery] = React.useState("");
	const [editTitle, setEditTitle] = React.useState("");
	const [editingId, setEditingId] = React.useState<string | null>(null);
	const { deleteSession, editSessionTitle } = useSessionsStore();
	const navigate = useNavigate();

	const filteredItems = React.useMemo(() => {
		if (!query.trim()) return items;
		return items.filter((item) =>
			item.name.toLowerCase().includes(query.toLowerCase()),
		);
	}, [items, query]);

	const visibleItems = showAll
		? filteredItems
		: filteredItems.slice(0, MAX_VISIBLE_ITEMS);
	const hasMore = filteredItems.length > MAX_VISIBLE_ITEMS;

	const handleShowMore = (e: React.MouseEvent) => {
		e.preventDefault();
		setShowAll(true);
	};

	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden flex-1 min-h-0 flex flex-col">
			<SidebarGroupLabel>Chat History</SidebarGroupLabel>
			<SidebarMenuItem className="px-2 py-2 flex-none">
				<div className="relative">
					<IconSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search chats..."
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setShowAll(false);
						}}
						className="h-8 pl-8 text-xs"
					/>
				</div>
			</SidebarMenuItem>
			<SidebarMenu className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
				{visibleItems.map((item) => (
					<SidebarMenuItem key={item.id} className="group/item relative">
						<SidebarMenuButton asChild>
							<Link to={item.url} className="text-inherit! pr-16!">
								{item.isLoading ? (
									<span className="flex items-center gap-2 italic text-muted-foreground animate-pulse">
										<span className="h-2 w-2 rounded-full bg-primary" />
										Generating title...
									</span>
								) : (
									<span>{item.name}</span>
								)}
							</Link>
						</SidebarMenuButton>

						{!item.isLoading && (
							<div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
								<Dialog 
									open={editingId === item.id} 
									onOpenChange={(open) => {
										if (!open) setEditingId(null);
									}}
								>
									<DialogTrigger asChild>
										<button
											className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												setEditTitle(item.name);
												setEditingId(item.id);
											}}
										>
											<IconPencil className="size-3.5" />
										</button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Edit Title</DialogTitle>
											<DialogDescription>
												Change the title of this chat session.
											</DialogDescription>
										</DialogHeader>
										<div className="py-4">
											<Input
												value={editTitle}
												onChange={(e) => setEditTitle(e.target.value)}
												onKeyDown={async (e) => {
													if (e.key === "Enter" && editTitle.trim()) {
														await editSessionTitle(item.id, editTitle.trim());
														setEditingId(null);
													}
												}}
												placeholder="Enter new title..."
												autoFocus
											/>
										</div>
										<DialogFooter>
											<Button
												variant="outline"
												onClick={() => setEditingId(null)}
											>
												Cancel
											</Button>
											<Button
												onClick={async () => {
													if (editTitle.trim()) {
														await editSessionTitle(item.id, editTitle.trim());
														setEditingId(null);
													}
												}}
											>
												Save Changes
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>

								<AlertDialog>
									<AlertDialogTrigger asChild>
										<button
											className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive/70 hover:text-destructive"
										>
											<IconTrash className="size-3.5" />
										</button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Delete Chat Session?</AlertDialogTitle>
											<AlertDialogDescription>
												This will permanently delete this chat session and all
												its messages.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction
												onClick={async () => {
													await deleteSession(item.id);
													if (window.location.pathname.includes(item.id)) {
														navigate({ to: "/" });
													}
												}}
												className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
											>
												Delete
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						)}
					</SidebarMenuItem>
				))}
				{hasMore && !showAll && (
					<SidebarMenuItem className="flex items-center gap-2">
						<SidebarMenuButton
							onClick={handleShowMore}
							tooltip="Show More"
							className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
						>
							<IconDots />
							<span>Show More</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				)}
			</SidebarMenu>
		</SidebarGroup>
	);
}
