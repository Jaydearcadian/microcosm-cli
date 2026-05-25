# Microcosm CLI

Installable Microcosm programmable payments console for Arc.

`mcosm` is the first terminal product surface for Microcosm. It lets operators create programmable payments, evaluate policy, compose and verify payable proofs, prepare settlement instructions, inspect Arc testnet, and run payment loops before a webapp exists.

## Install locally

```bash
npm install
npm run build
npm link
mcosm
```

## Commands

```text
payment      create and inspect programmable payments
policy       evaluate payment policy
proof        compose, verify, and inspect payable proofs
settlement   prepare unsigned settlement instructions
arc          inspect Arc network state
loop         automate the programmable payment flow
adapter      inspect future signer adapters
history      show session run history
status       show current console state
reset        clear in-memory state
exit         leave the shell
```

Each command box prints its available subcommands when run without a subcommand.

## Safety

V0 prepares settlement instructions but does not sign or submit transactions. It rejects private key, seed, mnemonic, signing, broadcasting, submission, and mainnet flags. Signing adapters are visible as product boundaries, but disabled until a later reviewed release.

## Arc

Arc testnet is the default network. Arc mainnet execution is intentionally unavailable in v0.
