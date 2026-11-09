# Pi nono sandbox

A Pi extension that detects `NONO_CAP_FILE`, adds nono sandbox context to the agent, annotates suspected permission denials with diagnostic guidance, and provides `/nono-status`.

This extension does not create a sandbox or change permissions. Generic permission errors are not proof of a nono denial; confirm with `nono why --self --path <path> --op <read|write|readwrite>`.

## Install

Requires Pi, Node.js 22.19+ and a separately installed nono CLI.

```sh
pi install npm:@npm-ken/pi-nono-sandbox
```

## Use

Launch Pi inside your nono profile:

```sh
nono run --profile <profile> -- pi
```

Run `/nono-status` to inspect session capabilities. Outside nono, automatic sandbox guidance is inactive.

