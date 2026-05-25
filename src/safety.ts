import type { ParsedArgs } from "./config.js";

const UNSAFE_FLAGS = new Set([
  "private-key",
  "seed",
  "mnemonic",
  "submit",
  "sign",
  "broadcast",
  "mainnet"
]);

const UNSAFE_ENV = [
  "PRIVATE_KEY",
  "SEED",
  "MNEMONIC"
];

export const assertSafeArgs = (args: ParsedArgs): string[] => {
  const errors: string[] = [];
  for (const flag of Object.keys(args.flags)) {
    if (UNSAFE_FLAGS.has(flag)) errors.push(`--${flag} is disabled in v0`);
  }
  for (const name of UNSAFE_ENV) {
    if (process.env[name]) errors.push(`${name} is not read by mcosm v0`);
  }
  return errors;
};
