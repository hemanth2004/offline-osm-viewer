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
            // Get all .md files from both directories
            const rootMdFiles = import.meta.glob('/public/*.md', { as: 'raw' });
            const guidesMdFiles = import.meta.glob('/public/Guides/*.md', { as: 'raw' });

            // Combine and process all files
            const allMdFiles = { ...rootMdFiles, ...guidesMdFiles };

            const filesContent = await Promise.all(
                Object.entries(allMdFiles).map(async ([path, loader]) => {
                    const content = await loader();
                    const fileName = path.split('/').pop().replace('.md', '');
                    // Remove leading number and any separator (- or _)
                    const title = fileName.replace(/^\d+[-_]?\s*/, '');

                    return {
                        title: title,
                        content: content
                    };
                })
            );

            // Sort files by their original filename (which includes the number)
            const sortedFiles = filesContent.sort((a, b) => {
                const aNum = parseInt(a.title.match(/^\d+/)?.[0] || '0');
                const bNum = parseInt(b.title.match(/^\d+/)?.[0] || '0');
                return aNum - bNum;
            });

            setMarkdownFiles(sortedFiles);
        };

        loadMarkdownFiles();
        console.log(markdownFiles);
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
                                    blockquote: ({ node, ...props }) => (
                                        <blockquote
                                            style={{
                                                borderLeft: '4px solid #ccc',
                                                paddingLeft: '1rem',
                                                margin: '1rem 0',
                                                color: '#666'
                                            }}
                                            {...props}
                                        />
                                    ),
                                    code: ({ node, inline, className, children, ...props }) => {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const language = match ? match[1] : '';
                                        return !inline ? (
                                            <div style={{
                                                background: 'rgba(0,0,0,0.1)',
                                                padding: '1rem',
                                                borderRadius: '4px',
                                                marginBottom: '1rem'
                                            }}>
                                                {language && (
                                                    <div style={{
                                                        color: '#666',
                                                        fontSize: '2rem',
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        {language}
                                                    </div>
                                                )}
                                                <code
                                                    style={{
                                                        display: 'block',
                                                        overflowX: 'auto',
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.9rem'
                                                    }}
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            </div>
                                        ) : (
                                            <code
                                                style={{
                                                    background: '#f0f0f0',
                                                    padding: '0.2rem 0.4rem',
                                                    borderRadius: '4px',
                                                    fontFamily: 'monospace'
                                                }}
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    }
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


