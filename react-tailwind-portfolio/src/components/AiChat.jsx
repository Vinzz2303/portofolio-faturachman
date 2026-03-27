import React, { useMemo, useState } from 'react';

const formatCurrency = (value, currency) =>
  new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);

const safeNumber = value => (typeof value === 'number' && !Number.isNaN(value) ? value : null);

const AiChat = ({ summary, meta, disabled }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hai! Saya bisa membantu menjelaskan ringkasan investasi dan data pasar terbaru.'
    }
  ]);

  const insight = useMemo(() => {
    const antam = meta?.instruments?.ANTAM;
    const sp500 = meta?.instruments?.SP500;
    return { antam, sp500 };
  }, [meta]);

  const buildReply = text => {
    const lower = text.toLowerCase();
    const antam = insight.antam;
    const sp500 = insight.sp500;

    if (!summary) {
      return 'Ringkasan data belum tersedia. Pastikan server investasi sudah berjalan.';
    }

    if (lower.includes('antam') || lower.includes('emas')) {
      if (antam?.error) {
        return `Data Antam belum tersedia: ${antam.error}.`;
      }
      if (safeNumber(antam?.latestPrice) == null) {
        return 'Data Antam belum lengkap untuk saat ini.';
      }
      const change = safeNumber(antam?.delta) ?? 0;
      const direction = change >= 0 ? 'naik' : 'turun';
      return `Emas Antam ${direction} ke ${formatCurrency(antam.latestPrice, 'IDR')}. Perubahan ${change >= 0 ? '+' : '-'}${Math.abs(change)} dari ${antam.previousDate} ke ${antam.latestDate}.`;
    }

    if (lower.includes('sp') || lower.includes('s&p') || lower.includes('s&p 500')) {
      if (sp500?.error) {
        return `Data S&P 500 belum tersedia: ${sp500.error}.`;
      }
      if (safeNumber(sp500?.latestPrice) == null) {
        return 'Data S&P 500 belum lengkap untuk saat ini.';
      }
      const change = safeNumber(sp500?.delta) ?? 0;
      const direction = change >= 0 ? 'naik' : 'turun';
      return `S&P 500 ${direction} ke ${formatCurrency(sp500.latestPrice, 'USD')}. Perubahan ${change >= 0 ? '+' : '-'}${Math.abs(change)} dari ${sp500.previousDate} ke ${sp500.latestDate}.`;
    }

    if (lower.includes('ringkasan') || lower.includes('summary') || lower.includes('utama')) {
      return summary;
    }

    return `Berikut ringkasan singkat: ${summary}`;
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || disabled) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    const reply = buildReply(text);
    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">AI Assistant</h3>
        <span className="rounded-full border border-gray-700 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-gray-400">
          Live Insight
        </span>
      </div>
      <p className="mt-3 text-sm text-gray-400">
        Tanyakan ringkasan, tren Antam, atau S&amp;P 500 untuk memahami kondisi pasar.
      </p>

      <div className="mt-6 flex h-72 flex-col gap-3 overflow-hidden rounded-xl border border-gray-800 bg-black bg-opacity-40 p-4">
        <div className="flex flex-1 flex-col gap-3 overflow-auto pr-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'ml-auto bg-gold text-gray-900'
                  : 'bg-dark-bg text-gray-200'
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => (event.key === 'Enter' ? handleSend() : null)}
            placeholder={disabled ? 'Ringkasan belum siap...' : 'Tulis pertanyaan kamu...'}
            className="flex-1 rounded-lg border border-gray-800 bg-dark-bg bg-opacity-60 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled}
            className="border border-gold bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-900 transition hover:bg-transparent hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
