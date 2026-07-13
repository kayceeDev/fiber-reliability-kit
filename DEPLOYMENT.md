# Deployment

This project has two hackathon submission surfaces:

- npm package: `@fiber-reliability/sdk`
- hosted demo: Fiber Reliability Lab on Netlify Free

## Verification

Run these checks before publishing or deploying:

```bash
corepack pnpm --filter @fiber-reliability/sdk build
corepack pnpm --filter @fiber-reliability/sdk pack:check
corepack pnpm build:lab
corepack pnpm typecheck
corepack pnpm test
git diff --check
```

## Publish SDK To npm

The SDK package is prepared for a public scoped npm release.

Before publishing, replace the placeholder repository metadata in `packages/sdk/package.json` with the final GitHub repository URL.

```bash
cd packages/sdk
npm publish --access public
```

The package publishes built JavaScript and declarations from `dist/`. The package does not publish test files or source fixtures.

## Deploy Lab To Netlify Free

Netlify can deploy this repository as a static Vite site.

Use these settings:

- Build command: `corepack pnpm build:lab`
- Publish directory: `packages/lab/dist`
- Node version: `22`

The included `netlify.toml` defines those values.

## Safety Notes

- The hosted Lab uses mocked fixture data by default.
- Do not expose a public Fiber RPC endpoint from the hosted demo.
- Do not add RPC credentials, tokens, private keys, or node URLs to the frontend bundle.
- Local/operator-provided RPC should stay private and explicit.

## Manual Checks

After deployment:

- Open the Netlify URL on desktop and mobile.
- Select several failure stories.
- Refresh with `?scenario=<id>` and confirm the same scenario remains selected.
- Confirm the data mode banner still says mocked fixture data is the default.
- Inspect the browser bundle/config for secrets before sharing the public URL.
