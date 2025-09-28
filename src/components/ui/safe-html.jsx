"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

/**
 * SafeHtml component that sanitizes HTML content before rendering
 * This prevents XSS attacks by filtering out potentially dangerous HTML/JS
 */
export function SafeHtml({ 
  html, 
  className, 
  as: Component = "div",
  allowedTags,
  allowedAttributes,
  ...props 
}) {
  const sanitizedHtml = useMemo(() => {
    if (!html || typeof html !== "string") {
      return "";
    }

    // Configure DOMPurify options
    const config = {
      // Allow common formatting tags and attributes
      ALLOWED_TAGS: allowedTags || [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'td', 'th',
        'div', 'span'
      ],
      ALLOWED_ATTR: allowedAttributes || [
        'href', 'title', 'alt', 'src', 'width', 'height',
        'class', 'id', 'style',
        'target', 'rel'
      ],
      // Remove scripts and dangerous content
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'frame'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
      // Allow data URLs for images but be cautious
      ALLOW_DATA_ATTR: false,
      // Keep relative URLs
      ALLOW_UNKNOWN_PROTOCOLS: false,
      // Sanitize URL protocols
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    };

    return DOMPurify.sanitize(html, config);
  }, [html, allowedTags, allowedAttributes]);

  if (!sanitizedHtml) {
    return null;
  }

  return (
    <Component
      className={cn(className)}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      {...props}
    />
  );
}

/**
 * Utility function to sanitize HTML string without rendering
 */
export function sanitizeHtml(html, options = {}) {
  if (!html || typeof html !== "string") {
    return "";
  }

  const config = {
    ALLOWED_TAGS: options.allowedTags || [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'td', 'th',
      'div', 'span'
    ],
    ALLOWED_ATTR: options.allowedAttributes || [
      'href', 'title', 'alt', 'src', 'width', 'height',
      'class', 'id', 'style',
      'target', 'rel'
    ],
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'frame'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  };

  return DOMPurify.sanitize(html, config);
}