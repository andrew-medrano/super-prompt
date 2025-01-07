import React from 'react';
import {
    Code as CodeIcon,
    Description as TextIcon,
    Image as ImageIcon,
    DataObject as JsonIcon,
    Terminal as ShellIcon,
    Style as CssIcon,
    Html as HtmlIcon,
    Javascript as JavaScriptIcon,
    IntegrationInstructions as TypeScriptIcon,
    Article as MarkdownIcon,
    Terminal as PythonIcon,
} from '@mui/icons-material';

const FileIcon = ({ extension }) => {
    const getIcon = () => {
        switch (extension.toLowerCase()) {
            case 'js':
                return <JavaScriptIcon sx={{ fontSize: '1.2rem', color: '#F0DB4F' }} />;
            case 'jsx':
                return <JavaScriptIcon sx={{ fontSize: '1.2rem', color: '#61DAFB' }} />;
            case 'ts':
                return <TypeScriptIcon sx={{ fontSize: '1.2rem', color: '#3178C6' }} />;
            case 'tsx':
                return <TypeScriptIcon sx={{ fontSize: '1.2rem', color: '#61DAFB' }} />;
            case 'json':
                return <JsonIcon sx={{ fontSize: '1.2rem', color: '#F0DB4F' }} />;
            case 'py':
                return <PythonIcon sx={{ fontSize: '1.2rem', color: '#3776AB' }} />;
            case 'md':
                return <MarkdownIcon sx={{ fontSize: '1.2rem', color: '#083fa1' }} />;
            case 'txt':
                return <TextIcon sx={{ fontSize: '1.2rem', color: '#6C6C6C' }} />;
            case 'sh':
            case 'bash':
                return <ShellIcon sx={{ fontSize: '1.2rem', color: '#4EAA25' }} />;
            case 'css':
                return <CssIcon sx={{ fontSize: '1.2rem', color: '#264DE4' }} />;
            case 'html':
                return <HtmlIcon sx={{ fontSize: '1.2rem', color: '#E34F26' }} />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'svg':
                return <ImageIcon sx={{ fontSize: '1.2rem', color: '#FF9800' }} />;
            default:
                return <CodeIcon sx={{ fontSize: '1.2rem', color: '#6C6C6C' }} />;
        }
    };

    return getIcon();
};

export default FileIcon; 