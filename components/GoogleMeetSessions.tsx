import React, { useState, useEffect } from 'react';
import { googleSignIn, getAccessToken } from '../googleAuth';
import { Video, Calendar, Loader2, ExternalLink } from 'lucide-react';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink: string;
  hangoutLink?: string;
}

const GoogleMeetSessions: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(true);

  const fetchEvents = async (token: string) => {
    setLoading(true);
    try {
      const timeMin = new Date().toISOString();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&singleEvents=true&orderBy=startTime`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
         if (res.status === 401) setNeedsAuth(true);
         throw new Error('Failed to fetch calendar events');
      }
      const data = await res.json();
      
      // Filter out events that have a Google Meet link (hangoutLink)
      const meetEvents = (data.items || []).filter((event: CalendarEvent) => !!event.hangoutLink);
      setEvents(meetEvents);
      setNeedsAuth(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAccessToken().then((token) => {
      if (token) {
         fetchEvents(token);
      } else {
         setNeedsAuth(true);
      }
    });
  }, []);

  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        await fetchEvents(result.accessToken);
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const formatDate = (eventStart: { dateTime?: string; date?: string }) => {
    const dateStr = eventStart.dateTime || eventStart.date;
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('pt-BR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (needsAuth) {
    return (
      <div className="flex flex-col items-center py-20 animate-fadeIn">
        <Video size={48} className="text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Conectar Google Meet & Calendário</h2>
        <p className="text-slate-400 mb-6 text-center max-w-sm">
          Conecte sua conta do Google para visualizar e acessar suas sessões ao vivo do Google Meet.
        </p>
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-slate-200 transition-colors"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-5 h-5" />
          Conectar com Google
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn p-4">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Video className="text-green-500" />
        Sessões ao Vivo (Google Meet)
      </h2>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-green-500" size={32} />
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors flex flex-col h-full">
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                   <h3 className="font-bold text-white text-lg line-clamp-2">{event.summary || 'Reunião Sem Título'}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                  <Calendar size={16} />
                  {formatDate(event.start)}
                </div>
              </div>
              <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                 <a 
                   href={event.hangoutLink} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                 >
                   <Video size={18} /> Entrar na Sessão
                 </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-500 border border-slate-800 rounded-xl bg-slate-900/50">
          Nenhuma sessão do Google Meet agendada encontrada.
        </div>
      )}
    </div>
  );
};

export default GoogleMeetSessions;
