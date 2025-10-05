import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * MarkdownRenderer - A secure and Tailwind-optimized markdown renderer
 * Uses react-markdown with full Tailwind CSS support
 */
const MarkdownRenderer = ({ 
  content, 
  className = "",
  allowRawHTML = false 
}) => {
  if (!content) {
    return null;
  }

  const components = {
    // Headings with Tailwind classes
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 mt-8 first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-6">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-5">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 mt-4">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2 mt-3">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 mt-3">
        {children}
      </h6>
    ),

    // Paragraphs
    p: ({ children }) => (
      <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </p>
    ),

    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="pl-2">{children}</li>
    ),

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic">
        {children}
      </blockquote>
    ),

    // Code blocks with syntax highlighting
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : 'text';

      return !inline && match ? (
        <div className="relative mb-4">
          <div className="bg-gray-900 dark:bg-gray-800 rounded-t-lg px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
            {language}
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: '0.5rem',
              borderBottomRightRadius: '0.5rem'
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code 
          className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono" 
          {...props}
        >
          {children}
        </code>
      );
    },

    // Links
    a: ({ children, href, title }) => (
      <a 
        href={href} 
        title={title}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),

    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-50 dark:bg-gray-800">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </tbody>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
        {children}
      </td>
    ),

    // Horizontal rule
    hr: () => (
      <hr className="my-8 border-gray-300 dark:border-gray-600" />
    ),

    // Images
    img: ({ src, alt, title }) => (
      <img 
        src={src} 
        alt={alt} 
        title={title}
        className="max-w-full h-auto rounded-lg mb-4"
      />
    ),

    // Strong/Bold
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900 dark:text-gray-100">
        {children}
      </strong>
    ),

    // Emphasis/Italic
    em: ({ children }) => (
      <em className="italic">{children}</em>
    )
  };

  const remarkPlugins = [remarkGfm];
  const rehypePlugins = allowRawHTML ? [rehypeRaw] : [];

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={components}
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;