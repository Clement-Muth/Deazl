"use client";

import DOMPurify from "isomorphic-dompurify";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export const RichTextDisplay = ({ content, className = "" }: RichTextDisplayProps) => {
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "h2", "h3", "ul", "ol", "li", "img"],
    ALLOWED_ATTR: ["src", "alt", "class"]
  });

  return (
    <div
      className={`prose prose-sm sm:prose dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};
