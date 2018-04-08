# common
Trust game for communities

## Getting Started

```shell
npm install firebase-tools
./node_modules/.bin/firebase login
```

## Developing

Run

```shell
./node_modules/.bin/firebase serve --project common-d2ecf
```

# For Aaron (NixOS)

May need to fix the `PATH` to use the nix-installed `node`:

```shell
PATH=/Users/aaronlevin/.nix-profile/bin/:$PATH ./node_modules/.bin/firebase serve
```
