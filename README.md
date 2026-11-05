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

## Cloud Manager repository verification

The verification challenge belongs at
[`well-known/adobe/cloudmanager-challenge.txt`](well-known/adobe/cloudmanager-challenge.txt)
in the repository root, not under `blocks/` and not in `.well-known/`.
For Edge Delivery Services, Adobe explicitly requires the path without a leading dot.
After deploying it to `main`, click **Verify** in Cloud Manager.
Keep the Edge Delivery origin set to the site's base URL, not the challenge file URL.
See [Adobe's onboarding instructions](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/using-cloud-manager/edge-delivery-sites/add-edge-delivery-site).

## Block library for DA.live

Open [the block library](http://localhost:3000/tools/block-library/index.html) with the
local AEM proxy running. It provides copyable authoring tables for Cards, Columns,
Hero, Fragment, Dynamic Dog Image, and Nobel Prize Winners, plus live previews
using this project's code and styles. No build step or runtime dependencies are required.

1. Select a block and click **Copy block table**. Paste into a DA.live document in
   **Content** view, not into source/code view. If clipboard access is denied,
   select and copy the entire displayed table manually.
2. Replace the sample content. Images must remain accessible to readers; upload
   your production images through DA.live rather than relying on localhost URLs.
   The included sample artwork is in [sample.svg](tools/block-library/sample.svg).
3. To enable **Tools > Blocks**, follow the library page's setup tables: create the
   example block documents in DA.live, create the `/library/blocks` sheet with `name`
   and `path` columns, then add its content URL to the project configuration's
   `library` tab. Keep existing library configuration entries.
4. Save the documents, sheet, and configuration. **Preview both the library
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

### Dynamic Dog Image

The `dynamic-dog-image` block fetches a single random image from the
[Dog CEO API](https://dog.ceo/dog-api/documentation/random) at
`https://dog.ceo/api/breeds/image/random`. No API key is required. Each page load
fetches an image; **Show another dog** fetches a new random selection (the API may
return the same image). Requests go directly from the visitor's browser to Dog CEO.

Author a one-column table headed **Dynamic Dog Image**, with an optional heading
in the next row, such as **Meet a random dog**. Empty content uses that default.
See the [authoring sample](tools/block-library/samples/dynamic-dog-image.html).
The image is supplied at runtime; do not paste a fixed dog image into the table.

The block announces loading and completion, disables its button while loading,
and shows a **Try again** action if the API or image fails. API and image loads
each have a 15-second timeout. Images are responsive and retain their proportions.
If you add a restrictive Content Security Policy, allow `https://dog.ceo` in
`connect-src` and `https://images.dog.ceo` in `img-src`.

The DA.live library document belongs at `/library/blocks/dynamic-dog-image`.
Add its content URL to the library sheet, save and preview both resources, and
reload the editor. Deploy the new block code before expecting it to render on
hosted previews or published pages; saving DA.live content does not deploy code.

### Nobel Prize Winners

The existing `list-dynamic-artwork` block now uses the
[Nobel Prize API](https://api.nobelprize.org/2.1/laureates?limit=3), replacing the
Art Institute integration. Its technical block name and library document path
are retained so existing authored pages continue to work. The library display
name and rendered heading are **Nobel Prize Winners**.

Each winner appears in a bulleted card with their name linked to the official
Nobel Prize page, birth or founding details when available, and every awarded
prize's category, year, and motivation when supplied by the API. Both people and
organizations are supported. API text is rendered as text, not HTML.

Author a two-column table with a merged heading row **List Dynamic Artwork**:

| Configuration | Value |
| --- | --- |
| Limit | 3 |

Use the [copyable authoring sample](tools/block-library/samples/list-dynamic-artwork.html)
to retain the merged block-name row when pasting into DA.live. Set **Limit**
to any whole number from **0 to 20**. Omitting the row defaults to **3**.
Existing **Count** rows remain supported as an alias for Limit. Use only one
Limit or Count row; empty, nonnumeric, out-of-range, or duplicate settings display
a configuration error instead of silently substituting another number. With
**Limit = 0**, the block retains its heading and displays **No winners selected.**
without making an API request.

The block requests `https://api.nobelprize.org/2.1/laureates?limit={limit}` and
renders exactly the configured number of winners on success. A failed request,
invalid or incomplete response, or 15-second timeout displays an error with a
**Try again** button. No API key is required. Requests are made from the visitor's
browser; a restrictive CSP must allow `https://api.nobelprize.org` in `connect-src`.

Its DA.live library document belongs at `/library/blocks/list-dynamic-artwork`.
Add the document's content URL to the library sheet, save and preview the document
and sheet, then reload the editor. Deploy the block code separately for hosted rendering.

#### Authoring dropdown in DA.live

The [Nobel Winners Settings tool](tools/nobel-winners-settings/index.html) adds an
author-only dropdown with values **0 through 20**. It is not a visitor-facing
control, and the underlying document table remains editable.

After deploying the tool, add this row to the site's DA.live configuration
**library** tab, preserving its existing rows and column order:

| title | path | format | ref | icon | experience |
| --- | --- | --- | --- | --- | --- |
| Nobel Winners Settings | /tools/nobel-winners-settings/index.html | | | | |

Save the configuration and reload the Experience Workspace editor. Open
**Nobel Winners Settings** from the tools panel, click inside a Nobel Prize Winners
block, and choose a number. The tool updates only that block's Limit row using
the DA SDK, retaining other authored rows. An existing Count row becomes Limit.
If the document or block selection changes while an update is pending, the
editor rejects the stale replacement rather than updating the wrong content.
Read-only documents and duplicate Limit/Count rows cannot be changed by this tool.

There is one settings panel, not one shared setting. Every block stores its own
Limit row. With multiple instances, the panel identifies the selected one as
**Editing Nobel Prize Winners 1 of 2**, for example. Selecting the second block
loads that block's value; changing it leaves the first block untouched. The
instance number reflects its current document order, not a permanent identifier.
Moving a block moves its Limit row with it. Unrelated editor updates do not reset
a dropdown choice in progress; changes to the selected block's actual authored
value do refresh the dropdown.

DA.live autosaves the edit. Preview or publish the page to update the website;
changing a dropdown never publishes content automatically. For local testing,
set the configuration row's **ref** to **local**, open the editor with
`?ref=local` before the URL hash, and keep the AEM proxy running.

## Local development

1. Create a new repository based on the `aem-boilerplate` template
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `eds-training` directory in your favorite IDE and start coding :)
