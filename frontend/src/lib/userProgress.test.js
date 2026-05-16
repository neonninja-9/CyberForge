import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as userProgress from './userProgress';
import { supabase } from './supabase';

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('userProgress service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('returns existing profile data', async () => {
      const mockUser = { id: 'user-1', display_name: 'Test User' };

      const mockEq = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
      });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      supabase.from.mockReturnValue({ select: mockSelect });

      const result = await userProgress.getUserProfile('user-1');

      expect(result).toEqual(mockUser);
      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('creates a new profile if PGRST116 error is returned', async () => {
      const mockEq = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      supabase.auth.getUser.mockResolvedValue({
        data: { user: { user_metadata: { full_name: 'Auth User' } } }
      });

      const mockInsertSingle = vi.fn().mockResolvedValue({
        data: { id: 'user-2', display_name: 'Auth User', avatar_url: null },
        error: null
      });
      const mockInsertSelect = vi.fn().mockReturnValue({ single: mockInsertSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockInsertSelect });

      supabase.from.mockImplementation((table) => {
        if (table === 'user_profiles') {
          return { select: mockSelect, insert: mockInsert };
        }
      });

      const result = await userProgress.getUserProfile('user-2');

      expect(result.display_name).toBe('Auth User');
      expect(mockInsert).toHaveBeenCalledWith({
        id: 'user-2',
        display_name: 'Auth User',
        avatar_url: null
      });
    });

    it('throws error for other supabase errors', async () => {
      const mockEq = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('Some error') }),
      });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      supabase.from.mockReturnValue({ select: mockSelect });

      await expect(userProgress.getUserProfile('user-3')).rejects.toThrow('Some error');
    });
  });

  describe('updateUserXP', () => {
    it('calculates new XP and level correctly', async () => {
      const mockEqSelect = vi.fn().mockResolvedValue({ data: { total_xp: 450 }, error: null });
      const mockSelect = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockEqSelect }) });

      const mockEqUpdate = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

      supabase.from.mockImplementation((table) => {
        if (table === 'user_profiles') {
          return { select: mockSelect, update: mockUpdate };
        }
      });

      const result = await userProgress.updateUserXP('user-1', 100);

      expect(result).toEqual({ total_xp: 550, level: 2 });
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        total_xp: 550,
        level: 2,
      }));
    });
  });

  describe('updateStreak', () => {
    let mockDateStr;
    let mockYesterdayStr;

    beforeEach(() => {
      const mockDate = new Date('2024-05-15T12:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      mockDateStr = '2024-05-15';
      const yesterday = new Date(mockDate);
      yesterday.setDate(yesterday.getDate() - 1);
      mockYesterdayStr = yesterday.toISOString().split('T')[0];
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('increments streak if last active was yesterday', async () => {
      const mockProfile = { id: 'user-1', streak_days: 5, best_streak: 5, last_active_date: mockYesterdayStr };
      const mockEqSelect = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
      const mockSelect = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockEqSelect }) });

      const mockEqUpdate = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

      supabase.from.mockImplementation(() => ({ select: mockSelect, update: mockUpdate }));

      const result = await userProgress.updateStreak('user-1');

      expect(result).toEqual({ streak_days: 6, best_streak: 6 });
    });

    it('resets streak to 1 if last active was before yesterday', async () => {
      const mockProfile = { id: 'user-1', streak_days: 5, best_streak: 10, last_active_date: '2024-05-10' };
      const mockEqSelect = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
      const mockSelect = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockEqSelect }) });

      const mockEqUpdate = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

      supabase.from.mockImplementation(() => ({ select: mockSelect, update: mockUpdate }));

      const result = await userProgress.updateStreak('user-1');

      expect(result).toEqual({ streak_days: 1, best_streak: 10 });
    });

    it('keeps streak the same if last active was today', async () => {
      const mockProfile = { id: 'user-1', streak_days: 3, best_streak: 3, last_active_date: mockDateStr };
      const mockEqSelect = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
      const mockSelect = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockEqSelect }) });

      const mockEqUpdate = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

      supabase.from.mockImplementation(() => ({ select: mockSelect, update: mockUpdate }));

      const result = await userProgress.updateStreak('user-1');

      expect(result).toEqual({ streak_days: 3, best_streak: 3 });
    });
  });

  describe('recordAlgorithmRun', () => {
    it('inserts a new run if it does not exist', async () => {
      const mockProfile = { id: 'user-1', total_xp: 100, streak_days: 1, best_streak: 1, last_active_date: '2024-05-15' };

      const mockSelectChain = { eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }) };
      const mockProfileSelectChain = { eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }) }) };

      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });

      supabase.from.mockImplementation((table) => {
        if (table === 'user_algorithm_runs') return { select: vi.fn().mockReturnValue(mockSelectChain), insert: mockInsert };
        if (table === 'user_profiles') return { select: vi.fn().mockReturnValue(mockProfileSelectChain), update: mockUpdate };
      });

      await userProgress.recordAlgorithmRun('user-1', 'algo-1', 'AES', 'symmetric');

      expect(mockInsert).toHaveBeenCalled();
    });

    it('updates run count if it already exists', async () => {
      const mockProfile = { id: 'user-1', total_xp: 100, streak_days: 1, best_streak: 1, last_active_date: '2024-05-15' };

      const mockSelectChain = { eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: 'run-1', run_count: 5 }, error: null }) }) }) };
      const mockProfileSelectChain = { eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }) }) };

      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

      supabase.from.mockImplementation((table) => {
        if (table === 'user_algorithm_runs') return { select: vi.fn().mockReturnValue(mockSelectChain), update: mockUpdate };
        if (table === 'user_profiles') return { select: vi.fn().mockReturnValue(mockProfileSelectChain), update: mockUpdate };
      });

      await userProgress.recordAlgorithmRun('user-1', 'algo-1', 'AES', 'symmetric');

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ run_count: 6 }));
    });
  });

  describe('recordChallengeCompletion', () => {
    it('upserts challenge and updates XP if xpEarned > 0', async () => {
      const mockProfile = { id: 'user-1', total_xp: 100 };
      const mockProfileSelectChain = { eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }) }) };

      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });

      supabase.from.mockImplementation((table) => {
        if (table === 'user_challenges') return { upsert: mockUpsert };
        if (table === 'user_profiles') return { select: vi.fn().mockReturnValue(mockProfileSelectChain), update: mockUpdate };
      });

      await userProgress.recordChallengeCompletion('user-1', 'chal-1', 50);

      expect(mockUpsert).toHaveBeenCalled();
    });
  });

  describe('getDashboardData', () => {
    it('aggregates data correctly', async () => {
      const mockProfile = { id: 'user-1', streak_days: 5, best_streak: 10 };
      const mockProfileSelectChain = { eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }) }) };

      const mockOrderAlgo = vi.fn().mockResolvedValue({ data: [{ id: 'run-1', run_count: 3 }, { id: 'run-2', run_count: 2 }], error: null });
      const mockOrderChal = vi.fn().mockResolvedValue({ data: [{ id: 'chal-1' }], error: null });
      const mockOrderPipe = vi.fn().mockResolvedValue({ data: [{ id: 'pipe-1' }, { id: 'pipe-2' }], error: null });

      supabase.from.mockImplementation((table) => {
        if (table === 'user_profiles') return { select: vi.fn().mockReturnValue(mockProfileSelectChain) };
        if (table === 'user_algorithm_runs') return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ order: mockOrderAlgo }) }) };
        if (table === 'user_challenges') return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ order: mockOrderChal }) }) };
        if (table === 'user_pipelines') return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ order: mockOrderPipe }) }) };
      });

      const data = await userProgress.getDashboardData('user-1');

      expect(data.stats.algorithmsUsed).toBe(2);
      expect(data.stats.totalRuns).toBe(5);
      expect(data.stats.challengesCompleted).toBe(1);
    });
  });
});
