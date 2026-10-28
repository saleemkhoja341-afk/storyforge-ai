import React, { useState, useRef } from 'react';
import { 
  FolderGit2, 
  Search, 
  Download, 
  Upload, 
  Trash2, 
  CopyCheck, 
  Edit3, 
  Clapperboard, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Project } from '../types';

interface MyProjectsViewProps {
  projects: Project[];
  activeProjectId: string | null;
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: Project) => void;
  onRenameProject: (projectId: string, newTitle: string) => void;
  onImportProjects: (imported: Project[]) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onCreateNew: () => void;
}

export const MyProjectsView: React.FC<MyProjectsViewProps> = ({
  projects,
  onOpenProject,
  onDeleteProject,
  onDuplicateProject,
  onRenameProject,
  onImportProjects,
  showToast,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category)))];

  const filtered = projects.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleExportAll = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `storyforge_projects_vault_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported all projects to JSON backup!', 'success');
  };

  const handleExportSingle = (project: Project) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.title.replace(/\s+/g, '_')}_storyforge.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported "${project.title}" to JSON!`, 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportProjects(parsed);
          showToast(`Imported ${parsed.length} projects successfully!`, 'success');
        } else if (parsed.id && parsed.title) {
          onImportProjects([parsed]);
          showToast(`Imported project "${parsed.title}"!`, 'success');
        } else {
          showToast('Invalid StoryForge JSON file format', 'error');
        }
      } catch {
        showToast('Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRenameSubmit = (id: string) => {
    if (renameValue.trim()) {
      onRenameProject(id, renameValue.trim());
      showToast('Project renamed successfully!', 'success');
    }
    setRenamingId(null);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23273D] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="font-semibold text-violet-400">Project Vault</span>
            <span aria-hidden="true">·</span>
            <span>Local Storage & Backup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white flex items-center gap-2.5">
            <span>My Projects</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, reopen, duplicate, and export your multi-episode stories. All data persists safely in your local browser storage.
          </p>
        </div>

        {/* Import / Export Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-[#0E1018] border border-[#23273D] hover:border-slate-500 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Import JSON</span>
          </button>
          <button
            onClick={handleExportAll}
            disabled={projects.length === 0}
            className="px-3.5 py-2 rounded-xl bg-[#0E1018] border border-[#23273D] hover:border-slate-500 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-violet-400" />
            <span>Export All ({projects.length})</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search projects by title, summary, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {categories.length > 2 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-[#0E1018] text-slate-400 hover:text-slate-200 border border-[#23273D]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center border border-dashed border-[#23273D]">
          <Clapperboard className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            {projects.length === 0 ? 'No Projects in Vault Yet' : 'No Projects Found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {projects.length === 0
              ? 'Generate your first story arc to start building your video production vault.'
              : 'Try clearing your search query.'}
          </p>
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create New Story</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="glass-card rounded-2xl p-5 border border-[#23273D] flex flex-col justify-between"
            >
              <div>
                {/* Clean unboxed metadata */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-violet-400">{proj.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{proj.episodes?.length || 1} Ep</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{proj.aspectRatio || '9:16'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleExportSingle(proj)}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#0E1018] cursor-pointer"
                      title="Export JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDuplicateProject(proj)}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#0E1018] cursor-pointer"
                      title="Duplicate"
                    >
                      <CopyCheck className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete story project "${proj.title}"?`)) {
                          onDeleteProject(proj.id);
                          showToast(`Deleted "${proj.title}"`, 'info');
                        }
                      }}
                      className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {renamingId === proj.id ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="w-full bg-[#0E1018] border border-violet-500 rounded-lg px-2.5 py-1 text-xs text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRenameSubmit(proj.id)}
                      className="px-2 py-1 rounded-lg bg-violet-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group">
                    <h3
                      onClick={() => onOpenProject(proj.id)}
                      className="font-bold text-white text-base line-clamp-1 hover:text-cyan-400 cursor-pointer transition-colors"
                    >
                      {proj.title}
                    </h3>
                    <button
                      onClick={() => {
                        setRenamingId(proj.id);
                        setRenameValue(proj.title);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 cursor-pointer transition-opacity"
                      title="Rename"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <p
                  className={`text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed ${
                    proj.language === 'Urdu' ? 'rtl-text text-right text-sm text-slate-300' : ''
                  }`}
                >
                  {proj.summary}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#23273D] flex items-center justify-between text-xs text-slate-400">
                <span>{new Date(proj.updatedAt || proj.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => onOpenProject(proj.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Flow Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
