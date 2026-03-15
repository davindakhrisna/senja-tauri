import { IconSend } from "@tabler/icons-react";
import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MessageActions } from "#/db/actions";
import { Button } from "@/components/ui/button";

interface ChatSearch {
	initialMessage?: string;
}

export const Route = createLazyFileRoute("/chat/$sessionId")<
	{ search: ChatSearch },
	{
		component: RouteComponent;
	}
>({
	component: RouteComponent,
});

function RouteComponent() {
	const { sessionId } = Route.useParams();
	const { initialMessage } = Route.useSearch();
	const [sessionLoading, setSessionLoading] = useState(true);
	const [error, setError] = useState(false);
	const [savedMessages, setSavedMessages] = useState<
		Array<{
			id: string;
			sessionId: string;
			message: string;
			role: string;
			title?: string;
		}>
	>([]);
	const [titleGenerated, setTitleGenerated] = useState(false);
	const { messages, sendMessage, isLoading } = useChat({
		connection: fetchServerSentEvents("/api/chat", {
			conversationId: sessionId,
		}),
		onFinish: async (message) => {
			// Save the assistant's response to DB
			if (message.parts.some((p) => p.type === "text")) {
				const textContent = message.parts
					.filter((p) => p.type === "text")
					.map((p) => p.content)
					.join("");

				await MessageActions.saveMessage(
					sessionId,
					"assistant",
					textContent,
					"",
				);
			}
		},
	});
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const initialMessageSent = useRef(false);

	// Load saved messages from DB on mount
	useEffect(() => {
		let active = true;

		(async () => {
			try {
				const msgs = await MessageActions.getSessionMessages(sessionId);
				if (!active) return;

				setSavedMessages(msgs);

				// Check if we have messages (means title was already generated)
				if (msgs.length > 0) {
					setTitleGenerated(true);
				}

				setSessionLoading(false);
			} catch (err) {
				console.error("Failed to load messages:", err);
				if (active) {
					setError(true);
					setSessionLoading(false);
				}
			}
		})();

		return () => {
			active = false;
		};
	}, [sessionId]);

	// Send initial message if provided
	useEffect(() => {
		if (initialMessage && !initialMessageSent.current && !sessionLoading) {
			initialMessageSent.current = true;
			// Small delay to ensure everything is ready
			setTimeout(() => {
				handleSend(initialMessage);
			}, 100);
		}
	}, [initialMessage, sessionLoading]);

	const handleSend = async (messageOverride?: string) => {
		const messageToSend = messageOverride ?? input;
		if (messageToSend.trim() && !isLoading) {
			const userMessage = messageToSend.trim();
			setInput("");

			// Save user message to DB immediately
			const isFirstMessage = savedMessages.length === 0 && messages.length === 0;

			if (isFirstMessage && !titleGenerated) {
				// Generate title using AI
				try {
					const titleResponse = await fetch("/api/chat", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							messages: [
								{
									role: "system",
									content:
										"Generate a short, concise title (max 6 words) for this chat message. Return ONLY the title, nothing else. No quotes, no explanations.",
								},
								{
									role: "user",
									content: userMessage,
								},
							],
							conversationId: `title-${sessionId}`,
						}),
					});

					if (titleResponse.ok) {
						const titleText = await titleResponse.text();
						const generatedTitle = titleText.trim().replace(/^"|"$/g, "");
						await MessageActions.saveMessage(
							sessionId,
							"user",
							userMessage,
							generatedTitle,
						);
						setTitleGenerated(true);
					} else {
						// Fallback: use first 50 chars as title
						const fallbackTitle = userMessage.slice(0, 50) + "...";
						await MessageActions.saveMessage(
							sessionId,
							"user",
							userMessage,
							fallbackTitle,
						);
						setTitleGenerated(true);
					}
				} catch (err) {
					console.error("Failed to generate title:", err);
					const fallbackTitle = userMessage.slice(0, 50) + "...";
					await MessageActions.saveMessage(
						sessionId,
						"user",
						userMessage,
						fallbackTitle,
					);
					setTitleGenerated(true);
				}
			} else {
				await MessageActions.saveMessage(sessionId, "user", userMessage, "");
			}

			// Send message to AI
			sendMessage(userMessage);
		}
	};

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, savedMessages]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value);
		e.target.style.height = "auto";
		e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
	};

	if (error) {
		return <div className="flex h-full items-center justify-center">Error loading chat session</div>;
	}

	if (sessionLoading) {
		return <div className="flex h-full items-center justify-center">Loading...</div>;
	}

	return (
		<div className="flex h-full flex-col bg-background">
			{/* Main Content Area */}
			<div className="flex-1 overflow-y-auto p-4 md:p-8">
				<div className="mx-auto flex h-full max-w-3xl flex-col">
					<div className="flex flex-col space-y-6 pb-20">
						{/* Render saved messages from DB */}
						{savedMessages.map((msg) => (
							<div
								key={msg.id}
								className={`flex w-full ${
									msg.role === "assistant" ? "justify-start" : "justify-end"
								}`}
							>
								<div
									className={`flex max-w-[85%] gap-4 sm:max-w-[75%] ${
										msg.role === "assistant"
											? "flex-row"
											: "flex-row-reverse"
									}`}
								>
									<div
										className={`rounded-2xl px-5 py-3.5 shadow-sm ${
											msg.role === "assistant"
												? "rounded-tl-sm border border-muted-foreground/10 bg-muted text-foreground"
												: "rounded-tr-sm bg-primary text-primary-foreground"
										}`}
									>
										<p className="whitespace-pre-wrap text-sm leading-relaxed">
											{msg.message}
										</p>
									</div>
								</div>
							</div>
						))}

						{/* Render streaming messages from useChat */}
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex w-full ${
									message.role === "assistant" ? "justify-start" : "justify-end"
								}`}
							>
								<div
									className={`flex max-w-[85%] gap-4 sm:max-w-[75%] ${
										message.role === "assistant"
											? "flex-row"
											: "flex-row-reverse"
									}`}
								>
									<div
										className={`rounded-2xl px-5 py-3.5 shadow-sm ${
											message.role === "assistant"
												? "rounded-tl-sm border border-muted-foreground/10 bg-muted text-foreground"
												: "rounded-tr-sm bg-primary text-primary-foreground"
										}`}
									>
										<p className="whitespace-pre-wrap text-sm leading-relaxed">
											{message.parts.map((part, idx) => {
												if (part.type === "thinking") {
													return (
														<div
															key={idx}
															className="text-sm text-gray-500 italic mb-2"
														>
															💭 Thinking: {part.content}
														</div>
													);
												}
												if (part.type === "text") {
													return <div key={idx}>{part.content}</div>;
												}
												return null;
											})}
										</p>
									</div>
								</div>
							</div>
						))}
						<div ref={messagesEndRef} />
					</div>
				</div>
			</div>

			{/* Input Area */}
			<div className="sticky bottom-0 z-10 w-full border-t border-muted/50 bg-background/80 p-4 backdrop-blur-md">
				<div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
					<div className="focus-within:ring-ring relative flex w-full items-end gap-2 rounded-2xl border border-input bg-background/60 p-1 shadow-sm transition-all focus-within:ring-1">
						<textarea
							id="chat-input"
							value={input}
							onChange={autoResize}
							onKeyDown={handleKeyDown}
							placeholder="Message Senja..."
							className="min-h-[44px] w-full resize-none bg-transparent px-2 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
							rows={1}
							style={{
								height: "44px",
								maxHeight: "200px",
							}}
						/>

						<div className="flex shrink-0 gap-1 pb-1.5 pr-1.5">
							<Button
								size="icon"
								className="h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:scale-105 hover:bg-primary/90"
								onClick={handleSend}
								disabled={!input.trim() || isLoading}
							>
								<IconSend className="h-4 w-4" />
							</Button>
						</div>
					</div>
					<div className="text-center">
						<span className="text-xs text-muted-foreground">
							Senja can make mistakes. Consider verifying important information.
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
