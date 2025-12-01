import { API_BASE_URL, API_ENDPOINTS, REQUEST_CONFIG } from "../config/api.js";

// API Client class
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem("authToken");
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Ensure we pick up any token that may have been written to localStorage
    try {
      const stored = localStorage.getItem("authToken");
      if (stored && stored !== this.token) this.token = stored;
    } catch (e) {
      // ignore localStorage errors
    }

    const config = {
      ...REQUEST_CONFIG,
      ...options,
      headers: {
        ...REQUEST_CONFIG.headers,
        ...options.headers,
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    };

    // If body is FormData, remove Content-Type header so browser can set the correct
    // multipart boundary. REQUEST_CONFIG sets application/json by default which
    // would cause the server to try parsing multipart data as JSON.
    if (
      options &&
      options.body &&
      typeof FormData !== "undefined" &&
      options.body instanceof FormData
    ) {
      if (config.headers && config.headers["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    const response = await this.request(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    this.setToken(response.token);
    return response;
  }

  async register(data) {
    const response = await this.request(API_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify(data),
    });

    this.setToken(response.token);
    return response;
  }

  async getCurrentUser() {
    return this.request(API_ENDPOINTS.AUTH.ME);
  }

  async updateCurrentUser(data) {
    return this.request(API_ENDPOINTS.AUTH.ME, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getNotifications() {
    return this.request("/notifications");
  }

  async getSubmissions() {
    return this.request("/submissions");
  }

  async settleSubmission(id, payload = {}) {
    return this.request(`/submissions/${id}/settle`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getProjectSubmissions(projectId) {
    return this.request(`/submissions/project/${projectId}`);
  }

  async submitMilestone(projectId, index, formData) {
    return this.request(`/projects/${projectId}/milestones/${index}/submit`, {
      method: "POST",
      headers: {},
      body: formData,
    });
  }

  async verifyMilestone(projectId, index, submissionId, decision) {
    return this.request(`/projects/${projectId}/milestones/${index}/verify`, {
      method: "POST",
      body: JSON.stringify({ submissionId, decision }),
    });
  }

  async registerProjectOnChain(projectId) {
    return this.request(`/projects/${projectId}/onchain`, { method: "POST" });
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: "PUT",
    });
  }

  // Project methods
  async getProjects() {
    return this.request(API_ENDPOINTS.PROJECTS.LIST);
  }

  async getProject(id) {
    return this.request(API_ENDPOINTS.PROJECTS.GET(id));
  }

  async createProject(data) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    if (data.totalSubsidy !== undefined)
      formData.append("totalSubsidy", String(data.totalSubsidy));
    if (data.milestones)
      formData.append("milestones", JSON.stringify(data.milestones));

    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    return this.request(API_ENDPOINTS.PROJECTS.CREATE, {
      method: "POST",
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async enrollProject(projectId, data) {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.attachments) {
      data.attachments.forEach((file) => formData.append("attachments", file));
    }
    return this.request(`/projects/${projectId}/enroll`, {
      method: "POST",
      headers: {},
      body: formData,
    });
  }

  async getApprovedProjects() {
    // Public endpoint for approved projects (no auth required)
    return this.request("/projects/public");
  }

  async updateProject(id, data) {
    const formData = new FormData();

    if (data.title) formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.status) formData.append("status", data.status);

    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    return this.request(API_ENDPOINTS.PROJECTS.UPDATE(id), {
      method: "PUT",
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async addMilestone(projectId, milestone) {
    return this.request(`/projects/${projectId}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(milestone),
    });
  }

  async editMilestone(projectId, index, milestone) {
    return this.request(`/projects/${projectId}/milestones/${index}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(milestone),
    });
  }

  async reorderMilestones(projectId, order) {
    return this.request(`/projects/${projectId}/milestones/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
  }

  async makeProjectDecision(id, decision) {
    return this.request(API_ENDPOINTS.PROJECTS.DECISION(id), {
      method: "POST",
      body: JSON.stringify({ decision }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request(API_ENDPOINTS.HEALTH);
  }

  async getAuditLogs() {
    return this.request("/audit-logs");
  }

  // Stats
  async getStats() {
    return this.request(`/stats`);
  }

  // Open a Server-Sent Events connection to stats stream
  // Returns an EventSource instance (caller should close when done)
  streamStats() {
    // EventSource cannot set Authorization header; stream endpoints are unauthenticated in backend
    if (
      typeof window === "undefined" ||
      typeof window.EventSource === "undefined"
    ) {
      // Not running in a browser-like environment
      console.warn("EventSource not available in this environment");
      return null;
    }
    const url = `${this.baseURL}/stream/stats`;
    try {
      return new EventSource(url);
    } catch (e) {
      console.error("Failed to open EventSource", e);
      return null;
    }
  }

  // Token management
  setToken(token) {
    this.token = token;
    localStorage.setItem("authToken", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("authToken");
  }

  isAuthenticated() {
    return !!this.token;
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
