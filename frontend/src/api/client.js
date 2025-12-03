const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }
        throw new Error(errorData.error || errorData.detail || `Request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Cannot connect to backend at ${this.baseURL}. Make sure the Flask server is running.`);
      }
      throw error;
    }
  }

  async detect(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return this.request('/api/detect', {
      method: 'POST',
      body: formData,
    });
  }

  async crop(imagePath, boxes) {
    return this.request('/api/crop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_path: imagePath,
        boxes: boxes,
      }),
    });
  }

  async ocr(cropMap) {
    return this.request('/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        crop_map: cropMap,
      }),
    });
  }

  async health() {
    return this.request('/api/health', {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;

