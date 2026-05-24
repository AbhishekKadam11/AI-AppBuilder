// src/app/nebular-textarea/services/html-sanitizer.service.ts
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Whitelist of allowed tags and attributes.
 * Extend this if you need extra elements (e.g., <video>, <details>, …).
 */
const ALLOWED_TAGS = new Set([
  'b', 'strong', 'i', 'em', 'u', 'a', 'u', 'img',
  'code', 'pre', 'xmp', 'span', 'br', 'hr',
  'ul', 'ol', 'li', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'table', 'tr', 'td', 'th',
]);

const ALLOWED_ATTR = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title'],
  code: ['class'],
  pre: ['class'],
  span: ['class'],
  br: [],
};

@Injectable({ providedIn: 'root' })
export class HtmlSanitizerService {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Returns a SafeHtml object that can be bound with [innerHTML] safely.
   * Anything not explicitly whitelisted will be removed.
   */
  sanitize(html: string): SafeHtml {
    // 1️⃣ Create a temporary DIV to let the browser parse the markup.
    const temp = document.createElement('div');
    temp.innerHTML = html;
    // 2️⃣ Walk the tree and remove disallowed nodes/attributes.
    this.removeDisallowedNodes(temp);
    // 3️⃣ Return a new SafeHtml.
    return this.sanitizer.bypassSecurityTrustHtml(temp.innerHTML);
  }

  /** Recursively walk the element tree and prune unwanted nodes. */
  private removeDisallowedNodes(root: HTMLElement): void {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode(node) {
          const element = node as Element;
          const tag = element.tagName.toLowerCase();
          // Disallowed tag → detach it (but keep its text content)
          if (!ALLOWED_TAGS.has(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          // Check attributes for each tag
          //@ts-ignore
          const allowed = ALLOWED_ATTR[tag] ?? [];
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            if (!allowed.includes(attr.name)) {
              element.removeAttribute(attr.name);
            }
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    let node: Node | null;
    while ((node = walker.nextNode())) {
      // The walker already filtered tags, so we only need to trim empty elements.
      if (!node.hasChildNodes()) {
        //@ts-ignore
        node?.remove();
      }
    }
  }
}
