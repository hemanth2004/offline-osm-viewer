import { useState, useEffect } from 'react';

export const useFileContent = (filePath) => {
    const [content, setContent] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            if (!filePath) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`Failed to fetch file: ${response.statusText}`);
                }
                const text = await response.text();
                setContent(text);
                setError(null);
            } catch (err) {
                console.error('Error fetching file:', err);
                setError(err.message);
                setContent(null);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [filePath]);

    return { content, error, loading };
}; 