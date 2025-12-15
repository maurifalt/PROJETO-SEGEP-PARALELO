import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, FunctionDeclaration, SchemaType } from "@google/genai";
import { MessageCircle, X, Send, Loader2, Paperclip, FileIcon, Database, Sparkles, Navigation } from 'lucide-react';
import { ChatMessage } from '../types';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';

// IMPORTANT: In a real environment, this should be in process.env.API_KEY
const API_KEY = process.env.API_KEY || ''; 

const SUGGESTIONS = [
  "Quantos professores ativos?",
  "Liste as disciplinas sem professor",
  "Resumo do semestre atual",
  "Leve-me aos relatórios"
];

export const AIAssistant: React.FC = () => {
  const { professors, disciplines, semesters } = useData();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'model',
      text: 'Olá! Sou a IA do SIGEP. Posso analisar dados, tirar dúvidas e navegar pelo sistema para você. Como posso ajudar?',
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{name: string, data: string, mimeType: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setAttachedFile({
          name: file.name,
          data: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;

    if ((!textToSend.trim() && !attachedFile) || !API_KEY) {
        if (!API_KEY) alert("API Key não configurada. Por favor configure a variável de ambiente.");
        return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
      attachmentName: attachedFile?.name
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // 1. Prepare Data Context
      const systemData = {
        professores: professors.map(p => ({
            id: p.id,
            nome: p.name,
            email: p.email,
            titulacao: p.titulation,
            area: p.area,
            cargaMaxima: p.maxWorkload,
            ativo: p.active,
            qtdDocumentos: p.documents.length
        })),
        disciplinas: disciplines,
        semestres: semesters.map(s => ({
            nome: s.name,
            status: s.status,
            inicio: s.startDate,
            fim: s.endDate,
            ofertas: s.offerings.map(o => {
                const discName = disciplines.find(d => d.id === o.disciplineId)?.name || 'Desconhecida';
                const profName = professors.find(p => p.id === o.professorId)?.name || 'Pendente';
                return {
                    disciplina: discName,
                    professor: profName,
                    cargaHoraria: o.workload
                };
            })
        }))
      };

      // 2. Define Tools
      const navigationTool: FunctionDeclaration = {
        name: "navigateTo",
        description: "Navegar para uma página específica do sistema. Use isso quando o usuário pedir para ir, abrir ou ver uma tela.",
        parameters: {
          type: "OBJECT" as any, // Cast to any to avoid strict enum mismatch in some versions
          properties: {
            page: {
              type: "STRING" as any,
              enum: ["dashboard", "professors", "disciplines", "semesters", "reports"],
              description: "A página de destino."
            }
          },
          required: ["page"]
        }
      };

      // 3. Build History & Contents
      // We explicitly construct the history for the API to maintain context
      const historyContents = messages
        .filter(m => m.id !== '0') // Skip welcome message in API history usually
        .map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

      const currentParts = [];
      if (textToSend) currentParts.push({ text: textToSend });
      if (attachedFile) {
        currentParts.push({
            inlineData: {
                mimeType: attachedFile.mimeType,
                data: attachedFile.data
            }
        });
        setAttachedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }

      const contents = [
        ...historyContents,
        { role: 'user', parts: currentParts }
      ];

      const ai = new GoogleGenAI({ apiKey: API_KEY });
      
      const systemInstruction = `
        Você é o assistente inteligente do sistema SIGEP (Gestão de Professores UEMA).
        
        DADOS DO SISTEMA (Json):
        ${JSON.stringify(systemData)}

        INSTRUÇÕES:
        1. Responda baseando-se nos DADOS DO SISTEMA.
        2. Seja prestativo e direto.
        3. Se o usuário pedir para ir a algum lugar, use a ferramenta 'navigateTo'.
        4. Mantenha o contexto da conversa.
      `;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
            tools: [{ functionDeclarations: [navigationTool] }],
        }
      });

      // Handle Function Calls
      const functionCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall);
      
      let aiResponseText = response.text || "";

      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
            if (call?.name === 'navigateTo') {
                const page = call.args?.['page'] as string;
                const routes: Record<string, string> = {
                    'dashboard': '/',
                    'professors': '/professors',
                    'disciplines': '/disciplines',
                    'semesters': '/semesters',
                    'reports': '/reports'
                };
                if (routes[page]) {
                    navigate(routes[page]);
                    aiResponseText = `Navegando para ${page}... Algo mais?`;
                }
            }
        }
      }

      if (!aiResponseText) aiResponseText = "Comando processado.";

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiResponseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Erro na IA:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Desculpe, tive um problema ao processar isso. Verifique a chave de API ou tente novamente.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto bg-slate-800 rounded-2xl shadow-2xl w-80 sm:w-96 h-[550px] mb-4 flex flex-col border border-slate-700 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Sparkles size={16} className="text-yellow-300" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Assistente SIGEP</h3>
                <p className="text-[10px] text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Gemini Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-900 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-700 text-slate-200 border border-slate-600 rounded-bl-none'
                }`}>
                  {msg.attachmentName && (
                    <div className="flex items-center gap-1 text-xs opacity-90 mb-1 border-b border-white/20 pb-1">
                      <FileIcon size={12} />
                      Arquivo: {msg.attachmentName}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 p-3 rounded-2xl rounded-bl-none border border-slate-600 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-xs text-slate-400">Processando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length < 3 && !isLoading && (
            <div className="px-4 pb-2 bg-slate-900 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <div className="flex gap-2">
                    {SUGGESTIONS.map((s, i) => (
                        <button 
                            key={i}
                            onClick={() => handleSend(s)}
                            className="text-xs bg-slate-800 text-blue-300 border border-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-700 hover:border-blue-500/50 transition flex items-center gap-1"
                        >
                            <Sparkles size={10} /> {s}
                        </button>
                    ))}
                </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-slate-800 border-t border-slate-700">
             {attachedFile && (
                <div className="flex items-center justify-between bg-slate-700 px-3 py-1 rounded text-xs mb-2 text-slate-300 border border-slate-600">
                    <span className="flex items-center gap-1"><FileIcon size={12}/> {attachedFile.name}</span>
                    <button onClick={() => { setAttachedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}>
                        <X size={12} />
                    </button>
                </div>
             )}
            <div className="flex items-center gap-2">
              <button 
                className="text-slate-400 hover:text-blue-400 transition p-1 hover:bg-slate-700 rounded"
                onClick={() => fileInputRef.current?.click()}
                title="Anexar arquivo para análise"
              >
                <Paperclip size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect}
                accept=".pdf,image/png,image/jpeg,image/webp" 
              />
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua dúvida..." 
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isLoading || (!inputText.trim() && !attachedFile)}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg shadow-blue-900/40 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center group border border-blue-500"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};