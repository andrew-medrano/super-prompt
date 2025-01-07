import axios from "axios";
import { FileTreeNode } from "../types/prompt";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

interface FileContent {
  content: string;
  token_count: number;
}

interface FileContentResponse {
  content: FileContent;
}

interface CwdResponse {
  path: string;
}

export async function getCwd(): Promise<CwdResponse> {
  const response = await api.get<CwdResponse>("/files/cwd");
  return response.data;
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
}

export async function listFiles() {
  const response = await api.get("/files/list");
  return response.data;
}

export async function getFileContent(filePath: string): Promise<FileContentResponse> {
  const response = await api.get<FileContentResponse>(`/files/content/${encodeURIComponent(filePath)}`);
  return response.data;
}

export async function deleteFile(filePath: string) {
  const response = await api.delete(`/files/${encodeURIComponent(filePath)}`);
  return response.data;
}

export async function compilePrompt(promptData: any) {
  const response = await api.post("/prompts/compile", promptData);
  return response.data;
}

export async function getSuggestions(promptData: any): Promise<string[]> {
  const response = await api.post("/prompts/suggestions", promptData);
  return response.data;
}

export async function getDirectoryTree(directoryPath: string): Promise<FileTreeNode> {
  const encodedPath = encodeURIComponent(directoryPath);
  const response = await api.get<FileTreeNode>(`/files/tree/${encodedPath}`);
  return response.data;
}

export async function browseDirectory(directoryPath: string = "") {
  const path = directoryPath ? encodeURIComponent(directoryPath) : "";
  const response = await api.get(`/files/browse/${path}`);
  return response.data;
}