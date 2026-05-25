export type CommandResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

export const ok = (stdout = ""): CommandResult => ({ exitCode: 0, stdout, stderr: "" });
export const fail = (stderr: string, exitCode = 1): CommandResult => ({ exitCode, stdout: "", stderr });

export const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

export const table = (rows: Array<[string, string]>): string =>
  rows.map(([key, value]) => `${key.padEnd(14)} ${value}`).join("\n") + "\n";

const useColor = () => process.env.NO_COLOR !== "1" && process.env.NO_COLOR !== "true";

const color = (code: number, text: string): string => useColor() ? `\u001b[${code}m${text}\u001b[0m` : text;

export const cyan = (text: string): string => color(36, text);
export const green = (text: string): string => color(32, text);
export const yellow = (text: string): string => color(33, text);
export const red = (text: string): string => color(31, text);
export const dim = (text: string): string => color(2, text);
export const bold = (text: string): string => color(1, text);

export const truncate = (value: string, length = 18): string =>
  value.length <= length ? value : `${value.slice(0, Math.max(0, length - 1))}…`;

export const badge = (label: string, tone: "success" | "warning" | "danger" | "info" = "info"): string => {
  const text = `[${label}]`;
  if (tone === "success") return green(text);
  if (tone === "warning") return yellow(text);
  if (tone === "danger") return red(text);
  return cyan(text);
};

export const panel = (title: string, lines: string[], width = 76): string => {
  const inner = width - 4;
  const top = `╭─ ${bold(title)} ${"─".repeat(Math.max(0, inner - title.length - 1))}╮`;
  const body = lines.map((line) => {
    const cleanLength = line.replace(/\u001b\[[0-9;]*m/g, "").length;
    return `│ ${line}${" ".repeat(Math.max(0, inner - cleanLength))} │`;
  });
  return [top, ...body, `╰${"─".repeat(width - 2)}╯`].join("\n");
};
