import { IconSend } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { SUGGESTIONS } from "@/data/data";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [input, setInput] = useState("");

	const handleSend = () => {
		if (!input.trim()) return;

		const newId = crypto.randomUUID();
		navigate({
			to: "/chat/$sessionId",
			params: { sessionId: newId },
			search: { initialMessage: input.trim() },
		});
		setInput("");
	};

	// ignore
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
		<div className="flex h-full flex-col bg-background animate-in fade-in duration-500">
			{/* Main Content Area */}
			<div className="flex-1 overflow-y-auto p-4 md:p-8">
				<div className="mx-auto flex h-full max-w-3xl flex-col">
					<div className="flex h-full flex-col items-center justify-center space-y-8 ">
						<div className="flex flex-col items-center space-y-4 text-center">
							<h1 className="text-3xl font-semibold tracking-tight lg:text-4xl text-foreground">
								Hello Nana! What are you trying to ask me?
							</h1>
						</div>

						<div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
							{SUGGESTIONS.map((suggestion) => (
								<Card
									key={suggestion.title}
									className="cursor-pointer border-muted-foreground/20 transition-all hover:bg-muted/50 hover:shadow-md"
									onClick={() => {
										const newId = crypto.randomUUID();
										const message = `${suggestion.title}: ${suggestion.description}`;
										navigate({
											to: "/chat/$sessionId",
											params: { sessionId: newId },
											search: { initialMessage: message },
										});
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
