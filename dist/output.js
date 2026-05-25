export const ok = (stdout = "") => ({ exitCode: 0, stdout, stderr: "" });
export const fail = (stderr, exitCode = 1) => ({ exitCode, stdout: "", stderr });
export const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
export const table = (rows) => rows.map(([key, value]) => `${key.padEnd(14)} ${value}`).join("\n") + "\n";
