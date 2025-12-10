import { api } from "./api";

export interface User {
  id: number;
  username: string;
  email: string;
  user_type: "farmer" | "buyer";
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private tokenKey = "agronexus_token";
  private userKey = "agronexus_user";

  /**
   * Register new user
   */
  async register(data: {
    username: string;
    email: string;
    password: string;
    user_type: "farmer" | "buyer";
    first_name?: string;
    last_name?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/register", data);
      const { token, user } = response.data;
      
      // Store token and user
      this.setToken(token);
      this.setUser(user);
      
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;
      
      // Store token and user
      this.setToken(token);
      this.setUser(user);
      
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  async getMe(): Promise<User> {
    try {
      const response = await api.get("/auth/me");
      return response.data.user;
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
      this.clearAuth();
    } catch (error) {
      console.error("Logout error:", error);
      this.clearAuth();
    }
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Set token in localStorage
   */
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Get stored user
   */
  getUser(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Set user in localStorage
   */
  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Check if user is farmer
   */
  isFarmer(): boolean {
    return this.getUser()?.user_type === "farmer";
  }

  /**
   * Check if user is buyer
   */
  isBuyer(): boolean {
    return this.getUser()?.user_type === "buyer";
  }

  /**
   * Clear authentication data
   */
  clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }
}

export default new AuthService();
