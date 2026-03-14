import { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { IconSend, IconPaperclip, IconMicrophone, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/")({
	component: HomePage,
});

const SUGGESTIONS = [
	{
		title: "Write a blog post",
		description: "About the future of AI in web development",
	},
	{
		title: "Explain code",
		description: "Help me understand a complex React hook",
	},
	{
		title: "Plan a trip",
		description: "A 5-day itinerary for Tokyo, Japan",
	},
	{
		title: "Brainstorm ideas",
		description: "For a new mobile app focused on productivity",
	},
];

type Message = {
	id: string;
	role: "user" | "ai";
	text: string;
};

function HomePage() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		const handleReset = () => setMessages([]);
		window.addEventListener("reset-chat", handleReset);
		return () => window.removeEventListener("reset-chat", handleReset);
	}, []);

	const handleSend = () => {
		if (!input.trim()) return;

		const newUserMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			text: input.trim(),
		};

		setMessages((prev) => [...prev, newUserMessage]);
		setInput("");

		// Simulate AI response
		setTimeout(() => {
			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "ai",
				text:
					"This is a simulated AI response. I don't have a real backend connected yet, but I can echo your request or provide dummy text. You asked about: " +
					newUserMessage.text,
			};
			setMessages((prev) => [...prev, aiMessage]);
		}, 1000);
	};

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

	return (
		<div className="flex h-full flex-col bg-background">
			{/* Main Content Area */}
			<div className="flex-1 overflow-y-auto p-4 md:p-8">
				<div className="mx-auto flex h-full max-w-3xl flex-col">
					{messages.length === 0 ? (
						// Empty State
						<div className="flex h-full flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
							<div className="flex flex-col items-center space-y-4 text-center">
								<div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 p-4 shadow-sm ring-1 ring-primary/20">
									<IconSparkles className="h-10 w-10" />
								</div>
								<h1 className="text-3xl font-semibold tracking-tight lg:text-4xl text-foreground">
									How can I help you today?
								</h1>
								<p className="max-w-md text-lg text-muted-foreground">
									I'm your personal AI assistant. Ask me anything or try one of
									the suggestions below.
								</p>
							</div>

							<div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
								{SUGGESTIONS.map((suggestion) => (
									<Card
										key={suggestion.title}
										className="cursor-pointer border-muted-foreground/20 transition-all hover:bg-muted/50 hover:shadow-md"
										onClick={() => {
											setInput(
												`${suggestion.title}: ${suggestion.description}`,
											);
											// Reset height on suggestion click
											const textarea = document.getElementById('chat-input') as HTMLTextAreaElement;
											if(textarea) textarea.style.height = 'auto';
										}}
									>
										<CardHeader className="p-4">
											<CardTitle className="text-base font-medium text-foreground">
												{suggestion.title}
											</CardTitle>
											<CardDescription className="text-sm">
												{suggestion.description}
											</CardDescription>
										</CardHeader>
									</Card>
								))}
							</div>
						</div>
					) : (
						// Chat State
						<div className="flex flex-col space-y-6 pb-20">
							{messages.map((message) => (
								<div
									key={message.id}
									className={`flex w-full ${
										message.role === "user" ? "justify-end" : "justify-start"
									}`}
								>
									<div
										className={`flex max-w-[85%] gap-4 sm:max-w-[75%] ${
											message.role === "user" ? "flex-row-reverse" : "flex-row"
										}`}
									>
										<Avatar className="mt-1 h-8 w-8 shrink-0 shadow-sm">
											<AvatarImage
												src={message.role === "user" ? "/avatars/user.jpg" : ""}
											/>
											<AvatarFallback
												className={
													message.role === "user"
														? "bg-primary/20 text-primary"
														: "bg-primary text-primary-foreground"
												}
											>
												{message.role === "user" ? (
													"U"
												) : (
													<IconSparkles size={16} />
												)}
											</AvatarFallback>
										</Avatar>
										<div
											className={` rounded-2xl px-5 py-3.5 shadow-sm ${
												message.role === "user"
													? "rounded-tr-sm bg-primary text-primary-foreground"
													: "rounded-tl-sm border border-muted-foreground/10 bg-muted text-foreground"
											}`}
										>
											<p className="whitespace-pre-wrap text-sm leading-relaxed">
												{message.text}
											</p>
										</div>
									</div>
								</div>
							))}
							<div ref={messagesEndRef} />
						</div>
					)}
				</div>
			</div>

			{/* Input Area */}
			<div className="sticky bottom-0 z-10 w-full border-t border-muted/50 bg-background/80 p-4 backdrop-blur-md">
				<div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
					<div className="focus-within:ring-ring relative flex w-full items-end gap-2 rounded-2xl border border-input bg-background/60 p-1 shadow-sm transition-all focus-within:ring-1">
						<div className="flex shrink-0 pb-1.5 pl-1.5">
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
							>
								<IconPaperclip className="h-4 w-4" />
							</Button>
						</div>

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
							{!input.trim() ? (
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
								>
									<IconMicrophone className="h-4 w-4" />
								</Button>
							) : (
								<Button
									size="icon"
									className="h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:scale-105 hover:bg-primary/90"
									onClick={handleSend}
								>
									<IconSend className="h-4 w-4" />
								</Button>
							)}
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
