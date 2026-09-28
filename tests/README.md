# Tests — mock iCloud HME page + test-extension build

E2E harness for the extension. No external dependencies: plain HTML/CSS/JS mock
served by Python's stdlib http server, extension built with Bun (or Node).

```
tests/
├── mock-icloud/
│   ├── index.html   # top frame: generic iCloud shell (NO HME detection markers)
│   └── app.html     # HME app mock, loaded inside <iframe id="app-frame">
├── build-test-ext.mjs
└── dist-ext/        # generated (gitignore-able); test build of the extension
```

## 1. Serve the mock

```sh
python3 -m http.server 8931 --directory tests/mock-icloud
```

Open `http://127.0.0.1:8931/index.html`. The HME UI lives in the same-origin
iframe (`app.html`), which reproduces the real iCloud frame structure (and the
dual-overlay bug when the extension is loaded without frame targeting).

## 2. Build the test extension

```sh
bun tests/build-test-ext.mjs        # or: node tests/build-test-ext.mjs
```

Copies `manifest.json`, `content.js`, `popup.html`, `popup.js`, `popup.css`,
`icons/` (if present) into `tests/dist-ext/` and patches **only the copy**:

- `content_scripts[0].matches` += `http://127.0.0.1/*`, `http://localhost/*`
- `host_permissions` += the same two
- `version` += `.1` (must stay a valid dot-separated integer version)

Idempotent (wipes `dist-ext/` first). The last line printed is the absolute
path of `tests/dist-ext` — use it for `--load-extension`.

## 3. Launch Chromium with the extension

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --user-data-dir=/tmp/hme-test-profile \
  --disable-extensions-except=<ABS_PATH>/tests/dist-ext \
  --load-extension=<ABS_PATH>/tests/dist-ext \
  http://127.0.0.1:8931/index.html
```

Replace `<ABS_PATH>` with the repository's absolute path (any Chromium-family
binary works: Chrome, Chromium, Chrome for Testing). A dedicated
`--user-data-dir` keeps runs deterministic and isolates `chrome.storage.local`.

## 4. Open the popup as a tab

Find the extension id at `chrome://extensions` (developer mode), then open:

```
chrome-extension://<id>/popup.html
```

Now you have two tabs: the mock page (content script runs in both top frame
and iframe) and the popup. Drive them with your browser tooling of choice.

## Mock test hooks (inside `app.html` iframe)

Everything is deterministic: fixed dataset, no network, no randomness, no
`alert`/`confirm`/`prompt`. Timing constants: detail panel 200 ms after item
click; commits 300 ms after confirm/save/reactivate; lazy batch 150 ms after
scrolling within 50 px of `#list-scroll` bottom (+4 per section, initial 12,
finite: 25 active / 15 inactive).

Cross-section moves (deactivate/reactivate) always keep the moved `li`
observable: the destination section's render window grows to cover the item's
new sorted position, so `__rendered` may exceed the scroll-driven window after
a move. Delete shrinks the source window when the removed row was rendered.

| Hook | Meaning |
|---|---|
| `window.__mock.items()` | deep copy of all items `{email, label, section}` |
| `window.__mock.clicks` / `window.__clicks` | same array; records `{type:'item'\|'save'\|'deactivate'\|'delete'\|'reactivate', email, label?}` before async work |
| `window.__mock.failNext(n)` / `window.__failNext` | next `n` confirmed commits become silent no-ops (modal closes, nothing changes) |
| `window.__mock.setLabel(email, label)` | direct model write + resort |
| `window.__mock.rendered` / `window.__rendered` | live `{active, inactive}` rendered (lazy-load) counts |
| `window.__mock.reset()` | restore initial dataset, rendered windows, clicks, failNext |
| `window.__state.pending` | label state, updated **only** via `input` event on `#label-input` (framework-like: direct `.value =` without dispatching `input` leaves it stale — use the native setter + `input` event) |
| `hme:saved` | `CustomEvent` on `document` after a successful save commit, `detail: {email, label}` |

Key DOM ids/classes the tests seed selectors against: `#list-scroll`,
`#active-section`/`#active-count`/`#active-list`, `#inactive-section`/
`#inactive-count`/`#inactive-list`, `#forward-to`, `li.hme-item`
(`data-email`, `data-section`) with `.hme-label`/`.hme-email`/`.hme-date`,
`#detail-panel` (`.hidden` toggles) with `#detail-email`, `#detail-label`,
`#label-input`, `#note-input`, `#btn-save`, `#btn-copy`, `#btn-deactivate`,
`#btn-delete`, `#btn-reactivate`, `#confirm-modal` (`.hidden`) with
`#confirm-text`, `#btn-confirm`, `#btn-cancel`. `Escape` closes the modal,
otherwise hides the detail panel. Items are always sorted alphabetically by
label (then email) within each section; counts in the `<h2>`s update live.

Detection contract: the iframe contains `<h1>Hide My Email</h1>`; the **top
frame intentionally contains none** of the HME markers (`hide my email`,
`e-postamı gizle`, `active email address`, `inactive email address`,
`aktif e-posta`), so frame detection must select only the iframe.

## 5. E2E automation notes (verified on Chrome for Testing 150)

- Headless works: `--headless=new` loads unpacked extensions fine.
- **`--enable-unsafe-extension-debugging` is required** for automation: without
  it, DevTools/CDP evaluation on `chrome-extension://` pages lands in an
  isolated world where `chrome.*` APIs are invisible (the popup UI itself
  still works — it runs in the main world).
- Extension id of an unpacked extension = first 16 bytes of
  `sha256(<absolute dist-ext path>)`, hex digits mapped `0-f → a-p`.
- Some tooling evaluates iframes in isolated worlds too. Read mock hooks from
  the **top page main world** instead:
  `document.getElementById('app-frame').contentWindow.__clicks` etc.
- For extension pages use raw CDP `Runtime.evaluate` (default execution
  context = main world), e.g. via `page.createCDPSession()`.
- Reloading the mock page changes the iframe's `frameId`; the popup re-targets
  automatically (Reconnect). To send targeted messages manually, parse the
  current id from the popup's connection bar text (`… frame #N`).
- `chrome.runtime.reload()` destroys the popup tab target; prefer restarting
  the browser with the same `--user-data-dir` (storage/training survives).
- Seeding `hmeSelectors_*` / `hmeProtectedEmails` via `chrome.storage.local.set`
  from the popup context is picked up live by content scripts
  (`storage.onChanged`) — no page reload needed.
