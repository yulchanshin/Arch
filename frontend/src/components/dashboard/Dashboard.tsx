import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, SortAsc, Layers, GitBranch, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { DashboardHeader } from './DashboardHeader';
import { ProjectCard } from './ProjectCard';
import { NewProjectModal } from './NewProjectModal';
import { toast } from 'sonner';
import type { Project } from '@/types/projects';

type SortKey = 'updatedAt' | 'name' | 'createdAt' | 'nodeCount';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'updatedAt', label: 'Last Modified' },
  { key: 'name', label: 'Name A→Z' },
  { key: 'createdAt', label: 'Created Date' },
  { key: 'nodeCount', label: 'Node Count' },
];

function sortProjects(projects: Project[], key: SortKey): Project[] {
  return [...projects].sort((a, b) => {
    if (key === 'name') return a.name.localeCompare(b.name);
    if (key === 'nodeCount') return b.nodeCount - a.nodeCount;
    if (key === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      {/* Illustration */}
      <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="4" y="16" width="12" height="8" rx="2" fill="#e5e7eb" />
          <rect x="24" y="4" width="12" height="8" rx="2" fill="#d1d5db" />
          <rect x="24" y="28" width="12" height="8" rx="2" fill="#d1d5db" />
          <line x1="16" y1="20" x2="24" y2="8" stroke="#9ca3af" strokeWidth="1.5" />
          <line x1="16" y1="20" x2="24" y2="32" stroke="#9ca3af" strokeWidth="1.5" />
          <circle cx="16" cy="20" r="2" fill="#6b7280" />
          <circle cx="24" cy="8" r="2" fill="#6b7280" />
          <circle cx="24" cy="32" r="2" fill="#6b7280" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Start your first architecture</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6 leading-relaxed">
        Describe your system in natural language and let AI build the diagram for you.
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
      >
        <Plus size={15} />
        Create Project
      </button>
    </motion.div>
  );
}

export function Dashboard() {
  const { authLoading } = useAuth();
  const navigate = useNavigate();
  const projects = useStore((s) => s.projects);
  const projectsLoading = useStore((s) => s.projectsLoading);
  const fetchProjects = useStore((s) => s.fetchProjects);
  const createProject = useStore((s) => s.createProject);
  const deleteProject = useStore((s) => s.deleteProject);
  const renameProject = useStore((s) => s.renameProject);
  const user = useStore((s) => s.user);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortOpen, setSortOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && user) fetchProjects();
  }, [authLoading, user, fetchProjects]);

  const filtered = sortProjects(
    projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    sortKey
  );

  const totalNodes = projects.reduce((sum, p) => sum + p.nodeCount, 0);

  const handleCreate = async (name: string, description: string) => {
    try {
      const projectId = await createProject(name, description);
      navigate(`/workspace?project=${projectId}`);
    } catch {
      toast.error('Failed to create project');
    }
  };

  const handleOpen = (project: Project) => {
    navigate(`/workspace?project=${project.id}`);
  };

  const handleDelete = async (project: Project) => {
    try {
      await deleteProject(project.id);
      toast.success(`Deleted "${project.name}"`);
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleRename = async (project: Project, name: string) => {
    try {
      await renameProject(project.id, name);
    } catch {
      toast.error('Failed to rename project');
    }
  };

  const handleDuplicate = async (project: Project) => {
    try {
      await createProject(`${project.name} (copy)`);
      toast.success('Project duplicated');
      fetchProjects();
    } catch {
      toast.error('Failed to duplicate project');
    }
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page title + CTA */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus size={15} />
            New Project
          </button>
        </div>

        {/* Stats bar */}
        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            {[
              { icon: Layers, label: 'Projects', value: projects.length },
              { icon: GitBranch, label: 'Total Nodes', value: totalNodes },
              { icon: Clock, label: 'Last Active', value: 'Just now' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Search + sort */}
        {projects.length > 0 && (
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none placeholder:text-gray-400 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <SortAsc size={14} className="text-gray-400" />
                <span className="hidden sm:inline">{currentSortLabel}</span>
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden p-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { setSortKey(opt.key); setSortOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                          sortKey === opt.key
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Loading */}
        {projectsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-52 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!projectsLoading && projects.length === 0 && (
          <EmptyState onNew={() => setModalOpen(true)} />
        )}

        {/* Project grid */}
        {!projectsLoading && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => handleOpen(project)}
                onRename={(name) => handleRename(project, name)}
                onDelete={() => handleDelete(project)}
                onDuplicate={() => handleDuplicate(project)}
              />
            ))}

            {/* New project card */}
            <motion.button
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              onClick={() => setModalOpen(true)}
              className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-2 h-52 text-gray-400 hover:text-blue-500"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Plus size={18} />
              </div>
              <span className="text-sm font-medium">New Project</span>
            </motion.button>
          </motion.div>
        )}

        {/* No results for search */}
        {!projectsLoading && projects.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-gray-500">No projects match "{search}"</p>
          </div>
        )}
      </main>

      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
