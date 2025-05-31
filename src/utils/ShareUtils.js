// Dream Sharing Utilities – compressed & URL‑safe
// ---------------------------------------------------
// Install dependency first:
//     npm i lz-string
// ---------------------------------------------------
// This module replaces the old Base‑64 approach with LZ‑String’s
// URI‑component compression, reducing very large dream entries to
// ~25–40 % of their original size while remaining fully URL‑safe.
// Keys are also minified to keep the raw JSON small before
// compression.

import {
    compressToEncodedURIComponent as compress,
    decompressFromEncodedURIComponent as decompress,
} from "lz-string";

class ShareUtils {
  /* --------------------------------------------------------
   * Configurable limits
   * ------------------------------------------------------*/
  static MAX_URL_LENGTH = 4000; // safe across browsers / chat apps
  static MAX_CONTENT_LENGTH = 30000; // before forced truncation

  /* --------------------------------------------------------
   * Public API
   * ------------------------------------------------------*/

  /**
   * Encode a dream object into a URL‑safe compressed string
   * @param {Object} dream – full dream entity
   * @returns {string|null} compressed token or null on error
   */
  static encodeDream(dream) {
    try {
      // Step 1: strip to essentials + minify keys
      const shareable = this.#toShareable(dream);
      // Step 2: stringify & compress (already URI‑safe)
      return compress(JSON.stringify(shareable));
    } catch (err) {
      console.error("ShareUtils.encodeDream failed →", err);
      return null;
    }
  }

  /**
   * Decode a compressed token back to a dream object
   * @param {string} token – value from URL ?shared=
   * @returns {Object|null} fully restored dream or null
   */
  static decodeDream(token) {
    try {
      const json = decompress(token);
      if (!json) return null;
      const shareable = JSON.parse(json);
      const dream = this.#fromShareable(shareable);
      return this.validateSharedDream(dream) ? dream : null;
    } catch (err) {
      console.error("ShareUtils.decodeDream failed →", err);
      return null;
    }
  }

  /**
   * Build a complete shareable URL for a dream.
   * If content is too large, will (optionally) truncate.
   */
  static generateShareUrl(dream, allowTruncation = true) {
    let candidate = dream;
    let truncated = false;
    let validation = this.validateShareSize(candidate);

    if (!validation.canShare && allowTruncation) {
      candidate = this.createTruncatedDream(dream);
      validation = this.validateShareSize(candidate);
      truncated = true;
    }

    if (!validation.canShare) {
      return {
        url: null,
        wasTruncated: truncated,
        validationResult: validation,
      };
    }

    const encoded = this.encodeDream(candidate);
    if (!encoded) {
      return {
        url: null,
        wasTruncated: truncated,
        validationResult: { canShare: false, reason: "Encoding failed" },
      };
    }

    const baseUrl = window.location.origin + window.location.pathname;
    return {
      url: `${baseUrl}?shared=${encoded}`,
      wasTruncated: truncated,
      validationResult: validation,
    };
  }

  /* --------------------------------------------------------
   * Size checks & truncation helpers
   * ------------------------------------------------------*/

  static validateShareSize(dream) {
    const token = this.encodeDream(dream);
    if (!token) return { canShare: false, reason: "encode failed" };

    const fullLength =
      (window.location.origin + window.location.pathname + "?shared=").length +
      token.length;

    if (fullLength > this.MAX_URL_LENGTH) {
      return {
        canShare: false,
        reason: "Dream too big for URL",
        estimatedLength: fullLength,
        maxLength: this.MAX_URL_LENGTH,
      };
    }
    return { canShare: true };
  }

  static createTruncatedDream(dream, maxContentLength = 15000) {
    const copy = { ...dream };
    if (copy.content && copy.content.length > maxContentLength) {
      copy.content =
        copy.content.substring(0, maxContentLength) +
        "\n\n[Content truncated – open in app for full text]";
    }
    if (!this.validateShareSize(copy).canShare && copy.analysis) {
      copy.analysis = "[Analysis truncated – open in app for full text]";
    }
    return copy;
  }

  /* --------------------------------------------------------
   * Validation
   * ------------------------------------------------------*/

  static validateSharedDream(d) {
    return (
      d &&
      typeof d.title === "string" &&
      typeof d.content === "string" &&
      typeof d.mood === "string" &&
      Array.isArray(d.tags) &&
      typeof d.createdAt === "string"
    );
  }

  /* --------------------------------------------------------
   * Clipboard & navigation helpers (unchanged)
   * ------------------------------------------------------*/

  static async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-999999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      console.error("copyToClipboard failed →", e);
      return false;
    }
  }

  static navigateToMainApp() {
    const url = new URL(window.location);
    url.searchParams.delete("shared");
    window.history.pushState({}, "", url.toString());
    window.dispatchEvent(new CustomEvent("navigationChange"));
  }

  static isSharedUrl() {
    return new URLSearchParams(window.location.search).has("shared");
  }

  static getSharedDreamFromUrl() {
    const code = new URLSearchParams(window.location.search).get("shared");
    return code ? this.decodeDream(code) : null;
  }

  static formatShareDate(iso) {
    const date = new Date(iso);
    return isNaN(date)
      ? "Unknown date"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  }

  static getMoodEmoji(mood) {
    return (
      {
        wonderful: "🌟",
        peaceful: "😌",
        neutral: "😐",
        strange: "🤔",
        scary: "😨",
        sad: "😢",
      }[mood] || "😐"
    );
  }

  /* --------------------------------------------------------
   * Internal helpers – key minification
   * ------------------------------------------------------*/

  static #toShareable(dream) {
    return {
      v: "1", // share format version
      t: dream.title,
      c: dream.content,
      m: dream.mood,
      g: dream.tags || [],
      d: dream.createdAt,
      a: dream.analysis ?? null,
    };
  }

  static #fromShareable(s) {
    return {
      title: s.t,
      content: s.c,
      mood: s.m,
      tags: s.g,
      createdAt: s.d,
      analysis: s.a,
      shareVersion: s.v,
    };
  }
}

export default ShareUtils;
