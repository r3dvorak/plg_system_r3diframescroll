# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog.

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
