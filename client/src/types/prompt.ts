export interface SystemPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onFileTreeChange: (includeTree: boolean) => void;
}

export interface PromptMetadataProps {
  fileCount: number;
  systemPromptCount: number;
  totalTokens: number;
}

export interface PresetPrompt {
  name: string;
  prompt: string;
}

export type PresetPrompts = Record<string, PresetPrompt>;

export interface ContentBlockProps {
  title: string;
  content: string;
  tokenCount: number;
  type?: 'file' | 'system' | undefined;
  onRemove?: () => void;
}

export interface SelectedFile {
  path: string;
  content: string;
  tokenCount?: number;
  name?: string;
  extension?: string;
}

export interface CompiledPromptProps {
  prompt: string;
  metadata?: string;
}

export interface FileTreeNode {
  type: "file" | "directory";
  name: string;
  path: string;
  extension?: string;
  children?: FileTreeNode[];
}

export interface FileTreeItemProps {
  item: FileTreeNode;
  level?: number;
  onFileClick: (item: FileTreeNode) => void;
  selectedFiles: SelectedFile[];
}

export interface FileSelectorProps {
  onFilesChange: (files: SelectedFile[]) => void;
} 