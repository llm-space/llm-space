import type { Thread } from "@llm-space/core";

/**
 * The starter thread written into a fresh workspace and created by the
 * onboarding "Create Your First Thread" action. Typed as `Thread` so the shape
 * is validated at compile time and stays the single source of truth.
 */
export const EXAMPLE_THREAD: Thread = {
  title: "Demo",
  context: {
    systemPrompt:
      "<role>\nYou are a helpful assistant that can help with tasks and questions using the given tools.\n</role>",
    tools: [
      {
        name: "search_web",
        description: "Search the web for information",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The query to search the web for",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_weather",
        description: "Get the weather for a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The location to get the weather for",
            },
          },
          required: ["location"],
        },
      },
    ],
    messages: [
      {
        id: "example-1",
        role: "user",
        content: [
          {
            type: "text",
            text: "What's the weather like in Beijing and Tokyo?",
          },
        ],
      },
    ],
  },
};
