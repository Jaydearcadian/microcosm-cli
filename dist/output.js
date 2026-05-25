export const ok = (stdout = "") => ({ exitCode: 0, stdout, stderr: "" });
export const fail = (stderr, exitCode = 1) => ({ exitCode, stdout: "", stderr });
export const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
export const table = (rows) => rows.map(([key, value]) => `${key.padEnd(14)} ${value}`).join("\n") + "\n";
const useColor = () => process.env.NO_COLOR !== "1" && process.env.NO_COLOR !== "true";
const color = (code, text) => useColor() ? `\u001b[${code}m${text}\u001b[0m` : text;
export const cyan = (text) => color(36, text);
export const green = (text) => color(32, text);
export const yellow = (text) => color(33, text);
export const red = (text) => color(31, text);
export const dim = (text) => color(2, text);
export const bold = (text) => color(1, text);
export const truncate = (value, length = 18) => value.length <= length ? value : `${value.slice(0, Math.max(0, length - 1))}…`;
export const badge = (label, tone = "info") => {
    const text = `[${label}]`;
    if (tone === "success")
        return green(text);
    if (tone === "warning")
        return yellow(text);
    if (tone === "danger")
        return red(text);
    return cyan(text);
};
export const panel = (title, lines, width = 76) => {
    const inner = width - 4;
    const top = `╭─ ${bold(title)} ${"─".repeat(Math.max(0, inner - title.length - 1))}╮`;
    const body = lines.map((line) => {
        const cleanLength = line.replace(/\u001b\[[0-9;]*m/g, "").length;
        return `│ ${line}${" ".repeat(Math.max(0, inner - cleanLength))} │`;
    });
    return [top, ...body, `╰${"─".repeat(width - 2)}╯`].join("\n");
};
