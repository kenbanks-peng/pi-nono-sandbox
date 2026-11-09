import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type {
  ExtensionAPI,
  ToolResultEvent,
} from "@earendil-works/pi-coding-agent";

const DENIAL_PATTERNS = [
  /operation not permitted/i,
  /permission denied/i,
  /\bEACCES\b/i,
  /\bEPERM\b/i,
  /landlock/i,
  /sandbox(?:ed)?:?\s+deny/i,
  /sandbox denied/i,
];

const SKILL_PATH = fileURLToPath(
  new URL("./skills/nono-sandbox/SKILL.md", import.meta.url),
);

const SYSTEM_CONTEXT = `
You are running inside nono, an outer OS-level sandbox.
For suspected sandbox denials or questions about nono access, read and follow the bundled nono-sandbox skill at ${SKILL_PATH}.
`.trim();

const DENIAL_GUIDANCE = `
[nono sandbox diagnostic]
Possible sandbox denial. Read and follow the bundled nono-sandbox skill at ${SKILL_PATH} to diagnose before suggesting remediation.
`.trim();

function insideNono(): boolean {
  return Boolean(process.env.NONO_CAP_FILE);
}

function textFromEvent(event: ToolResultEvent): string {
  return event.content
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n");
}

function looksLikeDenial(event: ToolResultEvent): boolean {
  if (!event.isError) return false;
  const haystack = [
    event.toolName,
    textFromEvent(event),
    JSON.stringify(event.details ?? {}),
  ].join("\n");
  return DENIAL_PATTERNS.some((pattern) => pattern.test(haystack));
}

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    if (insideNono() && ctx.hasUI) {
      ctx.ui.setStatus("nono", "nono sandbox");
    }
  });

  pi.on("before_agent_start", async (event) => {
    if (!insideNono()) return undefined;
    return {
      systemPrompt: `${event.systemPrompt}\n\n${SYSTEM_CONTEXT}`,
    };
  });

  pi.on("tool_result", async (event, ctx) => {
    if (!insideNono() || !looksLikeDenial(event)) return undefined;

    if (ctx.hasUI) {
      ctx.ui.notify("Possible nono sandbox denial", "warning");
    }

    return {
      content: [
        ...event.content,
        {
          type: "text" as const,
          text: DENIAL_GUIDANCE,
        },
      ],
      isError: true,
    };
  });

  pi.registerCommand("nono-status", {
    description: "Show nono sandbox status for this Pi session",
    handler: async (_args, ctx) => {
      const capFile = process.env.NONO_CAP_FILE;
      if (!capFile) {
        ctx.ui.notify("Pi is not running inside a nono session.", "info");
        return;
      }

      if (!existsSync(capFile)) {
        ctx.ui.notify(
          `nono capability file is not readable: ${capFile}`,
          "warning",
        );
        return;
      }

      const summary = readFileSync(capFile, "utf8")
        .split("\n")
        .slice(0, 12)
        .join("\n")
        .trim();
      ctx.ui.notify(
        summary || `nono capability file is empty: ${capFile}`,
        "info",
      );
    },
  });
}
