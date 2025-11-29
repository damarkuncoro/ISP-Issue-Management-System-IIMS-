
import React, { useState } from 'react';
import { KBArticle } from '../types';
import { Search, Book, FileText, ChevronRight, Tag, Eye, Plus, ArrowLeft, Terminal, AlertCircle } from 'lucide-react';

interface KnowledgeBaseProps {
  articles: KBArticle[];
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ articles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);

  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category)))];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'SOP': return 'bg-blue-100 text-blue-700';
      case 'Troubleshooting': return 'bg-orange-100 text-orange-700';
      case 'Policy': return 'bg-red-100 text-red-700';
      case 'Scripting': return 'bg-slate-800 text-green-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Book className="text-blue-400" /> Knowledge Base
                </h2>
                <p className="text-slate-300 max-w-xl">
                    Centralized repository for SOPs, troubleshooting guides, scripts, and policy documents. 
                    Reduce MTTR by following standardized procedures.
                </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg transition flex items-center gap-2">
                <Plus size={18} /> Contribute Article
            </button>
         </div>
         {/* Decor */}
         <FileText className="absolute right-10 top-1/2 -translate-y-1/2 text-white/5 w-64 h-64 rotate-12" />
      </div>

      {selectedArticle ? (
        // ARTICLE DETAIL VIEW
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <button 
                    onClick={() => setSelectedArticle(null)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getCategoryColor(selectedArticle.category)}`}>
                            {selectedArticle.category}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Eye size={12} /> {selectedArticle.views} views
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">{selectedArticle.title}</h1>
                </div>
            </div>
            
            <div className="p-8">
                {selectedArticle.category === 'Scripting' ? (
                    <div className="bg-slate-900 rounded-lg p-6 font-mono text-sm text-green-400 overflow-x-auto shadow-inner">
                        <div className="flex items-center gap-2 text-slate-500 mb-4 border-b border-slate-800 pb-2">
                            <Terminal size={16} /> Console / Script
                        </div>
                        <pre className="whitespace-pre-wrap">{selectedArticle.content}</pre>
                    </div>
                ) : (
                    <div className="prose max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {selectedArticle.content}
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                    {selectedArticle.tags.map(tag => (
                        <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Tag size={12} /> {tag}
                        </span>
                    ))}
                </div>
                
                <div className="mt-4 text-xs text-slate-400 italic">
                    Last updated by <span className="font-semibold text-slate-600">{selectedArticle.author}</span> on {new Date(selectedArticle.last_updated).toLocaleDateString()}
                </div>
            </div>
        </div>
      ) : (
        // LIST VIEW
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase">Categories</h4>
                    <div className="space-y-1">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                                    selectedCategory === cat 
                                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-2 text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> Top Viewed
                    </h4>
                    <ul className="space-y-3">
                        {articles.sort((a,b) => b.views - a.views).slice(0,3).map(art => (
                            <li key={art.id} onClick={() => setSelectedArticle(art)} className="text-xs text-blue-700 hover:underline cursor-pointer leading-tight">
                                {art.title}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Article List */}
            <div className="lg:col-span-3 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search for solutions, error codes, or SOPs..." 
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredArticles.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                        <Book size={48} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No articles found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
                        {filteredArticles.map(article => (
                            <div 
                                key={article.id} 
                                onClick={() => setSelectedArticle(article)}
                                className="p-5 hover:bg-slate-50 cursor-pointer group transition flex items-start gap-4"
                            >
                                <div className={`p-3 rounded-lg flex-shrink-0 ${getCategoryColor(article.category).replace('text', 'bg').replace('100', '50')}`}>
                                    <FileText size={20} className={getCategoryColor(article.category).split(' ')[1]} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getCategoryColor(article.category)}`}>
                                            {article.category}
                                        </span>
                                        <span className="text-xs text-slate-400">• {new Date(article.last_updated).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition truncate">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                        {article.content.substring(0, 150)}...
                                    </p>
                                    <div className="flex items-center gap-2 mt-3">
                                        {article.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded flex items-center gap-1">
                                                <Tag size={10} /> {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 self-center" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;