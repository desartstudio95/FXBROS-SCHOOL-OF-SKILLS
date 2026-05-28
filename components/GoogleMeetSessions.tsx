import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Video, Calendar, Loader2, AlertCircle } from 'lucide-react';

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
  const { workspaceSettings } = useApp();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const { googleApiKey, googleCalendarId } = workspaceSettings;
      
      if (!googleApiKey || !googleCalendarId) {
         setError('Configurações não encontradas. O Administrador precisa configurar a Chave de API e o ID do calendário.');
         return;
      }

      setLoading(true);
      setError(null);
      try {
        const timeMin = new Date().toISOString();
        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(googleCalendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&singleEvents=true&orderBy=startTime&key=${googleApiKey}`
        );
        if (!res.ok) {
           const errorData = await res.json().catch(() => null);
           console.error("Calendar API Error:", errorData);
           if (res.status === 403) {
             throw new Error('Falha de permissão. Verifique se o calendário está definido como "Público" e se a API Key tem as permissões corretas do Google Calendar API.');
           } else if (res.status === 400 || res.status === 404) {
             throw new Error('Requisição inválida. Verifique se a API Key e o ID do calendário estão corretos.');
           }
           throw new Error('Falha ao carregar sessões agendadas.');
        }
        const data = await res.json();
        
        // Filter out events that have a Google Meet link (hangoutLink)
        const meetEvents = (data.items || []).filter((event: CalendarEvent) => !!event.hangoutLink);
        setEvents(meetEvents);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Erro desconhecido ao carregar as sessões.');
      } finally {
         setLoading(false);
      }
    };

    fetchEvents();
  }, [workspaceSettings]);

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

  if (error) {
    return (
      <div className="flex flex-col items-center py-20 animate-fadeIn">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Sessões Temporariamente Indisponíveis</h2>
        <p className="text-slate-400 mb-6 text-center max-w-sm">
          {error}
        </p>
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
