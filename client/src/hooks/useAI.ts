import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../services/api";
import type { Repo } from "../types/ai";

// Bullet rewrite mutation
export const useRewriteBullet = () => {
  return useMutation({
    mutationFn: async ({
      bulletPoint,
      jobDescription,
    }: {
      bulletPoint: string;
      jobDescription?: string;
    }) => {
      const res = await api.post("/ai/rewrite-bullet", {
        bulletPoint,
        jobDescription,
      });
      return res.data.rewrites as string[];
    },
  });
};

// Interview questions mutation
export const useInterviewQuestions = () => {
  return useMutation({
    mutationFn: async ({
      jobDescription,
      missingSkills,
    }: {
      jobDescription: string;
      missingSkills?: { skill: string; severity: string }[];
    }) => {
      const res = await api.post("/ai/interview-questions", {
        jobDescription,
        missingSkills,
      });
      return res.data.questions;
    },
  });
};

// Cover letter mutation
export const useCoverLetter = () => {
  return useMutation({
    mutationFn: async ({
      resumeId,
      jobDescription,
      userName,
    }: {
      resumeId?: string;
      jobDescription: string;
      userName?: string;
    }) => {
      const res = await api.post("/ai/cover-letter", {
        resumeId,
        jobDescription,
        userName,
      });
      return res.data.coverLetter as string;
    },
  });
};

// Public analyse mutation
export const usePublicAnalyse = () => {
  return useMutation({
    mutationFn: async ({
      resumeText,
      jobDescription,
    }: {
      resumeText: string;
      jobDescription: string;
    }) => {
      const res = await api.post("/resume/public-analyse", {
        resumeText,
        jobDescription,
      });
      return res.data;
    },
  });
};

export const useGithubRepos = (githubToken: string | null) => {
  return useQuery({
    queryKey: ["github-repos"],
    queryFn: async () => {
      const res = await api.get("/github/repos", {
        headers: {
          "x-github-token": githubToken || "",
        },
      });

      return res.data.repos as Repo[];
    },
    enabled: !!githubToken,
  });
};

export const useGenerateRepoBullets = () => {
  return useMutation({
    mutationFn: async ({
      repoName,
      repoDescription,
      language,
      githubToken,
    }: {
      repoName: string;
      repoDescription: string;
      language?: string;
      githubToken: string | null;
    }) => {
      const res = await api.post("/github/generate-bullets", {
        repoName,
        repoDescription,
        language,
        githubToken,
      });

      return res.data.bullets as string[];
    },
  });
};
