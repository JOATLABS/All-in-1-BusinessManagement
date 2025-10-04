const simulateDelay = () => new Promise((resolve) => setTimeout(resolve, 500));

export interface AuthResponse {
  token: string;
  email: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  await simulateDelay();

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error('Enter a valid email address');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // TODO: Replace with API call once the authentication endpoint is available.
  const token = btoa(`${email}:${Date.now()}`);
  return { token, email };
};

export const logout = async () => {
  await simulateDelay();
  return true;
};
