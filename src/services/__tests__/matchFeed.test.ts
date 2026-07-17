import { describe, expect, it, vi } from 'vitest';
import {
    DEFAULT_MATCH_FEED,
    MATCH_FEED_CACHE_KEY,
    MATCH_FEED_UPDATED_EVENT,
    normalizeMatchFeed,
    readCachedMatchFeed,
    writeCachedMatchFeed,
    type MatchFeedResponse
} from '../matchFeed';

function createMemoryStorage(initial?: Record<string, string>): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
    const values = new Map(Object.entries(initial ?? {}));

    return {
        getItem: vi.fn((key: string) => values.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
            values.set(key, value);
        }),
        removeItem: vi.fn((key: string) => {
            values.delete(key);
        })
    };
}

const rawFeed = {
    liveMatch: {
        homeTeam: '<img src=x onerror=alert(1)>usa\u0000',
        awayTeam: 'mexico',
        homeScore: 99,
        awayScore: -4,
        minute: 131,
        primaryColor: 'not-a-color',
        secondaryColor: '#006847',
        slides: [
            { id: 1, text: '<span class="danger">Goal!</span>\u0007', isGoal: true },
            { id: 2, text: 'Fans are moving safely through Gate A.', isGoal: false }
        ]
    },
    completedMatch: {
        homeTeam: 'Brazil',
        awayTeam: 'France',
        homeScore: 2,
        awayScore: 1
    },
    upcomingMatch: {
        homeTeam: 'Spain',
        awayTeam: 'Germany',
        time: '18:00 Local'
    }
};

describe('matchFeed service', () => {
    it('normalizes untrusted match feed payloads into safe bounded data', () => {
        const normalized = normalizeMatchFeed(rawFeed)!;

        expect(normalized.liveMatch.homeTeam).toBe('USA');
        expect(normalized.liveMatch.homeScore).toBe(20);
        expect(normalized.liveMatch.awayScore).toBe(0);
        expect(normalized.liveMatch.minute).toBe(130);
        expect(normalized.liveMatch.primaryColor).toBe(DEFAULT_MATCH_FEED.liveMatch.primaryColor);
        expect(normalized.liveMatch.secondaryColor).toBe('#006847');
        expect(normalized.liveMatch.slides[0].text).toBe('Goal!');
        expect(normalized.liveMatch.slides[0].text).not.toContain('<');
    });

    it('returns null and clears cache for malformed cached payloads', () => {
        const storage = createMemoryStorage({ [MATCH_FEED_CACHE_KEY]: '{not-json' });

        expect(readCachedMatchFeed(storage, 1_000)).toBeNull();
        expect(storage.removeItem).toHaveBeenCalledWith(MATCH_FEED_CACHE_KEY);
    });

    it('returns normalized cached feed while it is fresh', () => {
        const storage = createMemoryStorage({
            [MATCH_FEED_CACHE_KEY]: JSON.stringify({ timestamp: 1_000, data: rawFeed })
        });

        const feed = readCachedMatchFeed(storage, 2_000);

        expect(feed?.liveMatch.homeTeam).toBe('USA');
        expect(feed?.liveMatch.slides).toHaveLength(2);
        expect(storage.removeItem).not.toHaveBeenCalled();
    });

    it('writes cache and emits a same-tab scoreboard update event', () => {
        const storage = createMemoryStorage();
        const dispatchEvent = vi.fn();
        const feed: MatchFeedResponse = normalizeMatchFeed(rawFeed)!;

        writeCachedMatchFeed(feed, storage, 7_500, { dispatchEvent });

        expect(storage.setItem).toHaveBeenCalledWith(
            MATCH_FEED_CACHE_KEY,
            JSON.stringify({ timestamp: 7_500, data: feed })
        );
        expect(dispatchEvent).toHaveBeenCalledTimes(1);
        expect(dispatchEvent.mock.calls[0][0]).toMatchObject({ type: MATCH_FEED_UPDATED_EVENT, detail: feed });
    });
});