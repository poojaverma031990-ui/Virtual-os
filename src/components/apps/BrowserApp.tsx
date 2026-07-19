import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Globe, ChevronLeft, ChevronRight, RotateCcw, X, ExternalLink, 
  Sparkles, AlertCircle, BookOpen, Layers, Plus, Bookmark, Home, Lock, 
  Star, Trash2, ShieldCheck, ArrowRight, CornerDownRight,
  ArrowUp, ArrowDown, MessageSquare, Share2, Send, Flame, User, PlusCircle, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { playSound } from '../../lib/sounds';

interface SearchResult {
  title: string;
  link: string;
  desc: string;
  source?: string;
}

interface Tab {
  id: string;
  title: string;
  url: string;
  currentUrl: string;
  mode: 'search' | 'browse';
  searchQuery: string;
  results: SearchResult[];
  aiResponse: string;
  history: string[];
  historyIndex: number;
}

interface RedditPost {
  title: string;
  subreddit: string;
  author: string;
  score: number;
  numComments: number;
  created: string;
  content: string;
  comments: { author: string; body: string; score: number; created: string }[];
  userVote?: 'up' | 'down';
}

function RedditView({ 
  url, 
  onNavigate 
}: { 
  url: string; 
  onNavigate: (newUrl: string, tabTitle?: string) => void; 
}) {
  const [subreddit, setSubreddit] = useState('all');
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null);
  
  // Create post modal state
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSub, setNewSub] = useState('r/technology');
  
  // Comment state
  const [newComment, setNewComment] = useState('');

  // Extract subreddit and post title from URL if possible
  useEffect(() => {
    if (url.includes('/r/')) {
      const parts = url.split('/r/');
      if (parts[1]) {
        const subName = parts[1].split('/')[0];
        setSubreddit(subName);
        setSelectedPost(null);
      }
    } else if (url.includes('/post/')) {
      // Keep selected post or try to decode from URL
      const postSlug = url.split('/post/')[1];
      if (postSlug) {
        const titleToFind = decodeURIComponent(postSlug).replace(/-/g, ' ');
        const found = posts.find(p => p.title.toLowerCase() === titleToFind.toLowerCase());
        if (found) {
          setSelectedPost(found);
        }
      }
    } else {
      setSubreddit('all');
      setSelectedPost(null);
    }
  }, [url, posts]);

  // Fetch posts from API
  const fetchPosts = async (sub: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reddit?subreddit=${sub}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(subreddit);
  }, [subreddit]);

  const handleSubredditClick = (sub: string) => {
    onNavigate(`https://reddit.com/r/${sub}`, `Reddit - r/${sub}`);
  };

  const handlePostClick = (post: RedditPost) => {
    const slug = encodeURIComponent(post.title.toLowerCase().replace(/ /g, '-'));
    onNavigate(`https://reddit.com/post/${slug}`, `${post.title} : Reddit`);
  };

  const handleVote = (e: React.MouseEvent, postTitle: string, type: 'up' | 'down') => {
    e.stopPropagation();
    setPosts(prev => prev.map(p => {
      if (p.title === postTitle) {
        const currentVote = p.userVote;
        let scoreChange = 0;
        let nextVote: 'up' | 'down' | undefined = type;

        if (currentVote === type) {
          // Cancel vote
          scoreChange = type === 'up' ? -1 : 1;
          nextVote = undefined;
        } else {
          // Change vote or new vote
          if (currentVote) {
            scoreChange = type === 'up' ? 2 : -2;
          } else {
            scoreChange = type === 'up' ? 1 : -1;
          }
        }

        const updated = {
          ...p,
          score: p.score + scoreChange,
          userVote: nextVote
        };

        if (selectedPost && selectedPost.title === postTitle) {
          setSelectedPost(updated);
        }

        return updated;
      }
      return p;
    }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPost) return;

    const freshComment = {
      author: 'u/you_vos',
      body: newComment,
      score: 1,
      created: 'Just now'
    };

    const updatedPost = {
      ...selectedPost,
      numComments: selectedPost.numComments + 1,
      comments: [freshComment, ...selectedPost.comments]
    };

    setSelectedPost(updatedPost);
    setPosts(prev => prev.map(p => p.title === selectedPost.title ? updatedPost : p));
    setNewComment('');
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const freshPost: RedditPost = {
      title: newTitle,
      subreddit: newSub,
      author: 'u/you_vos',
      score: 1,
      numComments: 0,
      created: 'Just now',
      content: newContent,
      comments: []
    };

    setPosts(prev => [freshPost, ...prev]);
    setIsCreatingPost(false);
    setNewTitle('');
    setNewContent('');
  };

  const activeSubreddits = [
    { name: 'all', label: 'All Popular' },
    { name: 'technology', label: 'Technology' },
    { name: 'gaming', label: 'Gaming' },
    { name: 'science', label: 'Science' },
    { name: 'askreddit', label: 'AskReddit' }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-text">
      {/* Subreddit Header Navigation */}
      <div className="bg-slate-900 border-b border-slate-950 px-6 py-3 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF4500] rounded-full flex items-center justify-center text-white font-black text-lg shadow-md select-none">
            r
          </div>
          <span className="text-sm font-black tracking-tight text-white uppercase">reddit-vos</span>
          <div className="hidden md:flex gap-1.5 ml-6">
            {activeSubreddits.map(sub => {
              const active = subreddit === sub.name && !selectedPost;
              return (
                <button
                  key={sub.name}
                  onClick={() => handleSubredditClick(sub.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    active 
                      ? 'bg-[#FF4500]/20 text-[#FF4500] border border-[#FF4500]/30' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
        
        <button
          onClick={() => setIsCreatingPost(true)}
          className="px-3.5 py-1.5 bg-[#FF4500] hover:bg-[#FF5714] text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Post</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-4xl mx-auto w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#FF4500] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syncing reddit transmission feed...</p>
            </div>
          ) : selectedPost ? (
            /* POST DETAIL VIEW */
            <div className="space-y-6">
              <button 
                onClick={() => handleSubredditClick(subreddit)}
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 mb-2 hover:underline transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to r/{subreddit}</span>
              </button>

              <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-xl flex gap-4">
                {/* Vote Column */}
                <div className="flex flex-col items-center gap-1.5 shrink-0 select-none">
                  <button 
                    onClick={(e) => handleVote(e, selectedPost.title, 'up')}
                    className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${selectedPost.userVote === 'up' ? 'text-[#FF4500]' : 'text-slate-500'}`}
                  >
                    <ArrowUp className="w-5 h-5 font-bold" />
                  </button>
                  <span className={`text-xs font-black ${selectedPost.userVote === 'up' ? 'text-[#FF4500]' : selectedPost.userVote === 'down' ? 'text-blue-500' : 'text-slate-400'}`}>
                    {selectedPost.score.toLocaleString()}
                  </span>
                  <button 
                    onClick={(e) => handleVote(e, selectedPost.title, 'down')}
                    className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${selectedPost.userVote === 'down' ? 'text-blue-500' : 'text-slate-500'}`}
                  >
                    <ArrowDown className="w-5 h-5 font-bold" />
                  </button>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    <span className="text-slate-300">{selectedPost.subreddit}</span>
                    <span>&bull;</span>
                    <span>Posted by {selectedPost.author}</span>
                    <span>&bull;</span>
                    <span>{selectedPost.created}</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug mb-4">{selectedPost.title}</h1>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-wrap bg-slate-950/40 p-4 border border-slate-850 rounded-2xl mb-6">
                    {selectedPost.content}
                  </p>

                  {/* Comment Box */}
                  <div className="border-t border-slate-800/60 pt-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Comments ({selectedPost.numComments})</h3>
                    
                    <form onSubmit={handleAddComment} className="mb-6 flex gap-3">
                      <input 
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Join the conversation, add a comment..."
                        className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl h-12 px-4 text-xs font-medium text-slate-200 outline-none transition-all placeholder:text-slate-600"
                      />
                      <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="h-12 w-12 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0 active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {selectedPost.comments.map((comment, idx) => (
                        <div key={idx} className="bg-slate-950/30 border border-slate-850/60 rounded-2xl p-4 flex gap-3.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs select-none shrink-0 border border-white/5">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                              <span className="text-slate-300">{comment.author}</span>
                              <span>&bull;</span>
                              <span>{comment.created}</span>
                              <span>&bull;</span>
                              <span className="text-emerald-400">{comment.score} pts</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">{comment.body}</p>
                          </div>
                        </div>
                      ))}

                      {selectedPost.comments.length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-6">No comments yet. Be the first to speak!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* FEED VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#FF4500]" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">Hot Threads in r/{subreddit}</h2>
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                  {posts.length} threads synced
                </div>
              </div>

              <div className="space-y-4">
                {posts.map((post, i) => (
                  <div 
                    key={i}
                    onClick={() => handlePostClick(post)}
                    className="bg-slate-900 hover:bg-slate-850 border border-slate-800/60 hover:border-[#FF4500]/30 rounded-3xl p-5 shadow-lg flex gap-4 transition-all hover:translate-y-[-1px] hover:shadow-2xl cursor-pointer group"
                  >
                    {/* Vote Column */}
                    <div className="flex flex-col items-center gap-1 shrink-0 select-none">
                      <button 
                        onClick={(e) => handleVote(e, post.title, 'up')}
                        className={`p-1 hover:bg-slate-800 rounded-md transition-colors ${post.userVote === 'up' ? 'text-[#FF4500]' : 'text-slate-500'}`}
                      >
                        <ArrowUp className="w-4.5 h-4.5" />
                      </button>
                      <span className={`text-[11px] font-black ${post.userVote === 'up' ? 'text-[#FF4500]' : post.userVote === 'down' ? 'text-blue-500' : 'text-slate-400'}`}>
                        {post.score >= 1000 ? `${(post.score / 1000).toFixed(1)}k` : post.score}
                      </span>
                      <button 
                        onClick={(e) => handleVote(e, post.title, 'down')}
                        className={`p-1 hover:bg-slate-800 rounded-md transition-colors ${post.userVote === 'down' ? 'text-blue-500' : 'text-slate-500'}`}
                      >
                        <ArrowDown className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                        <span className="text-slate-300">{post.subreddit}</span>
                        <span>&bull;</span>
                        <span>Posted by {post.author}</span>
                        <span>&bull;</span>
                        <span>{post.created}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-snug mb-2">
                        {post.title}
                      </h3>
                      {post.content && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3 font-medium">
                          {post.content}
                        </p>
                      )}
                      
                      <div className="flex gap-4 items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <div className="flex items-center gap-1 bg-slate-950/40 px-2.5 py-1.5 rounded-full border border-slate-850">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{post.numComments} Comments</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-950/40 px-2.5 py-1.5 rounded-full border border-slate-850 hover:text-slate-300">
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {posts.length === 0 && (
                  <div className="text-center py-20 opacity-30">
                    <Flame className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-xs font-black uppercase tracking-widest">No threads found in r/{subreddit}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE POST DIALOG MODAL */}
      <AnimatePresence>
        {isCreatingPost && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">Submit New Thread</h3>
                <button 
                  onClick={() => setIsCreatingPost(false)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Destination Subreddit</label>
                  <select 
                    value={newSub}
                    onChange={(e) => setNewSub(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl h-10 px-3 text-xs text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="r/technology">r/technology</option>
                    <option value="r/gaming">r/gaming</option>
                    <option value="r/science">r/science</option>
                    <option value="r/askreddit">r/askreddit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Post Title</label>
                  <input 
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter an interesting and descriptive title..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl h-11 px-4 text-xs font-medium text-slate-200 outline-none focus:border-blue-500 placeholder:text-slate-650"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Post Body</label>
                  <textarea 
                    required
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Write your post self-text content here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium text-slate-200 outline-none focus:border-blue-500 placeholder:text-slate-650 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsCreatingPost(false)}
                    className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-[#FF4500] hover:bg-[#FF5714] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    Publish Thread
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BrowserApp() {
  // Tabs State
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const saved = localStorage.getItem('browser_tabs_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [{
      id: 'tab-1',
      title: 'Google',
      url: '',
      currentUrl: '',
      mode: 'search',
      searchQuery: '',
      results: [],
      aiResponse: '',
      history: [''],
      historyIndex: 0
    }];
  });

  const [activeTabId, setActiveTabId] = useState(() => {
    const saved = localStorage.getItem('browser_active_tab_v1');
    return saved || 'tab-1';
  });

  const [bookmarks, setBookmarks] = useState<{title: string, url: string}[]>(() => {
    const saved = localStorage.getItem('browser_bookmarks_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { title: 'Google News', url: 'https://news.google.com' },
      { title: 'Wikipedia', url: 'https://wikipedia.org' },
      { title: 'Reddit', url: 'https://reddit.com' },
      { title: 'Hacker News', url: 'https://news.ycombinator.com' }
    ];
  });

  const [historySidebar, setHistorySidebar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input value in the address bar (reflects current tab's typed text)
  const [addressBarInput, setAddressBarInput] = useState('');

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('browser_tabs_v1', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('browser_active_tab_v1', activeTabId);
  }, [activeTabId]);

  useEffect(() => {
    localStorage.setItem('browser_bookmarks_v1', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Find active tab
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Sync address bar input with active tab's URL
  useEffect(() => {
    if (activeTab) {
      if (activeTab.mode === 'search') {
        setAddressBarInput(activeTab.searchQuery);
      } else {
        setAddressBarInput(activeTab.url);
      }
    }
  }, [activeTabId, activeTab?.url, activeTab?.mode, activeTab?.searchQuery]);

  const updateActiveTab = (updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
  };

  // Navigation Logic
  const navigateTo = (destination: string) => {
    let finalUrl = destination;
    if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
      finalUrl = 'https://' + destination;
    }

    const proxiedUrl = `/api/browser/proxy?url=${encodeURIComponent(finalUrl)}`;
    
    // Add to history
    const nextHistory = activeTab.history.slice(0, activeTab.historyIndex + 1);
    nextHistory.push(finalUrl);
    const nextIndex = nextHistory.length - 1;

    updateActiveTab({
      url: finalUrl,
      currentUrl: proxiedUrl,
      mode: 'browse',
      title: finalUrl.replace('https://', '').replace('http://', '').split('/')[0],
      history: nextHistory,
      historyIndex: nextIndex
    });

    playSound('click');
  };

  const goBack = () => {
    if (activeTab.historyIndex > 0) {
      const nextIndex = activeTab.historyIndex - 1;
      const targetUrl = activeTab.history[nextIndex];
      const mode = targetUrl === '' ? 'search' : 'browse';
      const proxiedUrl = targetUrl === '' ? '' : `/api/browser/proxy?url=${encodeURIComponent(targetUrl)}`;
      
      updateActiveTab({
        url: targetUrl,
        currentUrl: proxiedUrl,
        mode: mode,
        historyIndex: nextIndex,
        title: targetUrl === '' ? 'Google' : targetUrl.replace('https://', '').replace('http://', '').split('/')[0]
      });
      playSound('click');
    }
  };

  const goForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const nextIndex = activeTab.historyIndex + 1;
      const targetUrl = activeTab.history[nextIndex];
      const mode = targetUrl === '' ? 'search' : 'browse';
      const proxiedUrl = targetUrl === '' ? '' : `/api/browser/proxy?url=${encodeURIComponent(targetUrl)}`;

      updateActiveTab({
        url: targetUrl,
        currentUrl: proxiedUrl,
        mode: mode,
        historyIndex: nextIndex,
        title: targetUrl === '' ? 'Google' : targetUrl.replace('https://', '').replace('http://', '').split('/')[0]
      });
      playSound('click');
    }
  };

  const goHome = () => {
    const nextHistory = activeTab.history.slice(0, activeTab.historyIndex + 1);
    nextHistory.push('');
    const nextIndex = nextHistory.length - 1;

    updateActiveTab({
      url: '',
      currentUrl: '',
      mode: 'search',
      searchQuery: '',
      results: [],
      aiResponse: '',
      title: 'Google',
      history: nextHistory,
      historyIndex: nextIndex
    });
    playSound('click');
  };

  // Google Search Execution
  const executeSearch = async (queryText: string, deep = false) => {
    if (!queryText.trim()) return;

    // Is it a direct URL?
    if (!deep && (queryText.startsWith('http://') || queryText.startsWith('https://') || (queryText.includes('.') && !queryText.includes(' ')))) {
      navigateTo(queryText);
      return;
    }

    setLoading(true);
    setError(null);

    // Save previous tab mode and state but switch to results mode
    updateActiveTab({
      searchQuery: queryText,
      mode: 'search',
      title: `${queryText} - Google Search`
    });

    const queryBody = deep 
      ? `Deep intelligence analysis on: "${queryText}". Return a structured overview detailing summary, insights, and facts.`
      : queryText;

    try {
      const response = await fetch('/api/browser/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryBody }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync search indexes');
      }

      updateActiveTab({
        results: data.results || [],
        aiResponse: data.text || '',
        searchQuery: queryText
      });
      playSound('success');
    } catch (err: any) {
      console.error('Google search failed:', err);
      setError(err.message || 'Search service is currently congested. Please retry.');
      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(addressBarInput);
  };

  // Tab Management
  const createNewTab = () => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newTabId,
      title: 'Google',
      url: '',
      currentUrl: '',
      mode: 'search',
      searchQuery: '',
      results: [],
      aiResponse: '',
      history: [''],
      historyIndex: 0
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
    playSound('open');
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Keep at least one tab
    
    const remaining = tabs.filter(t => t.id !== tabId);
    setTabs(remaining);
    
    if (activeTabId === tabId) {
      setActiveTabId(remaining[remaining.length - 1].id);
    }
    playSound('click');
  };

  // Bookmarks Logic
  const toggleBookmark = () => {
    const currentLoc = activeTab.mode === 'search' ? activeTab.searchQuery : activeTab.url;
    if (!currentLoc) return;

    const isBookmarked = bookmarks.some(b => b.url === currentLoc);
    if (isBookmarked) {
      setBookmarks(prev => prev.filter(b => b.url !== currentLoc));
    } else {
      const title = activeTab.title || currentLoc;
      setBookmarks(prev => [...prev, { title, url: currentLoc }]);
    }
    playSound('success');
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-slate-100 rounded-b-lg overflow-hidden font-sans border border-white/5 shadow-2xl">
      
      {/* 1. CHROME-STYLE TAB BAR */}
      <div className="bg-slate-950 px-3 pt-2 flex items-center gap-1 shrink-0 select-none border-b border-slate-900">
        <div className="flex items-center gap-1.5 overflow-x-auto flex-1 max-w-[calc(100%-120px)] scrollbar-none">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div 
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`group relative flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl cursor-pointer transition-all max-w-[150px] min-w-[100px] truncate ${
                  isActive 
                    ? 'bg-slate-800 text-slate-100 border-t-2 border-blue-500 shadow-md' 
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <Globe className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span className="truncate pr-4">{tab.title || 'Google'}</span>
                {tabs.length > 1 && (
                  <button 
                    onClick={(e) => closeTab(tab.id, e)}
                    className="absolute right-1.5 p-0.5 hover:bg-slate-750 rounded-full text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        <button 
          onClick={createNewTab}
          className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-300 transition-all hover:scale-105 active:scale-95 shadow-sm"
          title="Open New Tab"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 2. MODERN NAVIGATION TOOLBAR */}
      <div className="h-14 bg-slate-800 border-b border-slate-900 flex items-center px-4 gap-3 shrink-0 select-none shadow-sm z-10">
        <div className="flex gap-1 items-center shrink-0">
          <button 
            onClick={goBack} 
            disabled={activeTab.historyIndex <= 0}
            className="p-2 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-slate-300 transition-colors"
            title="Go Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={goForward} 
            disabled={activeTab.historyIndex >= activeTab.history.length - 1}
            className="p-2 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-slate-300 transition-colors"
            title="Go Forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              if (activeTab.mode === 'browse' && iframeRef.current) {
                iframeRef.current.src = iframeRef.current.src;
              } else if (activeTab.mode === 'search' && activeTab.searchQuery) {
                executeSearch(activeTab.searchQuery);
              }
            }}
            className="p-2 hover:bg-slate-700 rounded-xl text-slate-300 active:rotate-180 transition-transform duration-500"
            title="Reload Page"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={goHome} 
            className="p-2 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
            title="Google Search Home"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
        
        {/* URL / Address Bar */}
        <form onSubmit={handleAddressSubmit} className="flex-1 flex items-center bg-slate-950 rounded-xl h-10 px-4 border border-slate-900 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Lock className="w-3.5 h-3.5 text-emerald-400 mr-2 shrink-0" />
          <input 
            type="text" 
            value={addressBarInput}
            onChange={(e) => setAddressBarInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-xs text-slate-200 placeholder:text-slate-500 font-medium"
            placeholder="Search Google or type a web address..."
          />
          {loading && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full ml-2 shrink-0"
            />
          )}
          <button 
            type="button"
            onClick={toggleBookmark}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-yellow-400 transition-colors ml-2"
          >
            <Star className={`w-4 h-4 ${bookmarks.some(b => b.url === (activeTab.mode === 'search' ? activeTab.searchQuery : activeTab.url)) ? 'text-yellow-400 fill-yellow-400' : ''}`} />
          </button>
        </form>

        <div className="flex gap-1 shrink-0">
          <button 
            onClick={() => setHistorySidebar(!historySidebar)}
            className={`p-2 rounded-xl transition-all ${historySidebar ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-slate-700 text-slate-300'}`}
            title="Bookmarks Panel"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button 
            onClick={() => executeSearch(activeTab.searchQuery || addressBarInput, true)}
            className="px-3 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            disabled={loading || !addressBarInput.trim()}
            title="Search with Deep AI Research"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Research</span>
          </button>
        </div>
      </div>

      {/* 3. BOOKMARKS FAST BAR */}
      <div className="bg-slate-900 border-b border-slate-950 px-4 py-1.5 flex gap-2 overflow-x-auto select-none shrink-0 scrollbar-none items-center text-[11px] font-bold text-slate-400">
        <span className="text-[9px] uppercase tracking-wider font-black text-slate-500 mr-2">Bookmarks:</span>
        {bookmarks.map((b, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (b.url.startsWith('https://') || b.url.startsWith('http://')) {
                navigateTo(b.url);
              } else {
                setAddressBarInput(b.url);
                executeSearch(b.url);
              }
            }}
            className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-850 hover:text-slate-200 border border-slate-800 rounded-lg flex items-center gap-1 transition-all whitespace-nowrap active:scale-95"
          >
            <Globe className="w-3 h-3 text-blue-400 shrink-0" />
            <span>{b.title}</span>
          </button>
        ))}
      </div>

      {/* 4. MAIN BROWSER CONTENT WORKSPACE */}
      <div className="flex-1 flex relative bg-slate-950 overflow-hidden">
        
        {/* BOOKMARKS/HISTORY SIDEBAR */}
        <AnimatePresence>
          {historySidebar && (
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-slate-900 border-r border-slate-950 z-30 shadow-2xl p-5 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">Browser Bookmarks</h3>
                <button onClick={() => setHistorySidebar(false)} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                {bookmarks.map((b, idx) => (
                  <div key={idx} className="group flex items-center justify-between p-2.5 hover:bg-slate-850 rounded-xl border border-transparent hover:border-slate-800 transition-all">
                    <button 
                      onClick={() => {
                        if (b.url.startsWith('https://') || b.url.startsWith('http://')) {
                          navigateTo(b.url);
                        } else {
                          setAddressBarInput(b.url);
                          executeSearch(b.url);
                        }
                        setHistorySidebar(false);
                      }}
                      className="flex-1 text-left truncate min-w-0 pr-2"
                    >
                      <div className="text-xs font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">{b.title}</div>
                      <div className="text-[9px] text-slate-500 truncate mt-0.5">{b.url}</div>
                    </button>
                    <button 
                      onClick={() => setBookmarks(prev => prev.filter((_, i) => i !== idx))}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                      title="Delete Bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {bookmarks.length === 0 && (
                  <div className="text-center py-16 opacity-30">
                    <Star className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No bookmarks saved</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE AREA */}
        <div className="flex-1 relative bg-slate-950 overflow-y-auto">
          
          <AnimatePresence mode="wait">
            {activeTab.mode === 'search' ? (
              
              /* GOOGLE PORTAL VIEW (HOMEPAGE OR RESULTS) */
              <motion.div 
                key="google-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full w-full bg-slate-950 p-6 flex flex-col select-text"
              >
                
                {/* A. GOOGLE HOMEPAGE VIEW */}
                {!activeTab.searchQuery && !activeTab.results.length && !activeTab.aiResponse ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 max-w-lg mx-auto w-full">
                    {/* Retro Styled Google Logo */}
                    <div className="text-5xl font-extrabold tracking-tight mb-8 select-none flex font-serif">
                      <span className="text-blue-500">G</span>
                      <span className="text-red-500">o</span>
                      <span className="text-yellow-500">o</span>
                      <span className="text-blue-500">g</span>
                      <span className="text-green-500">l</span>
                      <span className="text-red-500">e</span>
                      <span className="text-blue-400 text-xs font-sans font-bold uppercase tracking-widest self-end ml-1.5 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-md">V-OS</span>
                    </div>

                    {/* Google Search Form */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const query = addressBarInput;
                        executeSearch(query);
                      }} 
                      className="w-full mb-6 relative group"
                    >
                      <input
                        type="text"
                        value={addressBarInput}
                        onChange={(e) => setAddressBarInput(e.target.value)}
                        placeholder="Search Google or type URL"
                        className="w-full bg-slate-900 hover:bg-slate-850 focus:bg-slate-900 border border-slate-800 hover:border-slate-750 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-full h-12 pl-12 pr-12 text-sm text-slate-100 outline-none transition-all"
                        autoFocus
                      />
                      <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5 group-focus-within:text-blue-400 transition-colors" />
                    </form>

                    {/* Search Buttons */}
                    <div className="flex gap-3 mb-10">
                      <button 
                        onClick={() => executeSearch(addressBarInput)}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95"
                      >
                        Google Search
                      </button>
                      <button 
                        onClick={() => {
                          const luckyQueries = ['Tokyo weather', 'How does a compiler work', 'Latest Mars Rover updates', 'History of Unix', 'Space X rocket science'];
                          const chosen = luckyQueries[Math.floor(Math.random() * luckyQueries.length)];
                          setAddressBarInput(chosen);
                          executeSearch(chosen);
                        }}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 text-blue-400"
                      >
                        I'm Feeling Lucky
                      </button>
                    </div>

                    {/* Fast Shortcuts */}
                    <div className="w-full border-t border-slate-900 pt-8">
                      <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Quick Web Portals</div>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { name: 'Wikipedia', url: 'https://wikipedia.org' },
                          { name: 'Google News', url: 'https://news.google.com' },
                          { name: 'Reddit', url: 'https://reddit.com' },
                          { name: 'GitHub', url: 'https://github.com' }
                        ].map((site) => (
                          <button
                            key={site.name}
                            onClick={() => navigateTo(site.url)}
                            className="p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-slate-400 hover:text-slate-100 hover:scale-105 active:scale-95"
                          >
                            <Globe className="w-5 h-5 text-slate-500" />
                            <span className="text-[10px] font-bold truncate max-w-full">{site.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  
                  /* B. GOOGLE SEARCH RESULTS VIEW */
                  <div className="max-w-3xl mx-auto w-full pt-4 pb-20 px-2 sm:px-6">
                    {/* Header bar within search results */}
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-4 border-b border-slate-900 pb-3">
                      <span className="text-blue-500 font-bold font-serif text-sm mr-2">G</span>
                      <span className="font-bold text-slate-100">All</span>
                      <span className="mx-1">&bull;</span>
                      <span>News</span>
                      <span className="mx-1">&bull;</span>
                      <span>Images</span>
                      <span className="mx-1">&bull;</span>
                      <span>Videos</span>
                      <div className="flex-1" />
                      <span className="text-[10px] text-slate-500">About 8 grounded references (0.32 seconds)</span>
                    </div>

                    {error && (
                      <div className="mb-8 p-4 bg-red-950/20 border border-red-900/50 rounded-2xl flex items-start gap-3 text-red-400">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <strong className="block font-bold mb-0.5">Search Connection Error</strong>
                          {error}
                        </div>
                      </div>
                    )}

                    {/* GEMINI AI SGE OVERVIEW BOX (Grounded) */}
                    {activeTab.aiResponse && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-blue-950/40 via-indigo-950/20 to-slate-950 border border-blue-900/30 rounded-3xl p-6 mb-8 shadow-xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                          <Sparkles className="w-24 h-24 text-blue-400" />
                        </div>
                        
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                            <Sparkles className="w-4 h-4 text-white animate-pulse" />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-blue-400 block leading-tight">AI Overview</span>
                            <span className="text-xs font-bold text-slate-300">Grounded with Live Web Intelligence</span>
                          </div>
                        </div>

                        <div className="markdown-body text-xs font-medium text-slate-300 leading-relaxed max-w-none prose prose-invert">
                          <Markdown>{activeTab.aiResponse}</Markdown>
                        </div>
                      </motion.div>
                    )}

                    {/* ORGANIC SEARCH RESULTS */}
                    <div className="space-y-6">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Web Results</h4>
                      {activeTab.results.map((result, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i * 0.04, 0.3) }}
                          className="group border-b border-slate-900/60 pb-5 last:border-none"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 truncate">
                            <Globe className="w-3.5 h-3.5 text-slate-600" />
                            <span className="truncate max-w-md hover:underline cursor-pointer" onClick={() => navigateTo(result.link)}>{result.link}</span>
                          </div>
                          <button 
                            onClick={() => navigateTo(result.link)}
                            className="text-base font-serif font-bold text-blue-400 group-hover:text-blue-300 hover:underline transition-colors leading-tight text-left block w-full mb-1.5"
                          >
                            {result.title}
                          </button>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">{result.desc}</p>
                        </motion.div>
                      ))}

                      {activeTab.results.length === 0 && !loading && !activeTab.aiResponse && (
                        <div className="text-center py-20 text-slate-500">
                          <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <h4 className="text-sm font-bold text-slate-400 mb-1">No Grounded Results Retrieved</h4>
                          <p className="text-xs max-w-md mx-auto text-slate-500">Try modifying your query or verifying your system internet bridge connection.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              
              /* WEB BROWSE/IFRAME VIEW */
              <motion.div 
                key="browse-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col"
              >
                {/* Proxy Secure Status Bar */}
                <div className="bg-slate-900 border-b border-slate-950 px-4 py-2.5 flex items-center gap-2 text-slate-300 text-[11px] font-bold select-none shrink-0 shadow-md">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                  <span>Secure Sandboxed Tunnel active: <span className="underline font-mono text-blue-400">{activeTab.url}</span></span>
                  <div className="flex-1" />
                  <a 
                    href={activeTab.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-3 py-1 bg-blue-600/10 hover:bg-blue-600/25 border border-blue-500/20 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 text-blue-400 font-bold"
                  >
                    Bypass Frame <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                
                {/* Embedded Webpage Frame */}
                {activeTab.url.includes('reddit.com') ? (
                  <RedditView 
                    url={activeTab.url}
                    onNavigate={(newUrl, tabTitle) => {
                      const nextHistory = activeTab.history.slice(0, activeTab.historyIndex + 1);
                      nextHistory.push(newUrl);
                      const nextIndex = nextHistory.length - 1;
                      
                      updateActiveTab({
                        url: newUrl,
                        currentUrl: `/api/browser/proxy?url=${encodeURIComponent(newUrl)}`,
                        mode: 'browse',
                        title: tabTitle || newUrl.replace('https://', '').replace('http://', '').split('/')[0],
                        history: nextHistory,
                        historyIndex: nextIndex
                      });
                      playSound('click');
                    }}
                  />
                ) : (
                  <iframe 
                    ref={iframeRef}
                    src={activeTab.currentUrl} 
                    className="flex-1 w-full border-none bg-white"
                    title="Virtual OS secure browser view"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
