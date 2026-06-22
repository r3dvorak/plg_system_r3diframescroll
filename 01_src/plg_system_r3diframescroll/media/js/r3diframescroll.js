(function () {
  "use strict";

  var options = (window.Joomla && typeof window.Joomla.getOptions === "function")
    ? window.Joomla.getOptions("plg_system_r3diframescroll", {})
    : {};

  var selector = options.selector || 'iframe[src*="edoobox.com"], iframe[id^="edoobox_"], iframe[name^="edooboxFrame_"]';
  var storageKey = options.storageKey || "r3d_iframescroll_target";
  var scrollOffset = Number.isFinite(options.scrollOffset) ? options.scrollOffset : 80;
  var scrollDelay = Number.isFinite(options.scrollDelay) ? options.scrollDelay : 500;
  var smoothScroll = options.smoothScroll !== false;
  var requireUserInteraction = options.requireUserInteraction !== false;
  var restoreAfterPageReload = options.restoreAfterPageReload !== false;
  var scrollOnIframeLoad = options.scrollOnIframeLoad !== false;
  var listenPostmessage = options.listenPostmessage === true;
  var allowedMessageOrigins = Array.isArray(options.allowedMessageOrigins) ? options.allowedMessageOrigins : [];
  var yoothemeMode = typeof options.yoothemeMode === "string" ? options.yoothemeMode : "auto";
  var debugEnabled = options.debug === true;
  var pageUrl = options.pageUrl || (window.location.pathname + window.location.search);
  var boundFrames = new WeakSet();
  var frameTimers = new WeakMap();
  var state = {
    pendingTarget: null,
    restoreConsumed: false
  };

  function debug() {
    if (!debugEnabled || typeof console === "undefined" || typeof console.log !== "function") {
      return;
    }

    var args = Array.prototype.slice.call(arguments);
    args.unshift("[R3D Iframe Scroll]");
    console.log.apply(console, args);
  }

  function getFrames() {
    try {
      return Array.prototype.slice.call(document.querySelectorAll(selector));
    } catch (error) {
      debug("Invalid iframe selector.", selector, error);
      return [];
    }
  }

  function getFrameIndex(frame) {
    return getFrames().indexOf(frame);
  }

  function getFrameMeta(frame) {
    return {
      id: frame.id || "",
      name: frame.getAttribute("name") || "",
      src: frame.getAttribute("src") || "",
      index: Math.max(0, getFrameIndex(frame)),
      pageUrl: pageUrl,
      interacted: true,
      storedAt: Date.now()
    };
  }

  function readStorage() {
    try {
      return window.sessionStorage ? window.sessionStorage.getItem(storageKey) : null;
    } catch (error) {
      debug("Reading sessionStorage failed.", error);
      return null;
    }
  }

  function writeStorage(payload) {
    try {
      if (window.sessionStorage) {
        window.sessionStorage.setItem(storageKey, JSON.stringify(payload));
      }
    } catch (error) {
      debug("Writing sessionStorage failed.", error);
    }
  }

  function removeStorage() {
    try {
      if (window.sessionStorage) {
        window.sessionStorage.removeItem(storageKey);
      }
    } catch (error) {
      debug("Removing sessionStorage failed.", error);
    }
  }

  function parseStoredPayload() {
    var raw = readStorage();

    if (!raw || typeof raw !== "string") {
      return null;
    }

    try {
      var payload = JSON.parse(raw);

      if (!payload || payload.pageUrl !== pageUrl) {
        debug("Ignoring stored iframe target for another page.", payload);
        removeStorage();
        return null;
      }

      return payload;
    } catch (error) {
      debug("Stored iframe target could not be parsed.", error);
      removeStorage();
      return null;
    }
  }

  function getPendingTarget() {
    if (state.pendingTarget) {
      return state.pendingTarget;
    }

    state.pendingTarget = parseStoredPayload();
    return state.pendingTarget;
  }

  function setPendingTarget(payload, reason) {
    state.pendingTarget = payload;
    state.restoreConsumed = false;
    writeStorage(payload);
    debug("Stored iframe target.", reason, payload);
  }

  function clearPendingTarget(reason) {
    if (state.pendingTarget) {
      debug("Clearing iframe target.", reason, state.pendingTarget);
    }

    state.pendingTarget = null;
    state.restoreConsumed = false;
    removeStorage();
  }

  function isSameFrame(frame, payload) {
    if (!frame || !payload) {
      return false;
    }

    if (payload.id && frame.id === payload.id) {
      return true;
    }

    if (payload.name && frame.getAttribute("name") === payload.name) {
      return true;
    }

    if (payload.src && (frame.getAttribute("src") || "") === payload.src) {
      return true;
    }

    return Number.isInteger(payload.index) && getFrames()[payload.index] === frame;
  }

  function findMatchingFrame(payload, fallbackFirst) {
    var frames = getFrames();
    var i;

    if (!frames.length) {
      return null;
    }

    if (payload) {
      for (i = 0; i < frames.length; i += 1) {
        if (isSameFrame(frames[i], payload)) {
          return frames[i];
        }
      }
    }

    return fallbackFirst ? frames[0] : null;
  }

  function shouldTreatAsYootheme() {
    if (yoothemeMode === "yes") {
      return true;
    }

    if (yoothemeMode === "no") {
      return false;
    }

    return Boolean(
      document.querySelector(".tm-page, .tm-header, .uk-navbar-sticky, [uk-sticky], [data-uk-sticky]")
    );
  }

  function getDynamicOffset() {
    var extraOffset = 0;

    if (!shouldTreatAsYootheme()) {
      return scrollOffset;
    }

    [
      ".uk-navbar-sticky",
      ".tm-header.uk-sticky-fixed",
      ".tm-headerbar-fixed",
      "[uk-sticky].uk-active",
      "[data-uk-sticky].uk-active"
    ].forEach(function (stickySelector) {
      Array.prototype.slice.call(document.querySelectorAll(stickySelector)).forEach(function (element) {
        var rect = element.getBoundingClientRect();
        var style = window.getComputedStyle(element);

        if (rect.height <= 0 || style.display === "none" || style.visibility === "hidden") {
          return;
        }

        extraOffset = Math.max(extraOffset, Math.ceil(rect.height));
      });
    });

    return scrollOffset + extraOffset;
  }

  function scrollToFrame(frame, reason) {
    if (!frame) {
      return false;
    }

    var effectiveOffset = getDynamicOffset();
    var targetTop = frame.getBoundingClientRect().top + window.scrollY - effectiveOffset;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: smoothScroll ? "smooth" : "auto"
    });

    debug("Scrolled to iframe.", reason, {
      targetTop: Math.max(0, targetTop),
      effectiveOffset: effectiveOffset,
      frame: getFrameMeta(frame)
    });

    return true;
  }

  function scheduleScroll(frame, reason, clearAfterScroll) {
    if (!frame) {
      return;
    }

    var existingTimer = frameTimers.get(frame);

    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    var timer = window.setTimeout(function () {
      frameTimers.delete(frame);

      if (scrollToFrame(frame, reason) && clearAfterScroll) {
        clearPendingTarget(reason);
      }
    }, scrollDelay);

    frameTimers.set(frame, timer);
    debug("Scheduled iframe scroll.", reason, getFrameMeta(frame));
  }

  function rememberFrame(frame, reason) {
    setPendingTarget(getFrameMeta(frame), reason);
  }

  function attemptPageRestore(reason, fallbackFirst) {
    if (!restoreAfterPageReload || state.restoreConsumed) {
      return;
    }

    var payload = getPendingTarget();

    if (!payload) {
      return;
    }

    var frame = findMatchingFrame(payload, fallbackFirst);

    if (!frame) {
      debug("No iframe found for page restore yet.", reason, payload);
      return;
    }

    state.restoreConsumed = true;
    scheduleScroll(frame, reason, true);
  }

  function handleIframeLoad(frame) {
    if (!scrollOnIframeLoad) {
      return;
    }

    var payload = getPendingTarget();

    debug("Observed iframe load.", {
      frame: getFrameMeta(frame),
      payload: payload,
      scrollY: window.scrollY
    });

    if (requireUserInteraction) {
      if (!payload || !isSameFrame(frame, payload)) {
        debug("Skipping iframe-load restore because no prior interaction matched.", getFrameMeta(frame));
        return;
      }
    } else if (!payload) {
      payload = getFrameMeta(frame);
      setPendingTarget(payload, "iframe-load-no-interaction-required");
    }

    scheduleScroll(frame, "iframe-load", false);
  }

  function bindFrame(frame) {
    if (boundFrames.has(frame)) {
      return;
    }

    boundFrames.add(frame);

    ["pointerenter", "mouseenter", "touchstart", "focusin"].forEach(function (eventName) {
      frame.addEventListener(eventName, function () {
        rememberFrame(frame, eventName);
      }, { passive: true });
    });

    frame.addEventListener("load", function () {
      handleIframeLoad(frame);
    });

    debug("Bound iframe.", getFrameMeta(frame));
  }

  function bindAllFrames() {
    var frames = getFrames();

    if (!frames.length) {
      debug("No matching iframes found for selector.", selector);
      return false;
    }

    frames.forEach(bindFrame);
    return true;
  }

  function observeMutations() {
    if (typeof MutationObserver !== "function" || !document.documentElement) {
      return;
    }

    var observer = new MutationObserver(function () {
      bindAllFrames();
      attemptPageRestore("mutation-restore", true);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function setupPostMessageDebug() {
    if (!listenPostmessage) {
      return;
    }

    window.addEventListener("message", function (event) {
      if (allowedMessageOrigins.length && allowedMessageOrigins.indexOf(event.origin) === -1) {
        debug("Ignored postMessage from disallowed origin.", event.origin);
        return;
      }

      debug("postMessage received.", {
        origin: event.origin,
        data: event.data
      });
    });
  }

  function scheduleAdditionalScans() {
    [500, 1500, 3000].forEach(function (delay) {
      window.setTimeout(function () {
        bindAllFrames();
        attemptPageRestore("delayed-scan-" + String(delay), true);
      }, delay);
    });
  }

  function init(reason) {
    bindAllFrames();
    attemptPageRestore(reason || "init", true);
  }

  setupPostMessageDebug();
  observeMutations();
  scheduleAdditionalScans();
  init("immediate");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init("dom-content-loaded");
    }, { once: true });
  } else {
    init("dom-already-ready");
  }
}());
