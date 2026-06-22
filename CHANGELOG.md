# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog.

## [1.0.8] - 2026-06-22

### Changed

- Replaced the strict `HtmlDocument` class check with a document type check for better Joomla 6 and template compatibility.
- Kept the classic hard-test bootstrap and frontend marker to verify event execution.
- Added a second hard marker before script injection for easier frontend diagnosis.

## [1.0.7] - 2026-06-22

### Changed

- Added a hard fingerprint release for clean uninstall/reinstall verification.
- Added a unique frontend HTML marker for version 1.0.7.
- Appended a version query string to the frontend script URL for easier verification.

## [1.0.6] - 2026-06-22

### Changed

- Added a hard test classic system plugin bootstrap with unconditional frontend marker output.
- Removed frontend parameter gating from the bootstrap to isolate installation and event execution issues.
- Prepared a pure install/bootstrap test build to verify whether Joomla reaches the plugin at all.

## [1.0.4] - 2026-06-22

### Changed

- Switched to a classic Joomla system plugin bootstrap in `r3diframescroll.php`.
- Removed the service-provider based plugin boot path from the install package.
- Simplified frontend script loading to a direct `addScript()` call from the classic plugin class.

## [1.0.3] - 2026-06-22

### Changed

- Fixed system plugin frontend loading by supporting both legacy and service-provider bootstrap paths.
- Centralized frontend asset injection behind a shared loader with duplicate-load protection.
- Added debug markers for plugin event reachability and script initialization.

## [1.0.2] - 2026-06-22

### Changed

- Ensured frontend script loading through a direct document script include.
- Added an optional debug HTML comment to confirm that the plugin event executed.
- Updated plugin metadata for the 1.0.2 test build.

## [1.0.1] - 2026-06-22

### Changed

- Version uptick for the next public test build.
- Metadata and release files aligned for the refreshed package ZIP.
- Fixed frontend asset loading for the plugin JavaScript.
- Replaced the legacy bootstrap class with the correct service-provider bootstrap pattern.
- Added a direct WebAssetManager fallback registration for the frontend script.

## [1.0.0] - 2026-06-22

### Added

- Initial public release of `plg_system_r3diframescroll`.
- Joomla 5/6 system plugin structure with service provider and WebAssetManager integration.
- Frontend-only iframe scroll restore after iframe reload and optional full page reload.
- Configurable selector, storage key, offsets, delays, smooth scroll, interaction requirement, YOOtheme mode, and debug mode.
- German and English language files.
