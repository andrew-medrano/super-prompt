import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getCwd = async () => {
    const response = await api.get('/files/cwd');
    return response.data;
};

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const listFiles = async () => {
    const response = await api.get('/files/list');
    return response.data;
};

export const getFileContent = async (filePath) => {
    const response = await api.get(`/files/content/${filePath}`);
    return response.data.content;
};

export const deleteFile = async (filePath) => {
    const response = await api.delete(`/files/${filePath}`);
    return response.data;
};

export const compilePrompt = async (promptData) => {
    const response = await api.post('/prompts/compile', promptData);
    return response.data;
};

export const getSuggestions = async (promptData) => {
    const response = await api.post('/prompts/suggestions', promptData);
    return response.data;
};

export const getDirectoryTree = async (directoryPath) => {
    const response = await api.get(`/files/tree/${encodeURIComponent(directoryPath)}`);
    return response.data;
};

export const browseDirectory = async (directoryPath = '') => {
    const path = directoryPath ? encodeURIComponent(directoryPath) : '';
    const response = await api.get(`/files/browse/${path}`);
    return response.data;
}; 