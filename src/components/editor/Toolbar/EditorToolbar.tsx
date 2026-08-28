"use client";

import { Undo2, Redo2, Scissors, Trash2 } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

function ToolButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-9 items-center gap-2 border border-editor-border px-3 text-xs text-white-pure",
        "hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent",
      )}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function EditorToolbar() {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const splitAtPlayhead = useEditorStore((s) => s.splitAtPlayhead);
  const removeClip = useEditorStore((s) => s.removeClip);
  const isDirty = useEditorStore((s) => s.isDirty);

  return (
    <div className="flex items-center gap-2 border-b border-editor-border bg-editor px-3 py-2">
      <ToolButton label={t.editor.actions.undo} onClick={undo} disabled={!canUndo}>
        <Undo2 size={14} aria-hidden />
      </ToolButton>
      <ToolButton label={t.editor.actions.redo} onClick={redo} disabled={!canRedo}>
        <Redo2 size={14} aria-hidden />
      </ToolButton>

      <span className="mx-1 h-5 w-px bg-editor-border" />

      <ToolButton
        label={t.editor.actions.split}
        onClick={splitAtPlayhead}
        disabled={!selectedClipId}
      >
        <Scissors size={14} aria-hidden />
      </ToolButton>
      <ToolButton
        label={t.editor.actions.remove}
        onClick={() => selectedClipId && removeClip(selectedClipId)}
        disabled={!selectedClipId}
      >
        <Trash2 size={14} aria-hidden />
      </ToolButton>

      <span className="tabular ml-auto text-xs text-muted">
        {isDirty ? t.common.saving : t.common.saved}
      </span>
    </div>
  );
}
