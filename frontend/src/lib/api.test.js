import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api } from './api'

const API_BASE = 'http://localhost:8000'

describe('api client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('request function (via getAlgorithms)', () => {
    it('should make a GET request with default headers', async () => {
      const mockData = [{ id: 'test', name: 'Test Algorithm' }]
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      })

      const result = await api.getAlgorithms()

      expect(fetch).toHaveBeenCalledWith(`${API_BASE}/api/algorithms`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockData)
    })

    it('should make a POST request with provided options', async () => {
      const mockData = { result: 'success' }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      })

      const requestData = { test: 'data' }
      const result = await api.executeAlgorithm('test-id', requestData)

      expect(fetch).toHaveBeenCalledWith(`${API_BASE}/api/algorithms/test-id/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      expect(result).toEqual(mockData)
    })

    it('should throw an error with JSON details when response is not ok', async () => {
      const errorMessage = 'Something went wrong'
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: errorMessage })
      })

      await expect(api.getAlgorithms()).rejects.toThrow(errorMessage)
    })

    it('should throw an error with status code when JSON parsing fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      await expect(api.getAlgorithms()).rejects.toThrow('An error occurred')
    })

    it('should throw an error with status code when error JSON does not have detail', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({})
      })

      await expect(api.getAlgorithms()).rejects.toThrow('HTTP 404')
    })
  })
})
