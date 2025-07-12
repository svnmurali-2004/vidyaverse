"use client";

import { useState, useEffect } from "react";
import { marked } from "marked";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Heading1,
  Heading2,
  Strikethrough,
  Eye,
  Edit,
  Link,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Simple rich text editor with markdown support and HTML preview
const SimpleRichTextEditor = ({ content, onChange, placeholder, className }) => {
  const [value, setValue] = useState(content || "");
  const [isPreview, setIsPreview] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    // Convert markdown to HTML for preview
    const html = marked(value);
    setHtmlContent(html);
    // Send the raw markdown content to parent, not HTML
    onChange(value);
  }, [value, onChange]);

  useEffect(() => {
    setValue(content || "");
  }, [content]);

  const insertText = (before, after = "") => {
    if (isPreview) return;
    
    const textarea = document.getElementById("rich-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText;
    let newCursorPos;

    if (selectedText) {
      // If text is selected, wrap it
      newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else {
      // If no text selected, insert markers and place cursor between them
      newText = value.substring(0, start) + before + after + value.substring(end);
      newCursorPos = start + before.length;
    }
    
    setValue(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const formatButtons = [
    {
      icon: Bold,
      title: "Bold",
      action: () => insertText("**", "**"),
    },
    {
      icon: Italic,
      title: "Italic", 
      action: () => insertText("*", "*"),
    },
    {
      icon: Strikethrough,
      title: "Strikethrough",
      action: () => insertText("~~", "~~"),
    },
    {
      icon: Code,
      title: "Inline Code",
      action: () => insertText("`", "`"),
    },
    {
      icon: Heading1,
      title: "Heading 1",
      action: () => insertText("# "),
    },
    {
      icon: Heading2,
      title: "Heading 2",
      action: () => insertText("## "),
    },
    {
      icon: List,
      title: "Bullet List",
      action: () => insertText("- "),
    },
    {
      icon: ListOrdered,
      title: "Numbered List", 
      action: () => insertText("1. "),
    },
    {
      icon: Quote,
      title: "Quote",
      action: () => insertText("> "),
    },
    {
      icon: Link,
      title: "Link",
      action: () => insertText("[", "](https://example.com)"),
    },
  ];

  return (
    <div className="border rounded-md">
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex flex-wrap gap-1">
          {formatButtons.map((button, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              onClick={button.action}
              className="h-8 w-8 p-0"
              title={button.title}
              disabled={isPreview}
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant={!isPreview ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsPreview(false)}
            className="h-8 px-3"
            title="Edit Mode"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            type="button"
            variant={isPreview ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsPreview(true)}
            className="h-8 px-3"
            title="Preview Mode"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>
      
      <div className="p-0 relative">
        {!isPreview ? (
          <Textarea
            id="rich-textarea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "min-h-[150px] max-h-[400px] border-0 focus-visible:ring-0 resize-none",
              className
            )}
            rows={8}
          />
        ) : (
          <div 
            className={cn(
              "min-h-[150px] max-h-[400px] overflow-y-auto p-4 prose prose-sm max-w-none",
              className
            )}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </div>
      
      <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/30 flex items-center justify-between">
        <span>
          {isPreview 
            ? "Preview mode - showing formatted HTML"
            : "Edit mode - Use markdown syntax (e.g., **bold**, *italic*, # heading)"
          }
        </span>
        <span>
          {value.length} characters
        </span>
      </div>
    </div>
  );
};

// Export the enhanced rich text editor
export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Write something...",
  className 
}) {
  return (
    <SimpleRichTextEditor
      content={content}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
}
