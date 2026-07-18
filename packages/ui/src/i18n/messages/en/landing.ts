/**
 * Web landing page strings (`apps/web/src/landing/`). Migrated from the
 * landing's own `lib/i18n.tsx` so all surfaces share one catalog. `en` is the
 * canonical schema; `zh` mirrors it exactly (type-checked).
 *
 * Inline markup (the gradient wordmark, line breaks) is split into parts
 * (`hero.titleBefore`/`titleAfter`) so each locale can place them. The
 * `showcase.slides` array is zipped with `SHOWCASE_IMAGES` at render time.
 */
export interface LandingSlide {
  title: string;
  caption: string;
  alt: string;
}

export const enLanding = {
  nav: {
    quickStart: "Quick start",
    userManual: "User manual",
  },
  header: {
    star: "Star on GitHub",
    language: "Language",
  },
  hero: {
    badge: "From the DeerFlow team",
    titleBefore: "Build, trace, and debug agents in ",
    titleAfter: "",
    subtitle:
      "A local-first desktop app to prototype agents, inspect every harness step, replay failures, and evaluate performance.",
    download: "Download",
    appleSilicon: "Apple Silicon",
    intel: "Intel",
    requirements: "Requires macOS 15.7.3 or later",
    latest: "Latest",
    seeReleases: "See all releases",
  },
  showcase: {
    titleLine1: "The entire agent loop,",
    titleLine2: "now in one window",
    subtitle:
      "Build, run, extend, and evaluate — every step of your agent lives in a single window, so you always see exactly what it did, and why.",
    learnMore: "Learn more",
    carouselLabel: "LLM Space product screenshots",
    showSlideAria: "Show slide {index}: {title}",
    previousScreenshot: "Previous screenshot",
    nextScreenshot: "Next screenshot",
    slides: [
      {
        title: "Watch the whole loop, live",
        caption:
          "Set the model, tools, and system prompt on the left. Hit Run, and every thought, tool call, and raw response streams in on the right.",
        alt: "The playground: model, tools, and system prompt on the left; a live run streaming thinking, tool calls, and responses on the right",
      },
      {
        title: "Start from a proven template",
        caption:
          "Spin up a thread from ready-made prompts — general agent, deep research, translation, knowledge base, and more — instead of a blank page.",
        alt: 'The "Start from examples" dialog listing prompt templates like General Agent, Deep Research, and Translation',
      },
      {
        title: "Draft a system prompt in seconds",
        caption:
          "Describe the behavior you want and let the built-in generator turn it into a structured prompt you can keep editing.",
        alt: "Inline system-prompt generation turning a short description into a structured prompt",
      },
      {
        title: "Every provider, one place",
        caption:
          "20+ providers built in and hundreds of models a toggle away — or bring your own with just a base URL and API key.",
        alt: "The Models settings pane showing many providers and a long list of selectable models",
      },
      {
        title: "Built-in tools, ready to run",
        caption:
          "Give a thread file access, web search, shell, and more — flip a switch to add any built-in tool.",
        alt: 'The "Add built-in tools" dialog with toggles for read, write, edit, grep, glob, and other tools',
      },
      {
        title: "Extend with MCP servers",
        caption:
          "Connect MCP servers and pick exactly which of their tools a thread is allowed to call.",
        alt: 'The "Add MCP tools" dialog listing tools from a connected Tavily server',
      },
      {
        title: "Define your own function tools",
        caption:
          "Add custom function tools with plain JSON Schema, then supply their responses at runtime.",
        alt: 'The "Add function tool" dialog editing a function definition in JSON Schema',
      },
      {
        title: "Compare and evaluate runs",
        caption:
          "Put two runs side by side, diff their prompts and results, and save a structured evaluation with the thread.",
        alt: 'The "Evaluate Runs" dialog comparing two runs side by side',
      },
    ] as LandingSlide[],
  },
  providers: {
    title: "Bring any model, from any provider",
    subtitle:
      "20+ providers built in — OpenAI, Anthropic, Google, and more — or bring your own with just a base URL and API key.",
  },
  community: {
    title: "Join our community",
    subtitle:
      "LLM Space is open source and built in public. If it helps you build better agents, drop a star — it helps others find the project and shapes what we build next.",
    star: "Star us on GitHub",
  },
  footer: {
    documents: "Documents",
    github: "GitHub",
    releases: "Releases",
    reportIssues: "Report issues",
    rights: "All rights reserved.",
  },
};
