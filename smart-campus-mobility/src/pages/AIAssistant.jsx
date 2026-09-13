import { useState, useRef, useEffect } from 'react';
import { useMobility } from '../context/MobilityContext';
import { answerAssistantQuestion } from '../services/mockAI';

const SUGGESTED = [
  'Which bus should I take to Block C?',
  'Is there a delay on Route R1?',
  'When is the next bus to the Library?',
  'Which route is fastest right now?',
];

export default function AIAssistant() {
  const { buses, routes, incidents } = useMobility();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm your Campus Mobility Assistant. Ask me which bus to take, when it will arrive, or what's happening on your route.",
    },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const answer = answerAssistantQuestion(trimmed, { buses, routes, incidents });
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmed },
      { role: 'assistant', text: answer },
    ]);
    setInput('');
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <p className="text-sm font-semibold text-brand-blue">AI-powered</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
          Campus Mobility Assistant
        </h1>
        <p className="mt-2 text-slate-500">
          Ask me which bus to take, when it will arrive, or what's happening on your route.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTED.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-navy-800 shadow-soft transition hover:border-brand-blue hover:text-brand-blue"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex h-[420px] flex-col rounded-3xl border border-slate-200 bg-white shadow-card">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed animate-fadeSlideIn ${
                  m.role === 'user'
                    ? 'bg-navy-900 text-white'
                    : 'bg-slate-100 text-navy-900'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-3 border-t border-slate-100 p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a bus, route, or delay..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
          />
          <button
            type="submit"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white transition hover:bg-blue-600"
            aria-label="Send"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
