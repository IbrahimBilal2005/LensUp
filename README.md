# LensUp — ready for GitHub and Render

**Upload the entire contents of this `prototype` folder to a GitHub repository.**

Your GitHub repository should contain `public`, `package.json`, `render.yaml`, `verify.mjs`, `preview.mjs`, and this README at its top level. You do not need any sibling folders from the coursework workspace.

## Deploy on Render

Create a **Static Site** connected to that GitHub repository:

| Setting | Value |
| --- | --- |
| Root Directory | Leave blank |
| Build Command | `npm run build` |
| Publish Directory | `public` |

Alternatively, create a Render Blueprint from the included `render.yaml`. Configuration reference: https://render.com/docs/blueprint-spec

The deployed root URL opens the updated prototype and account setup. No query parameters are needed. Browser refresh preserves the current screen. No backend, environment variables, or start command is needed on Render.

If you upload the **whole coursework workspace** instead, set Root Directory to `prototype`. The recommended approach is uploading only this folder's contents.

## Local preview

Requires Node.js. No dependencies need installing.

```sh
npm run build
npm run dev
```

Open http://localhost:3181. `npm run build` verifies that the static app, embedded images, and local fonts are complete.

## What is included

```text
public/                 The only folder Render publishes
  index.html            Updated prototype entry point
  app.js                Interactive screens and flows
  styles.css            Layout, components, branding
  fonts.css             Local font definitions
  asset-data.js         Bundled photographs and logos
  assets/fonts/         Fonts and their licenses
render.yaml             Render Static Site configuration
package.json            Build verification and local preview commands
verify.mjs              Checks required files and assets
preview.mjs             Local static preview server
```

All UI is HTML/CSS with individual vector icons. Photographs and logos are embedded. Accounts, progress, and community posts are simulated and saved in each visitor's browser; there is no cross-user backend.

## Future changes

This folder works independently of the original workspace. You can edit the files in `public` directly and push changes to GitHub.

Within the full coursework workspace, the editable development source and tests remain in `mockup`. After editing there, refresh this deployment package with:

```sh
cd mockup
npm run package
```

Packaging replaces the generated files in `prototype/public` with the latest `mockup` version. It does not deploy or push anything. Do not edit both copies independently.
