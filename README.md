# R3D Iframe Scroll

Joomla 5/6 system plugin that restores the page scroll position to the relevant iframe after iframe reloads and optional full page reloads.

## Purpose

External booking or form iframes can trigger a new `load` event during user interaction. In some setups the parent page jumps back to the top while the Joomla page itself does not fully reload. This plugin remembers the last relevant iframe and scrolls back to it after the iframe load.

## Installation

1. Build or use the installable ZIP for `plg_system_r3diframescroll`.
2. Install it in Joomla via `System -> Install -> Extensions`.
3. Enable `System - R3D Iframe Scroll`.

## Activation

The plugin only runs in the frontend. It does not execute in the Joomla administrator.

## Options

- `Frontend enabled`: Enable or disable the plugin on the site frontend.
- `Iframe selector`: CSS selector used to detect matching iframes.
- `Storage key`: Session storage key for the remembered iframe target.
- `Scroll offset`: Offset in pixels above the target iframe.
- `Scroll delay`: Delay before restore attempts after iframe load or page restore.
- `Smooth scroll`: Use smooth browser scrolling.
- `Require user interaction`: Only restore after an iframe was actually touched by the user.
- `Restore after page reload`: Restore the saved iframe target after a full page reload.
- `Scroll on iframe load`: Restore after matching iframe `load` events.
- `Listen to postMessage`: Debug incoming `postMessage` events.
- `Allowed message origins`: Optional allowlist for debugged message origins.
- `YOOtheme mode`: `auto`, `yes`, or `no`.
- `Debug`: Enables browser console logging with the prefix `[R3D Iframe Scroll]`.

## Test With An Edoobox Iframe

Use a matching selector such as:

```css
iframe[src*="edoobox.com"], iframe[id^="edoobox_"], iframe[name^="edooboxFrame_"]
```

Test flow:

1. Open a Joomla frontend page with the iframe.
2. Scroll to the iframe.
3. Interact with the iframe so the plugin can remember it.
4. Trigger an action inside the iframe that causes the iframe to reload.
5. Confirm that the parent page scrolls back to the iframe after the reload.

## Same-Origin Policy

The plugin does not inspect cross-origin iframe contents and cannot detect buttons inside the iframe document itself. It only reacts to interactions on the iframe element, iframe `load`, optional page reload restore, and optional `postMessage` debug logging.

## YOOtheme Note

The plugin works without YOOtheme. In `auto` mode it only uses lightweight heuristics to account for likely sticky header situations and dynamic content timing.

## Debugging

Enable the `Debug` option and inspect the browser console. All logs are prefixed with `[R3D Iframe Scroll]`.
