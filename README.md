# Your Project's Title...
Your project's description...

## Environments
- Preview: https://main--eds-training--sanjeevkalwar.aem.page/
- Live: https://main--eds-training--sanjeevkalwar.aem.live/

## Documentation

Before using the aem-boilerplate, we recommend you to go through the documentation on https://www.aem.live/docs/ and more specifically:
1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Block library for DA.live

Open [the block library](http://localhost:3000/tools/block-library/index.html) with the
local AEM proxy running. It provides copyable authoring tables for Cards, Columns,
Hero, and Fragment, plus live previews of the visual blocks using this project's
code and styles. No build step or runtime dependencies are required.

1. Select a block and click **Copy block table**. Paste into a DA.live document in
   **Content** view, not into source/code view. If clipboard access is denied,
   select and copy the entire displayed table manually.
2. Replace the sample content. Images must remain accessible to readers; upload
   your production images through DA.live rather than relying on localhost URLs.
   The included sample artwork is in [sample.svg](tools/block-library/sample.svg).
3. To enable **Tools > Blocks**, follow the library page's setup tables: create the
   four block documents in DA.live, create the `/library/blocks` sheet with `name`
   and `path` columns, then add its content URL to the project configuration's
   `library` tab. Keep existing library configuration entries.
4. Save the documents, sheet, and configuration. **Preview both the four library
   documents and the library sheet** so the new editor's preview service sees
   the latest content. Publishing to the live site is not required for this step.
5. Enable **New Authoring** to use Experience Workspace, then open a document in
   **Content** view. Open the right-hand **Outline** panel, click the three-dot
   menu next to a section, and choose **Add block**. Expand a block and click its
   **Add ... to page** button to insert the example.

The section menu's **Add block** option requires a configured Blocks library.
If it is missing, check the project configuration's `library` tab. If the picker
shows old entries or empty examples, preview the updated library sheet and
documents, then reload the editor. The folder `/library/blocks/` holds the example
documents; the sheet `/library/blocks.json` indexes them. They are separate,
required resources, not duplicates.

The [catalog](tools/block-library/blocks.json) targets
`sanjeevkalwar/eds-training`. Its paths intentionally point to `content.da.live`,
not GitHub or the editor. Git files alone do **not** create DA.live content or
activate the native picker. If you reuse this library for another content project,
update the catalog paths and the configuration row shown on the library page.

Once deployed, the reference page is available at
`https://main--eds-training--sanjeevkalwar.aem.page/tools/block-library/index.html`.
Deploy the code before copying sample image URLs from that host for other authors.
Header/Footer are page infrastructure; Widget requires separately implemented
widget assets. These are not insertable samples in this library.

See [Adobe's library setup guide](https://www.aem.live/docs/ew/administering/set-up-library)
for the content-side configuration.

## Local development

1. Create a new repository based on the `aem-boilerplate` template
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `eds-training` directory in your favorite IDE and start coding :)
