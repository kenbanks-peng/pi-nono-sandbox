# Pi nono sandbox

A Pi package combining an extension and a skill for nono sandbox awareness. The extension detects `NONO_CAP_FILE`, flags suspected denials, and provides `/nono-status`. The bundled `nono-sandbox` skill handles diagnosis and least-privilege remediation.

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

Run `/nono-status` to inspect session capabilities or `/skill:nono-sandbox` for diagnostic guidance. Pi discovers the bundled skill automatically; no separate skill installation is needed. Outside nono, automatic sandbox guidance is inactive.

