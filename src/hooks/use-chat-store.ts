import { create } from "zustand";

export type Message = {
	id: string;
	role: "user" | "ai";
	text: string;
};

interface ChatState {
	messages: Message[];
	addMessage: (message: Message) => void;
	setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
	clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
	messages: [],
	addMessage: (message) =>
		set((state) => ({ messages: [...state.messages, message] })),
	setMessages: (updater) =>
		set((state) => ({
			messages: typeof updater === "function" ? updater(state.messages) : updater,
		})),
	clearMessages: () => set({ messages: [] }),
}));
