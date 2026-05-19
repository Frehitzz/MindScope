/*
  ======= frontend controller and ui for that chatbot feature =========
  this code do these things:
  - renders the floating chatdbot btn
  - opens and closes the drawer
  - stores chat history in react state
  - stores the current question text
  - sends the user questionto the backend through aiService.askQuestion()
  - appends the AI answer or error message back into the chat
*/
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { LoaderCircle, Send, X } from 'lucide-react';

import { aiService } from '../../api/ai';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  // true when the error is a rate-limit so the UI can show a retry button
  isRateLimit?: boolean;
  resetTime?: number;
};

// stores chat history in react state
// uses reat state initizalized with a welcome mesage
// to store the list of message objects
const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'Hi! I am Cryztynn. Ask me about the MindScope teen mental health',
  },
];

function isRateLimitError(error: unknown) {
  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
      ? error.status
      : null;
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  return (
    status === 429 ||
    message.includes('too many requests') ||
    message.includes('quota exceeded') ||
    message.includes('rate limit') ||
    message.includes('resource has been exhausted') ||
    /\b429\b/.test(message)
  );
}

function RateLimitCountdown({ resetTime, onRetry, loading }: { resetTime?: number, onRetry: () => void, loading: boolean }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (resetTime) {
      const remaining = Math.max(0, resetTime * 1000 - Date.now());
      return Math.floor(remaining / 1000);
    }
    return 30 * 60; // 30 minutes fallback
  });

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (timeLeft > 0) {
    return (
      <div className="mt-3 flex items-center justify-center rounded-md border border-amber-500/40 bg-amber-50/80 px-3 py-2 font-body text-xs font-medium text-amber-700">
        Try again in {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onRetry}
      disabled={loading}
      className="
        mt-3 flex items-center gap-1.5 rounded-md border border-sage/40 bg-sage-light
        px-3 py-1.5 font-body text-xs font-medium text-sage-dark
        transition-colors duration-200 hover:bg-sage/20 disabled:cursor-not-allowed disabled:opacity-50
      "
    >
      <LoaderCircle size={12} className={loading ? 'animate-spin' : ''} />
      Retry
    </button>
  );
}

export function ChatbotDrawer() {
  // opens and closes the drawer, trigger to open onClick={() => setOpen(true)
  const [open, setOpen] = useState(false);
  // inside ChatbotDrawer component:
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  // stores the current question text
  // text input from the textarea is bound to the question state
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([
    'Does social media affect depression?',
    'Average sleep time for teens?',
    'Screen time vs anxiety levels'
  ]);
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

    await sendQuestion(trimmedQuestion);
  };

  // extracted so the retry button can call it directly with the same question
  const sendQuestion = async (trimmedQuestion: string) => {
    const userMessage: ChatMessage = {
      /* Random Universally Unique Identifier
        - a built-in function, that generates a highly unique random
          string of characters everytime you call it
       why do we use:
        1. every message needs a unique id, that will use for rendering,
            when reats renders a list of items using a loop like
            "messages.map(...)"
      */
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedQuestion,
    };

    //apeends the users question
    setMessages((current) => [...current, userMessage]);
    setQuestion('');
    setLastQuestion(trimmedQuestion);
    setLoading(true);

    try {
      // sends the user question to the backend through aiService.askQuestion()
      const result = await aiService.askQuestion(trimmedQuestion);
      // appends the ai answer on success
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.answer,
        },
      ]);

      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
      }
    } catch (error) {
      const isRateLimit = isRateLimitError(error);
      const errorMessage = error instanceof Error ? error.message : '';
      const resetTime = error !== null && typeof error === 'object' && 'resetTime' in error && typeof (error as any).resetTime === 'number' ? (error as any).resetTime : undefined;

      // appends a friendly message instead of the raw error
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          isRateLimit,
          resetTime,
          content: isRateLimit
            ? errorMessage || "You have reached the limit of 10 questions per 30 minutes. Please wait a while before asking more to prevent API abuse."
            : 'Sorry, I could not answer that right now. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ======================================
        RENDERS THE FLOATING CHATBOT BUTTON
      ====================================== */}
      {/* trigger the state setOpen */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          fixed bottom-6 right-6 z-40 flex h-30 w-30 items-center justify-center rounded-full
          transition-all duration-300 hover:-translate-y-1 hover:scale-105 drop-shadow-lg hover:drop-shadow-xl
          focus:outline-none focus:ring-4 focus:ring-sage/25
        "
        aria-label="Open dataset chatbot"
      >
        <img src="/images/mindscope_floating_icon.png" alt="Cryztynn Chatbot" className="h-full w-full object-contain" />
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
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full">
                  <img src="/images/mindyy_logo.png" alt="Cryztynn Logo" className="h-full w-full object-cover drop-shadow-sm" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-medium text-forest">Cryztynn</h2>
                  <p className="truncate font-body text-xs text-text-muted">Answers from the cleaned MindScope data</p>
                </div>
              </div>
              {/* close drawer chatbot */}
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
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
                      <img src="/images/mindyy_logo.png" alt="Cryztynn" className="h-full w-full object-cover scale-[1.7] drop-shadow-sm" />
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
                    {/* retry button / countdown — only shows on rate-limit error messages */}
                    {message.isRateLimit && (
                      <RateLimitCountdown
                        resetTime={message.resetTime}
                        loading={loading}
                        onRetry={() => {
                          setMessages((current) => current.filter((m) => m.id !== message.id));
                          void sendQuestion(lastQuestion);
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
                    <img src="/images/mindyy_logo.png" alt="Cryztynn" className="h-full w-full object-cover scale-[1.7] drop-shadow-sm" />
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-mist-light bg-card px-4 py-3 text-sm text-text-muted shadow-card">
                    <LoaderCircle size={16} className="animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-mist-light bg-card px-4 pt-3 pb-1">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      if (!loading) void sendQuestion(suggestion);
                    }}
                    disabled={loading}
                    className="
                      rounded-full border border-mist-light bg-cream px-3 py-1.5 text-left font-body text-xs text-forest
                      transition-colors duration-200 hover:border-sage hover:bg-sage-light hover:text-sage-dark
                      disabled:cursor-not-allowed disabled:opacity-50
                    "
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card p-4 pt-2">
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
