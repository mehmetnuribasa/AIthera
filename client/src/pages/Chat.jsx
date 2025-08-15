import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import profilePhoto from '../assets/profilePhoto.png';

const AssistantAvatar = () => (
  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-600">AI</div>
);

const UserAvatar = () => (
  <img className="w-8 h-8 rounded-full object-cover scale-160" src={profilePhoto} alt="You" />
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
            ? 'bg-[var(--color-secondary)] text-slate-100 rounded-br-md'
            : 'bg-slate-100 text-slate-500 rounded-bl-md'
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

const formatMessage = (message) => {
    const lines = message.split('\n'); 
    return lines.map((line, index) => {
        // extract bold text
        const parts = line.split(/(\*\*[^\*]+\*\*)/g);
        return (
            <span key={index}>
            {parts.map((part, i) => {
                if (/^\*\*[^\*]+\*\*$/.test(part)) {
                    return <b key={i}>{part.slice(2, -2)}</b>;
                }
                return part;
            })}
            <br />
            </span>
        );
    });
};

const Chat = () => {
    const [searchParams] = useSearchParams();
    const sessionNumber = useMemo(() => Number(searchParams.get('s') || 1), [searchParams]);
    const [messages, setMessages] = useState([]);
    const [sessionInfo, setSessionInfo] = useState(null);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [closed, setClosed] = useState(false);
    const [canSend, setCanSend] = useState(true);
    const [remainingTime, setRemainingTime] = useState(null);
    const listRef = useRef(null);


    useEffect(() => {
        let mounted = true; // Track if component is mounted

        const bootstrap = async () => {
            // Fetch session details
            let current = null;
            try {
                const sessionsRes = await axiosInstance.get('/sessions');

                const allSessions = Array.isArray(sessionsRes.data) ? sessionsRes.data : sessionsRes.data?.sessions || [];
                current = allSessions.find((s) => Number(s.session_number) === Number(sessionNumber)) || null;

                console.log('Current session:', current);

                if (mounted) setSessionInfo(current);
            } catch (error) {
                console.error('Failed to fetch sessions:', error);
                return;
            }

            // Fetch past messages
            try {
                const msgRes = await axiosInstance.get(`/sessions/messages/${current.id}`);

                const sessionMessages = msgRes.data.messages ? msgRes.data.messages : [];

                console.log('Session messages:', sessionMessages);

                if (mounted && sessionMessages.length > 0) {
                    setMessages(
                        sessionMessages.map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', text: m.message }))
                    );
                }
                
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        };

        bootstrap();

        return () => {
            mounted = false;
        };

    }, [sessionNumber])

    
    useEffect(() => {
        let mounted = true; // Track if component is mounted

        const checkStatus = async () => {
            try {
                // Decide behavior based on status
                const status = sessionInfo?.status;

                if (status === 'completed') {
                    if (mounted) {
                        setClosed(true);
                        setCanSend(false);
                    }
                    return;
                }

                else if (status === 'in_queue' && messages.length === 0) {
                    // Start the session to get welcome message
                    try {
                        setIsLoading(true);

                        const res = await axiosInstance.post('/ai/start-session', { sessionNumber });
                        setMessages([{ role: 'assistant', text: res.data.message }]);
                        setCanSend(true);

                        if (!mounted) return;

                    } catch (err) {
                        const alreadyStarted = err?.response?.status === 400;
                        if (!alreadyStarted) {
                            alert(err?.response?.data?.message || 'Failed to start session');
                        }
                    } finally {
                        setIsLoading(false);
                    }
                }
                
                else if (status === 'in_progress') {
                    setCanSend(true);
                }
                
                else if(status === 'not_started') {
                    setCanSend(false);
                }
            } catch (error) {
                console.error('Error during bootstrap:', error);
            }
        };

        checkStatus();

        return () => {
            mounted = false;
        };

    }, [sessionInfo, messages]);


    // Scroll to bottom on new messages
    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);
    

    useEffect(() => {
        if (!sessionInfo?.start_time) return;

        const startTime = new Date(sessionInfo.start_time).getTime();
        const endTime = startTime + 45 * 60 * 1000; // 45 minutes
        const interval = setInterval(() => {
            const now = Date.now();
            const timeLeft = Math.max(0, endTime - now); // Prevent negative time
            setRemainingTime(timeLeft);

            if (timeLeft === 0) {
                clearInterval(interval);
            }
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [sessionInfo, sessionNumber]);

    const sendMessage = async () => {
        if (!checkInput()) return;

        const userMsg = { role: 'user', text: input.trim() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await axiosInstance.post('/ai/chat', { sessionNumber, message: userMsg.text });
            const assistantText = res.data.message;
            setMessages((prev) => [...prev, { role: 'assistant', text: assistantText }]);
            
            const isClosed = Boolean(res.data.closed);
            if (isClosed) {
                setClosed(true);
                setCanSend(false);
            }
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to send message');
        } finally {
            setIsLoading(false);
        }
    };

    const checkInput = () => {
        if (!input.trim() || isLoading || closed || !canSend) return false;

        if (input.length > 500) {
            alert('Message is too long');
            return false;
        }

        if(input.length < 25) {
            alert('Message is too short');
            return false;
        }

        return true;
    };

    return (
        <div className="min-h-screen flex flex-col items-center pt-20">
        <div className="w-full max-w-5xl">
            <div className="mb-5 flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-500">Session {sessionNumber}</h1>
                    {sessionInfo?.topic && (
                      <p className="text-slate-400 text-sm mt-1">{sessionInfo.topic}</p>
                    )}
                </div>
                <div className='flex space-x-5'>
                    {remainingTime !== null && !closed && (
                        <p className="text-slate-400 text-sm font-semibold mt-1">
                            Time left: {Math.floor(remainingTime / 60000)}:{Math.floor((remainingTime % 60000) / 1000).toString().padStart(2, '0')}
                        </p>
                    )}
                    {remainingTime === 0 && !closed && (
                        <p className="text-slate-400 text-sm font-semibold mt-1">
                            Time's up! One last message.
                        </p>
                    )}
                    {closed ? (
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-2 rounded-full">Completed</span>
                    ) : (
                        <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-3 py-2 rounded-full">In Progress</span>
                    )}
                </div>
            </div>

            <div ref={listRef} className="h-[65vh] overflow-y-auto p-4">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center text-slate-400 mt-20 text-lg">No messages yet</div>
                )}
                {messages.map((m, idx) => (
                    <ChatMessage key={idx} role={m.role} text={formatMessage(m.text)} />
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
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && input.length >= 25) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    placeholder={closed ? 'Session completed' : (canSend ? 'Type your message...' : 'Read-only')}
                    disabled={isLoading || closed || !canSend}
                    className={`flex-1 px-4 py-3 rounded-full outline-none text-slate-500 ${
                    closed || !canSend ? 'bg-slate-50 cursor-not-allowed' : 'bg-slate-100'
                    }`}
                />
                <button
                    onClick={sendMessage}
                    disabled={isLoading || closed || !canSend || !input.trim() || input.length < 25}
                    className={`px-5 py-3 rounded-full font-semibold text-white transition ${
                    isLoading || closed || !canSend || !input.trim() || input.length < 25
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