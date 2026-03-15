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

				const { messages, conversationId } = await request.json();

				try {
					const stream = chat({
						adapter: groqText("llama-3.3-70b-versatile"),
						messages,
						conversationId,
					});

					return toServerSentEventsResponse(stream);
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
