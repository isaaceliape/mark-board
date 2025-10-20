import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownPreviewProps {
  content: string
  className?: string
}

export function MarkdownPreview({
  content,
  className = '',
}: MarkdownPreviewProps) {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 text-gray-700 dark:text-gray-300">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="ml-4">{children}</li>,
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              )
            }
            return (
              <code className="block bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded overflow-x-auto text-sm font-mono">
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="mb-3 overflow-x-auto">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300 mb-3">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-gray-300 dark:border-gray-600">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-gray-900 dark:text-gray-100 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-4 border-gray-300 dark:border-gray-600" />
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900 dark:text-gray-100">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-700 dark:text-gray-300">
              {children}
            </em>
          ),
          del: ({ children }) => (
            <del className="line-through text-gray-500 dark:text-gray-400">
              {children}
            </del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
