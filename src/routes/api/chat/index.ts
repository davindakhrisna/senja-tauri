import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { groqText } from "@tanstack/ai-groq";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat/")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				if (!process.env.GROQ_API_KEY) {
					return new Response(
						JSON.stringify({
							error: "GROQ_API_KEY not configured",
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				const {
					messages,
					conversationId,
					stream: shouldStream = true,
				} = await request.json();

				try {
					const systemMessage = {
						role: "system" as const,
						content:
							process.env.SYSTEM_INSTRUCTION ||
							"Respond accordingly to your personality. You should avoid using Emojis and any markdown formatting. For responses always use raw text only",
					};

					const personalityMessage = {
						role: "system" as const,
						content:
							process.env.SYSTEM_PERSONALITY ||
							"Your name is Glen Emanuel Nangoy. The user you interacts with is Nana, a girl whom Glen Emanuel Nangoy loves",
					};

					const run = chat({
						adapter: groqText("llama-3.3-70b-versatile"),
						messages: [systemMessage, personalityMessage, ...messages],
						conversationId,
					});

					if (!shouldStream) {
						let content = "";
						for await (const part of run) {
							if ("delta" in part && typeof part.delta === "string") {
								content += part.delta;
							}
						}
						return new Response(content, {
							headers: { "Content-Type": "text/plain" },
						});
					}

					return toServerSentEventsResponse(run);
				} catch (error) {
					return new Response(
						JSON.stringify({
							error:
								error instanceof Error ? error.message : "An error occurred",
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},
		},
	},
});
