import { create } from "zustand";
import { MessageActions } from "#/db/actions";

export interface Session {
	id: string;
	title: string;
	isLoading?: boolean;
	lastMessageAt?: string;
}

interface SessionsState {
	sessions: Session[];
	isLoaded: boolean;
	fetchSessions: () => Promise<void>;
	addSession: (session: Session) => void;
	updateSessionTitle: (id: string, title: string) => void;
	deleteSession: (id: string) => Promise<void>;
	editSessionTitle: (id: string, newTitle: string) => Promise<void>;
	clearAllSessions: () => Promise<void>;
}

export const useSessionsStore = create<SessionsState>((set) => ({
	sessions: [],
	isLoaded: false,
	fetchSessions: async () => {
		try {
			const fetchedSessions = await MessageActions.getSessionIds();
			set({
				sessions: fetchedSessions.map((s) => ({
					id: s.id,
					title: s.title,
					lastMessageAt: s.lastMessageAt,
				})),
				isLoaded: true,
			});
		} catch (error) {
			console.error("Failed to fetch sessions:", error);
		}
	},
	addSession: (session) => {
		set((state) => {
			// Prevent duplicates
			if (state.sessions.some((s) => s.id === session.id)) {
				return state;
			}
			return {
				sessions: [session, ...state.sessions],
			};
		});
	},
	updateSessionTitle: (id, title) => {
		set((state) => ({
			sessions: state.sessions.map((s) =>
				s.id === id ? { ...s, title, isLoading: false } : s,
			),
		}));
	},
	deleteSession: async (id) => {
		try {
			await MessageActions.deleteSession(id);
			set((state) => ({
				sessions: state.sessions.filter((s) => s.id !== id),
			}));
		} catch (error) {
			console.error("Failed to delete session:", error);
		}
	},
	editSessionTitle: async (id, newTitle) => {
		try {
			await MessageActions.updateSessionTitle(id, newTitle);
			set((state) => ({
				sessions: state.sessions.map((s) =>
					s.id === id ? { ...s, title: newTitle } : s,
				),
			}));
		} catch (error) {
			console.error("Failed to edit session title:", error);
		}
	},
	clearAllSessions: async () => {
		try {
			await MessageActions.clearAllMessages();
			set({ sessions: [] });
		} catch (error) {
			console.error("Failed to clear sessions:", error);
		}
	},
}));
