import { IconDots, IconSearch } from "@tabler/icons-react";
import * as React from "react";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "#/components/ui/sidebar";
import { Input } from "#/components/ui/input";

const MAX_VISIBLE_ITEMS = 7;

export function NavDocuments({
	items,
}: {
	items: {
		name: string;
		url: string;
	}[];
}) {
	const [showAll, setShowAll] = React.useState(false);
	const [query, setQuery] = React.useState("");
	const { isMobile } = useSidebar();

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
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel>Chat History</SidebarGroupLabel>
			<SidebarMenuItem className="px-2 py-2">
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
			<SidebarMenu>
				{visibleItems.map((item) => (
					<SidebarMenuItem key={item.name}>
						<SidebarMenuButton asChild>
							<a href={item.url} className="text-inherit!">
								<span>{item.name}</span>
							</a>
						</SidebarMenuButton>
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
