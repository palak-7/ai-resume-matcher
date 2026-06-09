type UserLike = {
  id?: string;
  _id?: string;
} | null;

const legacyGitHubTokenKey = "github_token";

export const getGitHubTokenKey = (user: UserLike) => {
  const userId = user?.id || user?._id;
  return userId ? `github_token:${userId}` : null;
};

export const getGitHubToken = (user: UserLike) => {
  const key = getGitHubTokenKey(user);
  return key ? localStorage.getItem(key) : null;
};

export const setGitHubToken = (user: UserLike, token: string) => {
  const key = getGitHubTokenKey(user);
  if (!key) return false;

  localStorage.setItem(key, token);
  localStorage.removeItem(legacyGitHubTokenKey);
  return true;
};

export const removeGitHubToken = (user: UserLike) => {
  const key = getGitHubTokenKey(user);
  if (key) {
    localStorage.removeItem(key);
  }
  localStorage.removeItem(legacyGitHubTokenKey);
};
