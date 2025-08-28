"use client";

import React, { useState, useRef, useEffect } from 'react';

// Speech Recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Moon, Sun, Loader2, BookOpen, RotateCcw, ExternalLink, Play, History, X, Paperclip, FileText, Image as ImageIcon, FileUp, Calculator, Beaker, Globe, Palette, Music, Dumbbell, Users, Brain, ChevronDown, Mic, Volume2, VolumeX, Square, BarChart3, Target, Download, Share2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  attachments?: FileAttachment[];
  subject?: Subject;
}

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  base64?: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  subject?: Subject;
  messageCount: number;
  isActive: boolean;
}

interface StudyStats {
  totalSessions: number;
  totalTime: number;
  averageSessionTime: number;
  mostStudiedSubject: string;
  todayTime: number;
  weekTime: number;
}

interface YouTubeLink {
  url: string;
  videoId: string;
  thumbnail: string;
  title?: string;
}

// Predefined subjects
const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Mathematics', color: 'blue', icon: Calculator },
  { id: 'science', name: 'Science', color: 'green', icon: Beaker },
  { id: 'history', name: 'History', color: 'amber', icon: Globe },
  { id: 'english', name: 'English', color: 'purple', icon: BookOpen },
  { id: 'art', name: 'Art', color: 'pink', icon: Palette },
  { id: 'music', name: 'Music', color: 'indigo', icon: Music },
  { id: 'pe', name: 'Physical Education', color: 'orange', icon: Dumbbell },
  { id: 'social', name: 'Social Studies', color: 'teal', icon: Users },
  { id: 'psychology', name: 'Psychology', color: 'violet', icon: Brain },
  { id: 'general', name: 'General', color: 'gray', icon: BookOpen },
];

// Subject utility functions
const getSubjectColor = (colorName: string, isDarkMode: boolean) => {
  const colors = {
    blue: isDarkMode ? 'text-blue-400 bg-blue-500/20' : 'text-blue-600 bg-blue-100',
    green: isDarkMode ? 'text-green-400 bg-green-500/20' : 'text-green-600 bg-green-100',
    amber: isDarkMode ? 'text-amber-400 bg-amber-500/20' : 'text-amber-600 bg-amber-100',
    purple: isDarkMode ? 'text-purple-400 bg-purple-500/20' : 'text-purple-600 bg-purple-100',
    pink: isDarkMode ? 'text-pink-400 bg-pink-500/20' : 'text-pink-600 bg-pink-100',
    indigo: isDarkMode ? 'text-indigo-400 bg-indigo-500/20' : 'text-indigo-600 bg-indigo-100',
    orange: isDarkMode ? 'text-orange-400 bg-orange-500/20' : 'text-orange-600 bg-orange-100',
    teal: isDarkMode ? 'text-teal-400 bg-teal-500/20' : 'text-teal-600 bg-teal-100',
    violet: isDarkMode ? 'text-violet-400 bg-violet-500/20' : 'text-violet-600 bg-violet-100',
    gray: isDarkMode ? 'text-gray-400 bg-gray-500/20' : 'text-gray-600 bg-gray-100',
  };
  return colors[colorName as keyof typeof colors] || colors.gray;
};

const detectSubjectFromText = (text: string): Subject | null => {
  const lowerText = text.toLowerCase();
  
  for (const subject of SUBJECTS) {
    const keywords = {
      math: ['math', 'mathematics', 'algebra', 'geometry', 'calculus', 'equation', 'formula', 'number'],
      science: ['science', 'biology', 'chemistry', 'physics', 'experiment', 'hypothesis', 'molecule', 'atom'],
      history: ['history', 'historical', 'war', 'ancient', 'civilization', 'century', 'revolution', 'empire'],
      english: ['english', 'literature', 'essay', 'grammar', 'writing', 'reading', 'poem', 'novel'],
      art: ['art', 'drawing', 'painting', 'sketch', 'color', 'design', 'creative', 'artistic'],
      music: ['music', 'musical', 'song', 'instrument', 'melody', 'rhythm', 'chord', 'compose'],
      pe: ['pe', 'physical', 'exercise', 'sport', 'fitness', 'gym', 'athletic', 'health'],
      social: ['social', 'society', 'culture', 'community', 'government', 'politics', 'economics'],
      psychology: ['psychology', 'behavior', 'mind', 'emotion', 'cognitive', 'mental', 'brain'],
    };
    
    const subjectKeywords = keywords[subject.id as keyof typeof keywords];
    if (subjectKeywords && subjectKeywords.some(keyword => lowerText.includes(keyword))) {
      return subject;
    }
  }
  
  return null;
};

// Utility functions for YouTube link detection
const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const detectYouTubeLinks = (text: string): YouTubeLink[] => {
  const urlPattern = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[^\s]+)/g;
  const matches = text.match(urlPattern) || [];
  
  return matches.map(url => {
    const videoId = extractYouTubeVideoId(url);
    return {
      url,
      videoId: videoId || '',
      thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
    };
  }).filter(link => link.videoId);
};

const makeLinksClickable = (text: string): React.JSX.Element => {
  // YouTube link pattern
  const youtubePattern = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[^\s]+)/g;
  // General URL pattern  
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  
  let lastIndex = 0;
  const elements: React.JSX.Element[] = [];
  
  // First handle YouTube links
  const youtubeMatches = Array.from(text.matchAll(youtubePattern));
  const processedRanges: Array<{start: number, end: number}> = [];
  
  youtubeMatches.forEach((match, index) => {
    const start = match.index!;
    const end = start + match[0].length;
    
    // Add text before the YouTube link
    if (start > lastIndex) {
      elements.push(<span key={`text-${index}-before`}>{text.slice(lastIndex, start)}</span>);
    }
    
    // Add YouTube link
    elements.push(
      <a
        key={`youtube-${index}`}
        href={match[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-600 underline font-medium inline-flex items-center gap-1"
      >
        {match[0]}
        <ExternalLink className="w-3 h-3" />
      </a>
    );
    
    processedRanges.push({start, end});
    lastIndex = end;
  });
  
  // Handle remaining text and other links
  const remainingText = text.slice(lastIndex);
  const otherMatches = Array.from(remainingText.matchAll(urlPattern));
  let remainingLastIndex = 0;
  
  otherMatches.forEach((urlMatch, index) => {
    const start = urlMatch.index!;
    const end = start + urlMatch[0].length;
    const absoluteStart = lastIndex + start;
    const absoluteEnd = lastIndex + end;
    
    // Check if this URL is already processed as YouTube
    const isAlreadyProcessed = processedRanges.some(range => 
      absoluteStart >= range.start && absoluteEnd <= range.end
    );
    
    if (!isAlreadyProcessed) {
      // Add text before the link
      if (start > remainingLastIndex) {
        elements.push(<span key={`text-other-${index}-before`}>{remainingText.slice(remainingLastIndex, start)}</span>);
      }
      
      // Add other link
      elements.push(
        <a
          key={`link-other-${index}`}
          href={urlMatch[0]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline font-medium inline-flex items-center gap-1"
        >
          {urlMatch[0]}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
      
      remainingLastIndex = end;
    }
  });
  
  // Add final remaining text
  if (remainingLastIndex < remainingText.length) {
    elements.push(<span key="text-final">{remainingText.slice(remainingLastIndex)}</span>);
  }
  
  // If no links were found, return the original text
  if (elements.length === 0) {
    return <span>{text}</span>;
  }
  
  return <>{elements}</>;
};

// File utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return ImageIcon;
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
  return FileUp;
};

const isImageFile = (type: string): boolean => {
  return type.startsWith('image/');
};

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Utility functions
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

// Subject Badge Component
const SubjectBadge: React.FC<{ subject: Subject; isDarkMode: boolean; size?: 'sm' | 'md' }> = ({ 
  subject, isDarkMode, size = 'md' 
}) => {
  const IconComponent = subject.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  
  return (
    <div className={`inline-flex items-center space-x-1.5 rounded-full font-medium ${sizeClasses} ${getSubjectColor(subject.color, isDarkMode)}`}>
      <IconComponent className={iconSize} />
      <span>{subject.name}</span>
    </div>
  );
};

// Study Stats Component
const StudyStatsPanel: React.FC<{ 
  stats: StudyStats; 
  currentSession: StudySession | null;
  sessionTimer: number;
  isDarkMode: boolean; 
  onStartSession: (subject?: Subject) => void;
  onEndSession: () => void;
}> = ({ stats, currentSession, sessionTimer, isDarkMode, onStartSession, onEndSession }) => {
  return (
    <div className="space-y-4">
      {/* Current Session */}
      {currentSession ? (
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                isDarkMode ? 'bg-green-400' : 'bg-green-500'
              }`} />
              <span className={`font-semibold ${
                isDarkMode ? 'text-green-400' : 'text-green-700'
              }`}>
                Active Session
              </span>
            </div>
            <button
              onClick={onEndSession}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                isDarkMode 
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                  : 'bg-red-100 hover:bg-red-200 text-red-600'
              }`}
            >
              End Session
            </button>
          </div>
          
          {currentSession.subject && (
            <div className="mb-2">
              <SubjectBadge subject={currentSession.subject} isDarkMode={isDarkMode} size="sm" />
            </div>
          )}
          
          <div className={`text-2xl font-bold ${
            isDarkMode ? 'text-green-400' : 'text-green-700'
          }`}>
            {formatDuration(sessionTimer)}
          </div>
          <div className={`text-sm ${
            isDarkMode ? 'text-green-300' : 'text-green-600'
          }`}>
            {currentSession.messageCount} messages
          </div>
        </div>
      ) : (
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="text-center space-y-3">
            <Target className={`w-8 h-8 mx-auto ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <div>
              <p className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                No Active Session
              </p>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Start studying to track your progress
              </p>
            </div>
            <button
              onClick={() => onStartSession()}
              className={`px-4 py-2 rounded-lg transition-all ${
                isDarkMode 
                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' 
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
              }`}
            >
              Start Session
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-lg ${
          isDarkMode ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className={`text-lg font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {formatDuration(stats.todayTime)}
          </div>
          <div className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Today
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${
          isDarkMode ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className={`text-lg font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {formatDuration(stats.weekTime)}
          </div>
          <div className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            This Week
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${
          isDarkMode ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className={`text-lg font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {stats.totalSessions}
          </div>
          <div className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Sessions
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${
          isDarkMode ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className={`text-lg font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {formatDuration(stats.averageSessionTime)}
          </div>
          <div className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Average
          </div>
        </div>
      </div>

      {stats.mostStudiedSubject !== 'None' && (
        <div className={`p-3 rounded-lg ${
          isDarkMode ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className={`text-sm font-medium ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Most Studied: {stats.mostStudiedSubject}
          </div>
        </div>
      )}
    </div>
  );
};

// Subject Selector Component
const SubjectSelector: React.FC<{ 
  selectedSubject: Subject | null; 
  onSubjectChange: (subject: Subject | null) => void; 
  isDarkMode: boolean;
}> = ({ selectedSubject, onSubjectChange, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
          selectedSubject
            ? getSubjectColor(selectedSubject.color, isDarkMode)
            : isDarkMode
              ? 'bg-white/10 hover:bg-white/20 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}
        title="Select Subject"
      >
        {selectedSubject ? (
          <>
            <selectedSubject.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{selectedSubject.name}</span>
          </>
        ) : (
          <>
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">Subject</span>
          </>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-full left-0 mt-2 w-64 rounded-xl border shadow-lg z-20 ${
                isDarkMode 
                  ? 'bg-slate-800/95 border-white/20 backdrop-blur-md' 
                  : 'bg-white/95 border-gray-200 backdrop-blur-md'
              }`}
            >
              <div className="p-2 space-y-1">
                {/* Clear Selection */}
                <button
                  onClick={() => {
                    onSubjectChange(null);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    isDarkMode 
                      ? 'hover:bg-white/10 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">No Subject</span>
                </button>
                
                {/* Subject Options */}
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      onSubjectChange(subject);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                      selectedSubject?.id === subject.id
                        ? getSubjectColor(subject.color, isDarkMode)
                        : isDarkMode 
                          ? 'hover:bg-white/10 text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <subject.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{subject.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// File Preview Component
const FilePreview: React.FC<{ attachment: FileAttachment; isDarkMode: boolean; onRemove?: () => void }> = ({ 
  attachment, isDarkMode, onRemove 
}) => {
  const IconComponent = getFileIcon(attachment.type);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative group rounded-lg border p-3 transition-all duration-300 ${
        isDarkMode ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-gray-50'
      }`}
    >
      {onRemove && (
        <button
          onClick={onRemove}
          className={`absolute -top-2 -right-2 p-1 rounded-full transition-all duration-300 ${
            isDarkMode 
              ? 'bg-red-500/80 hover:bg-red-500 text-white' 
              : 'bg-red-100 hover:bg-red-200 text-red-600'
          }`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
      
      <div className="flex items-center space-x-3">
        {isImageFile(attachment.type) && attachment.base64 ? (
          <div className="relative">
            <img
              src={attachment.base64}
              alt={attachment.name}
              className="w-12 h-12 object-cover rounded border"
            />
            <div className="absolute inset-0 bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ) : (
          <div className={`p-2 rounded ${
            isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
          }`}>
            <IconComponent className={`w-6 h-6 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {attachment.name}
          </p>
          <p className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {formatFileSize(attachment.size)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// YouTube Thumbnail Component
const YouTubeThumbnail: React.FC<{ link: YouTubeLink; isDarkMode: boolean }> = ({ link, isDarkMode }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mt-3 rounded-lg overflow-hidden border transition-all duration-300 hover:scale-105 ${
        isDarkMode ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-gray-50/50'
      }`}
    >
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="relative">
          {!imageError && (
            <>
              {!imageLoaded && (
                <div className={`w-full h-32 flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                }`}>
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                </div>
              )}
              <img
                src={link.thumbnail}
                alt="YouTube Thumbnail"
                className={`w-full h-32 object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                style={{ display: imageLoaded ? 'block' : 'none' }}
              />
            </>
          )}
          
          {imageError && (
            <div className={`w-full h-32 flex flex-col items-center justify-center ${
              isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-600'
            }`}>
              <Play className="w-8 h-8 mb-2" />
              <span className="text-sm">YouTube Video</span>
            </div>
          )}
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-red-600 rounded-full p-3">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
        </div>
        
        <div className={`p-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate flex-1">
              YouTube Video
            </span>
            <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0" />
          </div>
          <p className="text-xs mt-1 text-blue-500 font-mono break-all">
            {link.url}
          </p>
        </div>
      </a>
    </motion.div>
  );
};

export default function SchoolChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate unique session ID
  const generateSessionId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
  };

  // History management functions
  const saveMessageToHistory = (message: Message) => {
    try {
      const existingHistory = JSON.parse(localStorage.getItem('schoolChatHistory') || '[]');
      const updatedHistory = [message, ...existingHistory].slice(0, 100); // Keep last 100 messages
      localStorage.setItem('schoolChatHistory', JSON.stringify(updatedHistory));
      setMessageHistory(updatedHistory);
    } catch (error) {
      console.warn('Could not save message to history:', error);
    }
  };

  const loadMessageHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('schoolChatHistory') || '[]');
      setMessageHistory(history.map((msg: Message & { timestamp: string }) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    } catch (error) {
      console.warn('Could not load message history:', error);
    }
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem('schoolChatHistory');
      setMessageHistory([]);
    } catch (error) {
      console.warn('Could not clear history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Get or generate session ID immediately
    let storedSessionId = '';
    try {
      storedSessionId = localStorage.getItem('schoolChatSessionId') || '';
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
    
    const newSessionId = storedSessionId || generateSessionId();
    
    // Set session ID immediately
    setSessionId(newSessionId);
    
    // Store session ID in localStorage
    try {
      localStorage.setItem('schoolChatSessionId', newSessionId);
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
    
    console.log('Session ID initialized:', newSessionId);
    
    // Load message history
    loadMessageHistory();
    
    // Initialize voice recognition
    initializeVoiceRecognition();
    
    // Load study sessions
    loadStudySessions();
    
    // Welcome message on load
    const welcomeMessage: Message = {
      id: 'welcome',
      text: 'Hello! I\'m your AI learning assistant. How can I help you with your studies today?',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const sendMessage = async () => {
    if ((!inputMessage.trim() && attachments.length === 0) || isLoading) return;
    
    // Ensure we have a session ID before sending
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      setSessionId(currentSessionId);
      try {
        localStorage.setItem('schoolChatSessionId', currentSessionId);
      } catch (error) {
        console.warn('Could not save to localStorage:', error);
      }
    }

    // Auto-detect subject if none selected
    const detectedSubject = selectedSubject || detectSubjectFromText(inputMessage);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage || (attachments.length > 0 ? `📎 Sent ${attachments.length} file(s)` : ''),
      isUser: true,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      subject: detectedSubject || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    saveMessageToHistory(userMessage);
    
    // Increment message count for current study session
    incrementMessageCount();
    
    // Auto-start study session if none exists and subject is detected
    if (!currentSession && detectedSubject) {
      startStudySession(detectedSubject);
    }
    
    setInputMessage('');
    setAttachments([]);
    setSelectedSubject(null);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const payload = { 
        chatInput: inputMessage,
        sessionId: currentSessionId,
        attachments: attachments.length > 0 ? attachments : undefined,
        subject: detectedSubject?.name || null
      };
      
      // Create URL with query parameters for GET request
      // Use attachment-specific webhook if files are uploaded, otherwise use regular webhook
      const baseWebhookUrl = attachments.length > 0 
        ? 'https://n8n.1000273.xyz/webhook/atackment'
        : 'https://n8n.1000273.xyz/webhook/50e8cd95-3ef5-4345-837a-55ce3823a14c';
      
      const url = new URL(baseWebhookUrl);
      url.searchParams.append('chatInput', inputMessage);
      url.searchParams.append('sessionId', currentSessionId);
      if (detectedSubject?.name) {
        url.searchParams.append('subject', detectedSubject.name);
      }
      if (attachments.length > 0) {
        // Send attachment fields as separate query parameters
        const attachment = attachments[0]; // Take the first attachment
        url.searchParams.append('file_id', attachment.id);
        url.searchParams.append('file_type', attachment.type);
        url.searchParams.append('file_title', attachment.name);
        url.searchParams.append('base64', attachment.base64 || '');
      }
      
      console.log('Sending to n8n webhook:', payload);
      console.log('Webhook URL:', url.toString());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:');
      for (const [key, value] of response.headers.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Try to get the full response first as fallback
      const responseText = await response.text();
      console.log('Full response received:', responseText);
      
      // Create initial empty bot message
      const botMessageId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMessageId,
        text: '',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Parse the JSON streaming format and simulate streaming
      const lines = responseText.split('\n').filter(line => line.trim());
      let fullResponse = '';
      
      try {
        // Process all lines immediately without delays
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim()) {
            try {
              const data = JSON.parse(line.trim());
              
              if (data.type === 'begin') {
                console.log('Stream started:', data);
              }
              else if (data.type === 'item' && data.content) {
                fullResponse += data.content;
                
                // Update the message immediately with new content
                setMessages(prev => prev.map(msg => 
                  msg.id === botMessageId 
                    ? { ...msg, text: fullResponse }
                    : msg
                ));
                
                // No delay - update instantly
              }
              else if (data.type === 'end') {
                console.log('Stream ended:', data);
                break;
              }
            } catch (parseError) {
              console.warn('Failed to parse line:', line, parseError);
              // If parsing fails, treat as plain text and add it immediately
              fullResponse += line;
              setMessages(prev => prev.map(msg => 
                msg.id === botMessageId 
                  ? { ...msg, text: fullResponse }
                  : msg
              ));
            }
          }
        }
        
        // Ensure the final message is set
        if (fullResponse) {
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, text: fullResponse }
              : msg
          ));
        }
      } catch (streamError) {
        console.error('Streaming simulation error:', streamError);
        // Fallback: show the raw response
        const fallbackText = responseText || 'Sorry, there was an error processing the response.';
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: fallbackText }
            : msg
        ));
      }
      
      // Save final message to history
      const finalMessage = { ...botMessage, text: fullResponse };
      saveMessageToHistory(finalMessage);
      
      // Auto-speak bot response if voice is enabled
      if (voiceEnabled && fullResponse.trim()) {
        speakText(fullResponse);
      }
      
      setIsLoading(false);
      setIsTyping(false);

    } catch (error) {
      console.error('Error sending message:', error);
      setTimeout(() => {
        const errorText = 'Sorry, I\'m having trouble connecting right now. Please try again later.';
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: errorText,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
        saveMessageToHistory(errorMessage);
        
        // Auto-speak error message if voice is enabled
        if (voiceEnabled) {
          speakText(errorText);
        }
        
        setIsLoading(false);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const resetSession = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    
    try {
      localStorage.setItem('schoolChatSessionId', newSessionId);
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
    
    // Clear messages except welcome message
    const welcomeMessage: Message = {
      id: 'welcome-new',
      text: 'New session started! I\'m your AI learning assistant. How can I help you with your studies today?',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setAttachments([]);
  };

  // Voice functionality
  const initializeVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = SpeechRecognitionConstructor ? new SpeechRecognitionConstructor() : null;
      
      if (!recognition) {
        console.warn('Speech recognition not available');
        setVoiceEnabled(false);
        return;
      }
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognition);
      setVoiceEnabled(true);
    } else {
      console.warn('Speech recognition not supported');
      setVoiceEnabled(false);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Study session functions
  const startStudySession = (subject?: Subject) => {
    // End current session if exists
    if (currentSession) {
      endStudySession();
    }

    const newSession: StudySession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      subject: subject,
      messageCount: 0,
      isActive: true,
    };

    setCurrentSession(newSession);
    setSessionTimer(0);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);

    console.log('Study session started:', newSession);
  };

  const endStudySession = () => {
    if (!currentSession) return;

    const endedSession: StudySession = {
      ...currentSession,
      endTime: new Date(),
      isActive: false,
    };

    setStudySessions(prev => [...prev, endedSession]);
    setCurrentSession(null);
    setSessionTimer(0);

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Save to localStorage
    try {
      const existingSessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
      const updatedSessions = [...existingSessions, endedSession];
      localStorage.setItem('studySessions', JSON.stringify(updatedSessions));
    } catch (error) {
      console.warn('Could not save study session:', error);
    }

    console.log('Study session ended:', endedSession);
  };

  const loadStudySessions = () => {
    try {
      const sessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
      const parsedSessions = sessions.map((session: StudySession & { startTime: string; endTime?: string }) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
      }));
      setStudySessions(parsedSessions);
    } catch (error) {
      console.warn('Could not load study sessions:', error);
    }
  };

  const incrementMessageCount = () => {
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, messageCount: prev.messageCount + 1 } : null);
    }
  };

  const calculateStudyStats = (): StudyStats => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    let totalTime = 0;
    let todayTime = 0;
    let weekTime = 0;
    const subjectTimes: { [key: string]: number } = {};

    studySessions.forEach(session => {
      if (session.endTime) {
        const duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
        totalTime += duration;

        if (session.startTime >= todayStart) {
          todayTime += duration;
        }
        if (session.startTime >= weekStart) {
          weekTime += duration;
        }

        if (session.subject) {
          subjectTimes[session.subject.name] = (subjectTimes[session.subject.name] || 0) + duration;
        }
      }
    });

    const mostStudiedSubject = Object.keys(subjectTimes).reduce((a, b) => 
      subjectTimes[a] > subjectTimes[b] ? a : b, 'None'
    );

    return {
      totalSessions: studySessions.length,
      totalTime,
      averageSessionTime: studySessions.length > 0 ? Math.floor(totalTime / studySessions.length) : 0,
      mostStudiedSubject,
      todayTime,
      weekTime,
    };
  };

  // Export functions
  const exportToJSON = () => {
    const exportData = {
      messages: messages,
      studySessions: studySessions,
      exportDate: new Date().toISOString(),
      sessionId: sessionId,
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-chat-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToText = () => {
    let textContent = `Study Chat Export - ${new Date().toLocaleDateString()}\n`;
    textContent += `=`.repeat(50) + '\n\n';
    
    messages.forEach(message => {
      const timestamp = message.timestamp.toLocaleString();
      const sender = message.isUser ? 'You' : 'Assistant';
      const subject = message.subject ? ` [${message.subject.name}]` : '';
      
      textContent += `[${timestamp}] ${sender}${subject}:\n`;
      textContent += `${message.text}\n`;
      
      if (message.attachments && message.attachments.length > 0) {
        textContent += `Attachments: ${message.attachments.map(att => att.name).join(', ')}\n`;
      }
      
      textContent += '\n';
    });
    
    // Add study statistics
    const stats = calculateStudyStats();
    textContent += `\nStudy Statistics:\n`;
    textContent += `-`.repeat(20) + '\n';
    textContent += `Total Sessions: ${stats.totalSessions}\n`;
    textContent += `Total Study Time: ${formatDuration(stats.totalTime)}\n`;
    textContent += `Average Session: ${formatDuration(stats.averageSessionTime)}\n`;
    textContent += `Today: ${formatDuration(stats.todayTime)}\n`;
    textContent += `This Week: ${formatDuration(stats.weekTime)}\n`;
    if (stats.mostStudiedSubject !== 'None') {
      textContent += `Most Studied Subject: ${stats.mostStudiedSubject}\n`;
    }
    
    const dataBlob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToMarkdown = () => {
    let markdownContent = `# Study Chat Export\n\n`;
    markdownContent += `**Export Date:** ${new Date().toLocaleDateString()}\n\n`;
    
    markdownContent += `## Conversation\n\n`;
    
    messages.forEach(message => {
      const timestamp = message.timestamp.toLocaleString();
      const sender = message.isUser ? '**You**' : '**Assistant**';
      const subject = message.subject ? ` *[${message.subject.name}]*` : '';
      
      markdownContent += `### ${sender}${subject}\n`;
      markdownContent += `*${timestamp}*\n\n`;
      markdownContent += `${message.text}\n\n`;
      
      if (message.attachments && message.attachments.length > 0) {
        markdownContent += `**Attachments:** ${message.attachments.map(att => att.name).join(', ')}\n\n`;
      }
    });
    
    // Add study statistics
    const stats = calculateStudyStats();
    markdownContent += `## Study Statistics\n\n`;
    markdownContent += `| Metric | Value |\n`;
    markdownContent += `|--------|-------|\n`;
    markdownContent += `| Total Sessions | ${stats.totalSessions} |\n`;
    markdownContent += `| Total Study Time | ${formatDuration(stats.totalTime)} |\n`;
    markdownContent += `| Average Session | ${formatDuration(stats.averageSessionTime)} |\n`;
    markdownContent += `| Today | ${formatDuration(stats.todayTime)} |\n`;
    markdownContent += `| This Week | ${formatDuration(stats.weekTime)} |\n`;
    if (stats.mostStudiedSubject !== 'None') {
      markdownContent += `| Most Studied Subject | ${stats.mostStudiedSubject} |\n`;
    }
    
    const dataBlob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-chat-export-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareConversation = async () => {
    if (navigator.share) {
      const shareText = messages.map(msg => 
        `${msg.isUser ? 'You' : 'Assistant'}: ${msg.text}`
      ).join('\n\n');
      
      try {
        await navigator.share({
          title: 'Study Chat Conversation',
          text: shareText,
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = messages.map(msg => 
        `${msg.isUser ? 'You' : 'Assistant'}: ${msg.text}`
      ).join('\n\n');
      
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Conversation copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  // File handling functions
  const handleFileSelect = async (files: FileList) => {
    const newAttachments: FileAttachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }
      
      try {
        const base64 = await convertFileToBase64(file);
        
        const attachment: FileAttachment = {
          id: `file_${Date.now()}_${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          base64
        };
        
        newAttachments.push(attachment);
      } catch (error) {
        console.error('Error processing file:', error);
        alert(`Error processing file "${file.name}"`);
      }
    }
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      await handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className="container mx-auto max-w-4xl h-screen flex flex-col">
        {/* Header */}
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`backdrop-blur-md border-b transition-all duration-300 ${
            isDarkMode 
              ? 'bg-white/10 border-white/20 text-white' 
              : 'bg-white/70 border-gray-200 text-gray-800'
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'
              }`}>
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold">School Learning Assistant</h1>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Your AI-powered study companion
                </p>
                {sessionId ? (
                  <p className={`text-xs font-mono ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    ✓ Session: {sessionId.substring(0, 20)}...
                  </p>
                ) : (
                  <p className={`text-xs ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                    ⏳ Initializing session...
                  </p>
                )}
                
                {/* Current Study Session Indicator */}
                {currentSession && (
                  <div className={`flex items-center space-x-2 text-xs ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      isDarkMode ? 'bg-green-400' : 'bg-green-500'
                    }`} />
                    <span>Study: {formatDuration(sessionTimer)}</span>
                    {currentSession.subject && (
                      <span>• {currentSession.subject.name}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Voice Toggle */}
              {voiceEnabled && (
                <button
                  onClick={isSpeaking ? stopSpeaking : () => {}}
                  className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                    isSpeaking
                      ? isDarkMode
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                        : 'bg-red-100 hover:bg-red-200 text-red-600'
                      : isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 text-green-400'
                        : 'bg-gray-100 hover:bg-gray-200 text-green-600'
                  }`}
                  title={isSpeaking ? "Stop Speaking" : "Voice Output Enabled"}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}
              
              <button
                onClick={() => setShowStats(true)}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-white/10 hover:bg-white/20 text-orange-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-orange-600'
                }`}
                title="Study Stats"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              
              {/* Export Dropdown */}
              <div className="relative group">
                <button
                  className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                    isDarkMode 
                      ? 'bg-white/10 hover:bg-white/20 text-blue-400' 
                      : 'bg-gray-100 hover:bg-gray-200 text-blue-600'
                  }`}
                  title="Export Conversation"
                >
                  <Download className="w-4 h-4" />
                </button>
                
                {/* Export Menu */}
                <div className={`absolute top-full right-0 mt-2 w-48 rounded-xl border shadow-lg z-30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/95 border-white/20 backdrop-blur-md' 
                    : 'bg-white/95 border-gray-200 backdrop-blur-md'
                }`}>
                  <div className="p-2 space-y-1">
                    <button
                      onClick={exportToMarkdown}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                        isDarkMode 
                          ? 'hover:bg-white/10 text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Export as Markdown</span>
                    </button>
                    
                    <button
                      onClick={exportToText}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                        isDarkMode 
                          ? 'hover:bg-white/10 text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Export as Text</span>
                    </button>
                    
                    <button
                      onClick={exportToJSON}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                        isDarkMode 
                          ? 'hover:bg-white/10 text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Export as JSON</span>
                    </button>
                    
                    <hr className={`my-1 ${
                      isDarkMode ? 'border-white/10' : 'border-gray-200'
                    }`} />
                    
                    <button
                      onClick={shareConversation}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                        isDarkMode 
                          ? 'hover:bg-white/10 text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Share Conversation</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setIsHistoryOpen(true)}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-white/10 hover:bg-white/20 text-purple-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="View History"
              >
                <History className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => window.open('https://wordleunlimited.org/', '_blank')}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-white/10 hover:bg-white/20 text-green-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="Play Wordle Unlimited"
              >
                <Brain className="w-4 h-4" />
              </button>
              
              <button
                onClick={resetSession}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-white/10 hover:bg-white/20 text-orange-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="Start New Session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-white/10 hover:bg-white/20 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.header>

        {/* Chat Messages */}
        <div 
          className={`flex-1 overflow-y-auto p-4 space-y-4 transition-all duration-300 ${
            isDragOver ? (isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50') : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`fixed inset-4 border-2 border-dashed rounded-2xl flex items-center justify-center z-10 ${
                isDarkMode 
                  ? 'border-blue-400 bg-blue-500/10 text-blue-400' 
                  : 'border-blue-500 bg-blue-50 text-blue-600'
              }`}
            >
              <div className="text-center">
                <FileUp className="w-12 h-12 mx-auto mb-3" />
                <p className="text-lg font-semibold">Drop files here to upload</p>
                <p className="text-sm opacity-75">Supports images, PDFs, documents (max 10MB)</p>
              </div>
            </motion.div>
          )}
          
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-sm lg:max-w-lg px-4 py-3 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                  message.isUser
                    ? isDarkMode
                      ? 'bg-blue-600/80 text-white border-blue-500/30 shadow-lg shadow-blue-500/20'
                      : 'bg-blue-600 text-white border-blue-500/30 shadow-lg shadow-blue-500/20'
                    : isDarkMode
                      ? 'bg-white/10 text-white border-white/20 shadow-lg shadow-black/20'
                      : 'bg-white/80 text-gray-800 border-gray-200 shadow-lg shadow-gray-500/20'
                }`}>
                  {/* Subject Badge */}
                  {message.subject && (
                    <div className="mb-2">
                      <SubjectBadge subject={message.subject} isDarkMode={isDarkMode} size="sm" />
                    </div>
                  )}
                  
                  <div className="text-sm leading-relaxed">
                    {makeLinksClickable(message.text)}
                  </div>
                  
                  {/* File Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((attachment) => (
                        <FilePreview 
                          key={attachment.id}
                          attachment={attachment} 
                          isDarkMode={isDarkMode}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* YouTube Thumbnails */}
                  {!message.isUser && detectYouTubeLinks(message.text).map((link, linkIndex) => (
                    <YouTubeThumbnail 
                      key={`${message.id}-youtube-${linkIndex}`}
                      link={link} 
                      isDarkMode={isDarkMode} 
                    />
                  ))}
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-xs ${
                      message.isUser
                        ? 'text-blue-100'
                        : isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                    
                    {/* Voice controls for bot messages */}
                    {!message.isUser && voiceEnabled && message.text.trim() && (
                      <button
                        onClick={() => speakText(message.text)}
                        disabled={isSpeaking}
                        className={`ml-2 p-1 rounded transition-all duration-200 ${
                          isSpeaking
                            ? 'opacity-50 cursor-not-allowed'
                            : isDarkMode
                              ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                              : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                        }`}
                        title="Read aloud"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className={`px-4 py-3 rounded-2xl backdrop-blur-sm border ${
                isDarkMode
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/80 border-gray-200'
              }`}>
                <div className="flex space-x-1">
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    isDarkMode ? 'bg-gray-300' : 'bg-gray-600'
                  }`} style={{ animationDelay: '0ms' }}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    isDarkMode ? 'bg-gray-300' : 'bg-gray-600'
                  }`} style={{ animationDelay: '150ms' }}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    isDarkMode ? 'bg-gray-300' : 'bg-gray-600'
                  }`} style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`px-4 py-2 border-t ${
              isDarkMode ? 'border-white/20' : 'border-gray-200'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {attachments.map((attachment) => (
                <FilePreview 
                  key={attachment.id}
                  attachment={attachment} 
                  isDarkMode={isDarkMode}
                  onRemove={() => removeAttachment(attachment.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Message Input */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`p-4 backdrop-blur-md border-t ${
            isDarkMode 
              ? 'bg-white/10 border-white/20' 
              : 'bg-white/70 border-gray-200'
          }`}
        >
          <div className="flex space-x-3 items-end">
            {/* File Input (Hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.rtf"
              onChange={(e) => {
                if (e.target.files) {
                  handleFileSelect(e.target.files);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
            
            {/* Attachment Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || !sessionId}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                isLoading || !sessionId
                  ? isDarkMode
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 text-purple-400'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="Attach files"
            >
              <Paperclip className="w-5 h-5" />
            </motion.button>
            
            {/* Subject Selector */}
            <SubjectSelector
              selectedSubject={selectedSubject}
              onSubjectChange={setSelectedSubject}
              isDarkMode={isDarkMode}
            />
            
            {/* Voice Input Button */}
            {voiceEnabled && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading || !sessionId}
                className={`p-3 rounded-2xl transition-all duration-300 ${
                  isListening
                    ? isDarkMode
                      ? 'bg-red-500/80 hover:bg-red-500 text-white animate-pulse'
                      : 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : isLoading || !sessionId
                      ? isDarkMode
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 text-blue-400'
                        : 'bg-gray-100 hover:bg-gray-200 text-blue-600'
                }`}
                title={isListening ? "Stop Listening" : "Voice Input"}
              >
                {isListening ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>
            )}
            
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={sessionId ? "Ask me anything about your studies..." : "Initializing session..."}
                className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                  isDarkMode
                    ? 'bg-white/10 border-white/20 text-white placeholder-gray-300 focus:ring-blue-500/50'
                    : 'bg-white/80 border-gray-200 text-gray-800 placeholder-gray-500 focus:ring-blue-500/50'
                }`}
                disabled={isLoading || !sessionId}
                maxLength={500}
              />
              <div className={`absolute bottom-1 right-3 text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {inputMessage.length}/500
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={(!inputMessage.trim() && attachments.length === 0) || isLoading || !sessionId}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                (!inputMessage.trim() && attachments.length === 0) || isLoading || !sessionId
                  ? isDarkMode
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* History Panel */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsHistoryOpen(false)}
            />
            
            {/* History Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`fixed right-0 top-0 h-full w-80 z-50 border-l ${
                isDarkMode 
                  ? 'bg-slate-900/95 border-white/20' 
                  : 'bg-white/95 border-gray-200'
              } backdrop-blur-md`}
            >
              {/* History Header */}
              <div className={`flex items-center justify-between p-4 border-b ${
                isDarkMode ? 'border-white/20' : 'border-gray-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <History className={`w-5 h-5 ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <h2 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Message History
                  </h2>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearHistory}
                    className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 text-xs ${
                      isDarkMode 
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                        : 'bg-red-100 hover:bg-red-200 text-red-600'
                    }`}
                    title="Clear History"
                  >
                    Clear
                  </button>
                  
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${
                      isDarkMode 
                        ? 'bg-white/10 hover:bg-white/20 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* History Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 h-full">
                {messageHistory.length === 0 ? (
                  <div className={`text-center py-8 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No message history yet</p>
                    <p className="text-sm mt-1">Start chatting to see your history here</p>
                  </div>
                ) : (
                  messageHistory.map((message, index) => (
                    <motion.div
                      key={`history-${message.id}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        message.isUser
                          ? isDarkMode
                            ? 'bg-blue-600/20 border-blue-500/30 ml-4'
                            : 'bg-blue-50 border-blue-200 ml-4'
                          : isDarkMode
                            ? 'bg-white/5 border-white/10 mr-4'
                            : 'bg-gray-50 border-gray-200 mr-4'
                      }`}
                    >
                      {/* Subject Badge in History */}
                      {message.subject && (
                        <div className="mb-2">
                          <SubjectBadge subject={message.subject} isDarkMode={isDarkMode} size="sm" />
                        </div>
                      )}
                      
                      <div className={`text-sm leading-relaxed ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {makeLinksClickable(message.text)}
                      </div>
                      
                      {/* File Attachments in History */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className={`text-xs flex items-center space-x-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              <Paperclip className="w-3 h-3" />
                              <span className="truncate">{attachment.name}</span>
                              <span>({formatFileSize(attachment.size)})</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${
                          message.isUser
                            ? isDarkMode ? 'text-blue-300' : 'text-blue-600'
                            : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {message.isUser ? 'You' : 'Assistant'}
                        </p>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Study Stats Panel */}
      <AnimatePresence>
        {showStats && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowStats(false)}
            />
            
            {/* Stats Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`fixed right-0 top-0 h-full w-80 z-50 border-l ${
                isDarkMode 
                  ? 'bg-slate-900/95 border-white/20' 
                  : 'bg-white/95 border-gray-200'
              } backdrop-blur-md`}
            >
              {/* Stats Header */}
              <div className={`flex items-center justify-between p-4 border-b ${
                isDarkMode ? 'border-white/20' : 'border-gray-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <BarChart3 className={`w-5 h-5 ${
                    isDarkMode ? 'text-orange-400' : 'text-orange-600'
                  }`} />
                  <h2 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Study Statistics
                  </h2>
                </div>
                
                <button
                  onClick={() => setShowStats(false)}
                  className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${
                    isDarkMode 
                      ? 'bg-white/10 hover:bg-white/20 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Content */}
              <div className="flex-1 overflow-y-auto p-4 h-full">
                <StudyStatsPanel
                  stats={calculateStudyStats()}
                  currentSession={currentSession}
                  sessionTimer={sessionTimer}
                  isDarkMode={isDarkMode}
                  onStartSession={startStudySession}
                  onEndSession={endStudySession}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
