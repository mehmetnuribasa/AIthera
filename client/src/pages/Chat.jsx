import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axios';

const AssistantAvatar = () => (
  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-600">AI</div>
);

const UserAvatar = () => (
  <img className="w-8 h-8 rounded-full object-cover" src="https://i.pravatar.cc/80?img=12" alt="You" />
);

const ChatMessage = ({ role, text }) => {
  const isUser = role === 'user';
  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="mr-2 self-end"><AssistantAvatar /></div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-[var(--color-primary)] text-white rounded-br-md'
            : 'bg-slate-100 text-slate-700 rounded-bl-md'
        }`}
      >
        {text}
      </div>
      {isUser && (
        <div className="ml-2 self-end"><UserAvatar /></div>
      )}
    </div>
  );
};

const Chat = () => {
    const [searchParams] = useSearchParams();
    const sessionNumber = useMemo(() => Number(searchParams.get('s') || 1), [searchParams]);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStarting, setIsStarting] = useState(true);
    const [closed, setClosed] = useState(false);
    const listRef = useRef(null);

    useEffect(() => {
        let mounted = true; // Track if component is mounted

        const start = async () => {
            try {
                setIsStarting(true);
                const res = await axiosInstance.post('/ai/start-session', { sessionNumber });
                if (!mounted) return;
                setMessages([{ role: 'assistant', text: res.data.message }]);
            } catch (err) {
                const alreadyStarted = err?.response?.status === 400;
                if (!alreadyStarted) {
                alert(err?.response?.data?.message || 'Failed to start session');
                }
            } finally {
                if (mounted) setIsStarting(false);
            }
        };

        start();
        return () => {
            mounted = false;
        };

    }, [sessionNumber]);

    // Scroll to bottom on new messages
    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading || closed) return;

        const userMsg = { role: 'user', text: input.trim() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Send user message to the server
            const res = await axiosInstance.post('/ai/chat', { sessionNumber, message: userMsg.text });
            
            const assistantText = res.data.message;
            const isClosed = Boolean(res.data.closed);
            setMessages((prev) => [...prev, { role: 'assistant', text: assistantText }]);

            if (isClosed) setClosed(true);
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to send message');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col items-center pt-20">
        <div className="w-full max-w-5xl">
            <div className="mb-10 flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-500">Session {sessionNumber}</h1>
                    <p className="text-slate-400 text-sm">Therapeutic conversation tailored to today's topic</p>
                </div>
                {closed ? (
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-2 rounded-full">Completed</span>
                ) : (
                    <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-3 py-2 rounded-full">In progress</span>
                )}
            </div>

            <div ref={listRef} className="h-[60vh] overflow-y-auto p-4">
                {messages.length === 0 && !isStarting && (
                    <div className="text-center text-slate-400 mt-20 text-lg">No messages yet</div>
                )}
                {messages.map((m, idx) => (
                    <ChatMessage key={idx} role={m.role} text={m.text} />
                ))}
                {isLoading && (
                    <div className="w-full flex justify-start mb-4">
                    <div className="mr-2 self-end"><AssistantAvatar /></div>
                    <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-md px-4 py-3 text-sm shadow-sm">Typing…</div>
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={closed ? 'Session completed' : 'Type your message...'}
                    disabled={isLoading || closed}
                    className={`flex-1 px-4 py-3 rounded-full outline-none text-slate-500 ${
                    closed ? 'bg-slate-200 cursor-not-allowed' : 'bg-slate-50'
                    }`}
                />
                <button
                    onClick={sendMessage}
                    disabled={isLoading || closed || !input.trim()}
                    className={`px-5 py-3 rounded-full font-semibold text-white transition ${
                    isLoading || closed || !input.trim()
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] hover:cursor-pointer'
                    }`}
                >
                    Send
                </button>
            </div>
        </div>
        </div>
    );
};

export default Chat;