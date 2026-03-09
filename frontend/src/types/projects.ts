export type PreviewNode = {
  type: string;
  x: number;
  y: number;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  nodeCount: number;
  iterationCount: number;
  createdAt: string;
  updatedAt: string;
  firstIterationId?: string;
  previewNodes?: PreviewNode[];
};

export type Iteration = {
  id: string;
  projectId: string;
  name: string;
  ordinal: number;
  createdAt: string;
  updatedAt: string;
};
