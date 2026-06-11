export interface MissingSkill {
  skill: string;
  severity: "high" | "medium" | "low";
}

export interface Analysis {
  _id: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: MissingSkill[];
  suggestions: string[];
  jobDescription: string;
  createdAt: string;
}
