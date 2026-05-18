import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { LoaderCircle, Send, X } from 'lucide-react';

import { aiService } from '../../api/ai';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'Hi! I am Mindyy. Ask me about the MindScope teen mental health',
  },
];

export function ChatbotDrawer() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedQuestion,
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const result = await aiService.askQuestion(trimmedQuestion);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.answer,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: error instanceof Error ? error.message : 'The chatbot could not answer right now.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full
          transition-all duration-300 hover:-translate-y-1 hover:scale-105 drop-shadow-lg hover:drop-shadow-xl
          focus:outline-none focus:ring-4 focus:ring-sage/25
        "
        aria-label="Open dataset chatbot"
      >
        <img src="/images/mindyy_icon.png" alt="Mindyy Chatbot" className="h-full w-full object-contain" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close dataset chatbot"
            className="absolute inset-0 bg-forest/30 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          <aside
            className="
              absolute inset-y-0 right-0 flex w-full max-w-[430px] flex-col border-l border-mist-light
              bg-card shadow-card-hover
            "
            aria-label="Dataset chatbot drawer"
          >
            <div className="flex items-center justify-between gap-3 border-b border-mist-light px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-mist-light bg-sage-light">
                  <img src="/images/mindyy_logo.png" alt="Mindyy Logo" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-medium text-forest">Mindyy</h2>
                  <p className="truncate font-body text-xs text-text-muted">Answers from the cleaned MindScope data</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="
                  flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-mist-light
                  text-text-muted transition-colors duration-200 hover:bg-cream hover:text-forest
                "
                aria-label="Close dataset chatbot"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-cream/60 px-5 py-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-mist-light bg-sage-light shadow-sm">
                      <img src="/images/mindyy_logo.png" alt="Mindyy" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div
                    className={`
                      max-w-[80%] rounded-md px-4 py-3 font-body text-sm leading-6 shadow-card
                      ${message.role === 'user'
                        ? 'bg-forest text-white'
                        : 'border border-mist-light bg-card text-text-body'}
                    `}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-mist-light bg-sage-light shadow-sm">
                    <img src="/images/mindyy_logo.png" alt="Mindyy" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-mist-light bg-card px-4 py-3 text-sm text-text-muted shadow-card">
                    <LoaderCircle size={16} className="animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-mist-light bg-card p-4">
              <div className="flex items-end gap-2">
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask about platform usage, sleep, stress, anxiety..."
                  rows={2}
                  className="
                    min-h-[48px] flex-1 resize-none rounded-md border border-mist-light bg-cream px-3 py-2
                    font-body text-sm text-forest placeholder:text-text-muted
                    focus:outline-none focus:ring-2 focus:ring-sage/30
                  "
                />
                <button
                  type="submit"
                  disabled={!question.trim() || loading}
                  className="
                    flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-sage text-white
                    transition-colors duration-200 hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-50
                  "
                  aria-label="Send question"
                >
                  {loading ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </>
  );
}
