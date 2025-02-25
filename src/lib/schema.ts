import { z } from "zod";

// Original character schema (kept for reference)
export const characterSchema = z.object({
	// Basic character info
	name: z.string(),
	plugins: z.array(z.string()).optional(),
	clients: z.array(z.string()).min(1),
	modelProvider: z.string(),
	settings: z
		.object({
			secrets: z.record(z.string()).optional(),
			voice: z
				.object({
					model: z.string(),
				})
				.optional(),
		})
		.passthrough()
		.optional(),
	system: z.string().optional(),
	bio: z.array(z.string()).min(1),
	lore: z.array(z.string()).min(1),
	messageExamples: z
		.array(
			z
				.array(
					z.object({
						user: z.string(),
						content: z.object({
							text: z.string(),
							action: z.string().optional(),
						}),
					})
				)
				.min(1)
		)
		.min(1),
	postExamples: z.array(z.string()).min(1),
	adjectives: z.array(z.string()).min(1),
	topics: z.array(z.string()).min(1),
	knowledge: z.array(z.string()).optional(),
	style: z.object({
		all: z.array(z.string()).min(1),
		chat: z.array(z.string()).min(1),
		post: z.array(z.string()).min(1),
	}),
});

// Generic JSON schema that can validate any valid JSON
export const genericJsonSchema = z.any();

// Helper function to create a more detailed error message from Zod errors
export const formatZodError = (error: z.ZodError) => {
	return error.errors.map((err) => ({
		path: err.path.join("."),
		message: err.message,
		code: err.code,
	}));
};
