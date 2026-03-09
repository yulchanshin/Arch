import type { StateCreator } from 'zustand';
import type { AppStore } from './index';
import type { Project, Iteration } from '@/types/projects';
import {
  listProjects,
  createProject as apiCreateProject,
  deleteProject as apiDeleteProject,
  renameProject as apiRenameProject,
  getIteration,
  createIteration as apiCreateIteration,
  saveIteration,
} from '@/lib/api';
import { toast } from 'sonner';

export type ProjectSlice = {
  projects: Project[];
  projectsLoading: boolean;
  currentProject: Project | null;
  currentIteration: Iteration | null;

  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;
  loadIteration: (iterationId: string) => Promise<void>;
  createIteration: (projectId: string, name: string) => Promise<void>;
  saveCurrentIteration: () => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
};

export const createProjectSlice: StateCreator<AppStore, [['zustand/immer', never]], [], ProjectSlice> = (set, get) => ({
  projects: [],
  projectsLoading: false,
  currentProject: null,
  currentIteration: null,

  fetchProjects: async () => {
    set((state) => { state.projectsLoading = true; });
    try {
      const projects = await listProjects();
      set((state) => {
        state.projects = projects;
        state.projectsLoading = false;
      });
    } catch {
      set((state) => { state.projectsLoading = false; });
    }
  },

  createProject: async (name, description) => {
    const project = await apiCreateProject(name, description);
    set((state) => {
      state.projects.unshift(project);
      state.currentProject = project;
    });
    return project.id;
  },

  deleteProject: async (id) => {
    await apiDeleteProject(id);
    set((state) => {
      state.projects = state.projects.filter((p) => p.id !== id);
      if (state.currentProject?.id === id) state.currentProject = null;
    });
  },

  renameProject: async (id, name) => {
    await apiRenameProject(id, name);
    set((state) => {
      const p = state.projects.find((p) => p.id === id);
      if (p) p.name = name;
      if (state.currentProject?.id === id) state.currentProject!.name = name;
    });
  },

  loadIteration: async (iterationId) => {
    const detail = await getIteration(iterationId);
    set((state) => {
      state.currentIteration = {
        id: detail.id,
        projectId: detail.projectId,
        name: detail.name,
        ordinal: detail.ordinal,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
      };
      // Load nodes/edges into graph state
      state.nodes = detail.nodes;
      state.edges = detail.edges;
    });
  },

  createIteration: async (projectId, name) => {
    const { nodes, edges } = get();
    const iter = await apiCreateIteration(projectId, name, nodes, edges);
    set((state) => {
      state.currentIteration = iter;
      const p = state.projects.find((p) => p.id === projectId);
      if (p) p.iterationCount = (p.iterationCount ?? 0) + 1;
    });
    toast.success(`Created version "${name}"`);
  },

  saveCurrentIteration: async () => {
    const { currentIteration, nodes, edges } = get();
    if (!currentIteration) return;
    await saveIteration(currentIteration.id, nodes, edges);
  },

  setCurrentProject: (project) => {
    set((state) => { state.currentProject = project; });
  },
});
