import { create } from "zustand";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

interface SidebarState {
	open: boolean;
	openMobile: boolean;
	setOpen: (open: boolean) => void;
	setOpenMobile: (open: boolean) => void;
	toggleSidebar: (isMobile: boolean) => void;
}

const getInitialOpen = () => {
	if (typeof document === "undefined") return true;
	const cookie = document.cookie
		.split("; ")
		.find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`));
	if (!cookie) return true;
	return cookie.split("=")[1] === "true";
};

export const useSidebarStore = create<SidebarState>((set) => ({
	open: getInitialOpen(),
	openMobile: false,
	setOpen: (open) => {
		set({ open });
		document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
	},
	setOpenMobile: (openMobile) => set({ openMobile }),
	toggleSidebar: (isMobile) => {
		if (isMobile) {
			set((state) => ({ openMobile: !state.openMobile }));
		} else {
			set((state) => {
				const nextOpen = !state.open;
				document.cookie = `${SIDEBAR_COOKIE_NAME}=${nextOpen}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
				return { open: nextOpen };
			});
		}
	},
}));
