import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import type { Analysis } from "../types/analysis";

// Query keys — centralized
export const queryKeys = {
  resumes: ["resumes"] as const,
  analyses: ["analyses"] as const,
  me: ["me"] as const,
};

// Resumes fetch hook
export const useResumes = () => {
  return useQuery({
    queryKey: queryKeys.resumes,
    queryFn: async () => {
      const res = await api.get("/resume/my-resumes");
      return res.data.resumes;
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
};

// Analyses fetch hook
export const useAnalyses = () => {
  return useQuery<Analysis[]>({
    queryKey: queryKeys.analyses,
    queryFn: async () => {
      const res = await api.get("/resume/analyses");
      return res.data.analyses;
    },
  });
};

// Upload resume mutation
export const useUploadResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.resume;
    },
    onSuccess: () => {
      // Upload hone ke baad resumes list automatically refresh ho
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes });
    },
  });
};

// Analyse mutation
export const useAnalyseResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resumeId,
      jobDescription,
    }: {
      resumeId: string;
      jobDescription: string;
    }) => {
      const res = await api.post("/resume/analyse", {
        resumeId,
        jobDescription,
      });
      return res.data.analysis;
    },
    onSuccess: () => {
      // Analysis hone ke baad history automatically refresh ho
      queryClient.invalidateQueries({ queryKey: queryKeys.analyses });
    },
  });
};

// Delete resume mutation
export const useDeleteResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resumeId: string) => {
      await api.delete(`/resume/${resumeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes });
    },
  });
};
