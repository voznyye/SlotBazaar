import React from 'react';
import ReactMarkdown from 'react-markdown';
import './MarkdownPage.css';

export default function MarkdownPage({ file }) {
  const [content, setContent] = React.useState('');

  React.useEffect(() => {
    fetch(file)
      .then(res => res.text())
      .then(setContent);
  }, [file]);

  return (
    <div className="markdown-page">
      <div className="markdown-container">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
