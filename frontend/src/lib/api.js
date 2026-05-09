const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  return response.json()
}

export const api = {
  // Algorithms
  getAlgorithms: () => request('/api/algorithms'),
  getAlgorithm: (id) => request(`/api/algorithms/${id}`),
  executeAlgorithm: (id, data) => request(`/api/algorithms/${id}/execute`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAlgorithmCode: (id) => request(`/api/algorithms/${id}/code`),

  // Pipelines
  executePipeline: (steps) => request('/api/pipelines/execute', {
    method: 'POST',
    body: JSON.stringify({ steps }),
  }),

  // Challenges
  getChallenges: () => request('/api/challenges'),
  submitChallenge: (id, answer) => request(`/api/challenges/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  }),

  // Health
  health: () => request('/api/health'),
}
