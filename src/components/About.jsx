import './About.css'
import PropTypes from 'prop-types'
import Markdown from 'react-markdown'
import { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

function About({ isOpen, setIsOpen }) {
    const [markdownFiles, setMarkdownFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(0);

    useEffect(() => {
        const loadMarkdownFiles = async () => {
            // Get all .md files from assets directory
            const mdFiles = import.meta.glob('/src/assets/*.md', { as: 'raw' });

            const filesContent = await Promise.all(
                Object.entries(mdFiles).map(async ([path, loader]) => {
                    const content = await loader();
                    const fileName = path.split('/').pop().replace('.md', '');
                    // Remove leading number and any separator (- or _)
                    const title = fileName.replace(/^\d+[-_]?\s*/, '');

                    return {
                        title: title,
                        content: content  // Now content is the raw markdown text
                    };
                })
            );

            setMarkdownFiles(filesContent);
        };

        loadMarkdownFiles();
        console.log(markdownFiles)
    }, []);

    return (
        isOpen && (
            <div className='about'>
                <div className='about-header'>
                    <h1>Guide & About</h1>
                    <button onClick={() => setIsOpen(!isOpen)}>X</button>
                </div>
                <div className='about-main'>
                    <div className='about-main-left'>
                        {markdownFiles.map((file, index) => (
                            <div
                                className={`about-main-left-item ${index === activeFile ? 'about-active' : ''}`}
                                key={index}
                                onClick={() => setActiveFile(index)}
                            >
                                <p>{file.title}</p>
                            </div>
                        ))}
                    </div>
                    <div className='about-main-right'>
                        {markdownFiles[activeFile] && (
                            <Markdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    // Custom components for markdown elements
                                    h1: ({ node, ...props }) => <h1 style={{ marginBottom: '1rem' }} {...props} />,
                                    h2: ({ node, ...props }) => <h2 style={{ marginBottom: '0.8rem' }} {...props} />,
                                    p: ({ node, ...props }) => <p style={{ marginBottom: '1rem' }} {...props} />,
                                    ul: ({ node, ...props }) => <ul style={{ marginBottom: '1rem', marginLeft: '2rem' }} {...props} />,
                                    ol: ({ node, ...props }) => <ol style={{ marginBottom: '1rem', marginLeft: '2rem' }} {...props} />,
                                    li: ({ node, ...props }) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
                                    code: ({ node, inline, ...props }) => (
                                        <code
                                            style={{
                                                background: '#f0f0f0',
                                                padding: inline ? '0.2rem 0.4rem' : '1rem',
                                                borderRadius: '4px',
                                                display: inline ? 'inline' : 'block'
                                            }}
                                            {...props}
                                        />
                                    )
                                }}
                            >
                                {markdownFiles[activeFile].content}
                            </Markdown>
                        )}
                    </div>
                </div>
            </div>
        )
    )
}

About.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired
}

export default About


