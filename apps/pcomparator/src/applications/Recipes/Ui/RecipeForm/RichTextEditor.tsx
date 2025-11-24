"use client";

import { Button } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, ImageIcon, Italic, List, ListOrdered } from "lucide-react";
import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  description?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder, label, description }: RichTextEditorProps) => {
  const { t } = useLingui();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3]
        }
      }),
      Typography,
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4"
        }
      }),
      Placeholder.configure({
        placeholder: placeholder || t`Start typing your description...`
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4"
      }
    }
  });

  const handleImageUpload = async (file: File) => {
    if (!editor) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/v1/recipes/description-image", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch (error) {
      console.error("Image upload error:", error);
      alert(t`Failed to upload image`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      {label && <div className="text-sm font-medium text-foreground">{label}</div>}

      <div className="border-2 border-default-200 rounded-large focus-within:border-primary transition-colors">
        <div className="flex flex-wrap gap-1 p-2 border-b border-divider bg-default-50">
          <Button
            size="sm"
            variant={editor.isActive("bold") ? "solid" : "light"}
            color={editor.isActive("bold") ? "primary" : "default"}
            isIconOnly
            onPress={() => editor.chain().focus().toggleBold().run()}
            aria-label={t`Bold`}
          >
            <Bold className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant={editor.isActive("italic") ? "solid" : "light"}
            color={editor.isActive("italic") ? "primary" : "default"}
            isIconOnly
            onPress={() => editor.chain().focus().toggleItalic().run()}
            aria-label={t`Italic`}
          >
            <Italic className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-divider mx-1" />

          <Button
            size="sm"
            variant={editor.isActive("heading", { level: 2 }) ? "solid" : "light"}
            color={editor.isActive("heading", { level: 2 }) ? "primary" : "default"}
            isIconOnly
            onPress={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            aria-label={t`Heading 2`}
          >
            <Heading2 className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant={editor.isActive("heading", { level: 3 }) ? "solid" : "light"}
            color={editor.isActive("heading", { level: 3 }) ? "primary" : "default"}
            isIconOnly
            onPress={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            aria-label={t`Heading 3`}
          >
            <Heading3 className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-divider mx-1" />

          <Button
            size="sm"
            variant={editor.isActive("bulletList") ? "solid" : "light"}
            color={editor.isActive("bulletList") ? "primary" : "default"}
            isIconOnly
            onPress={() => editor.chain().focus().toggleBulletList().run()}
            aria-label={t`Bullet List`}
          >
            <List className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant={editor.isActive("orderedList") ? "solid" : "light"}
            color={editor.isActive("orderedList") ? "primary" : "default"}
            isIconOnly
            onPress={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label={t`Ordered List`}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-divider mx-1" />

          <Button
            size="sm"
            variant="light"
            color="default"
            isIconOnly
            onPress={() => fileInputRef.current?.click()}
            aria-label={t`Add Image`}
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <EditorContent editor={editor} />
      </div>

      {description && <p className="text-xs text-default-500">{description}</p>}
    </div>
  );
};
