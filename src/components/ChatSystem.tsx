import { useState, useEffect, useRef } from 'react';
import { Send,MessageSquare , X, Paperclip, Image, File } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  attachments?: {
    url: string;
    type: string;
    name: string;
  }[];
}

interface ChatSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSystem({ isOpen, onClose }: ChatSystemProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Subscribe to new messages
      const channel = supabase
        .channel('chat_messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, attachments(*)')
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async () => {
    if (!files.length) return [];

    const attachments = [];
    setUploading(true);

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(filePath);

        attachments.push({
          url: publicUrl,
          type: file.type,
          name: file.name
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }

    setUploading(false);
    setFiles([]);
    return attachments;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !files.length) || !user || uploading) return;

    try {
      const attachments = await uploadFiles();

      const message = {
        sender_id: user.id,
        sender_name: user.email?.split('@')[0] || 'Anonymous',
        content: newMessage.trim(),
        attachments
      };

      const { error } = await supabase
        .from('messages')
        .insert([message]);

      if (error) throw error;

      setNewMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:w-auto sm:max-w-2xl h-[90vh] sm:h-[600px] rounded-t-lg sm:rounded-lg flex flex-col">
        <div className="p-3 sm:p-4 border-b flex justify-between items-center bg-indigo-600 text-white rounded-t-lg">
        <div className="p-3 sm:p-4 border-b flex justify-between items-center bg-indigo-600 text-white rounded-t-lg">
  <div className="flex items-center space-x-2"> {/* Wrap icon & text in a div */}
    <MessageSquare className="h-5 w-5 text-white" /> {/* ADD THIS LINE at ~line 159 */}
    <h3 className="font-semibold">Team Chat</h3>
  </div>
  <button onClick={onClose} className="text-white hover:text-gray-200">
    <X className="h-5 w-5" />
  </button>
</div>

          <h3 className="font-semibold">Team Chat</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.sender_id === user?.id ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender_id === user?.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm font-medium mb-1">{message.sender_name}</p>
                {message.content && (
                  <p className="text-sm">{message.content}</p>
                )}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center">
                        {attachment.type.startsWith('image/') ? (
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="max-w-xs rounded"
                            />
                          </a>
                        ) : (
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center space-x-2 ${
                              message.sender_id === user?.id
                                ? 'text-white'
                                : 'text-indigo-600'
                            }`}
                          >
                            <File className="h-4 w-4" />
                            <span className="text-sm underline">
                              {attachment.name}
                            </span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {format(new Date(message.created_at), 'HH:mm')}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-3 sm:p-4 border-t">
          <div className="space-y-2">
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded px-2 py-1 text-xs sm:text-sm flex items-center"
                  >
                    {file.type.startsWith('image/') ? (
                      <Image className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : (
                      <File className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    )}
                    <span className="truncate max-w-[120px] sm:max-w-[150px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_, i) => i !== index))}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-gray-300 px-3 sm:px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}