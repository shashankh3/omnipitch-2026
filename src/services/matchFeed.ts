export interface MatchFeedSlide {
    id: number;
    text: string;
    isGoal: boolean;
}

export interface MatchFeedResponse {
    liveMatch: {
        homeTeam: string;
        awayTeam: string;
        homeScore: number;
        awayScore: number;
        minute: number;
        primaryColor: string;
        secondaryColor: string;
        slides: MatchFeedSlide[];
    };
    completedMatch: {
        homeTeam: string;
        awayTeam: string;
        homeScore: number;
        awayScore: number;
    };
    upcomingMatch: {
        homeTeam: string;
        awayTeam: string;
        time: string;
    };
}

type MatchFeedStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

interface RawMatchFeedShape {
    liveMatch: Record<string, unknown>;
    completedMatch: Record<string, unknown>;
    upcomingMatch: Record<string, unknown>;
}

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const CONTROL_CHARACTERS_PATTERN = /[\x00-\x1F\x7F]/g;
const HTML_TAG_PATTERN = /<[^>]*>/g;

export const MATCH_FEED_CACHE_KEY = 'omnipitch_match_feed_v2';
export const MATCH_FEED_UPDATED_EVENT = 'omnipitch:match-feed-updated';
export const MATCH_FEED_CACHE_TTL_MS = 60 * 1000;

export const DEFAULT_MATCH_FEED: MatchFeedResponse = {
    liveMatch: {
        homeTeam: 'Argentina',
        awayTeam: 'Egypt',
        homeScore: 3,
        awayScore: 2,
        minute: 90,
        primaryColor: '#43a1d5',
        secondaryColor: '#c09300',
        slides: [
            {
                id: 1,
                text: 'Incredible atmosphere in the stadium as fans respond to the live operational feed.',
                isGoal: false
            }
        ]
    },
    completedMatch: {
        homeTeam: 'Brazil',
        awayTeam: 'France',
        homeScore: 1,
        awayScore: 1
    },
    upcomingMatch: {
        homeTeam: 'Spain',
        awayTeam: 'Germany',
        time: '18:00'
    }
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizePlainText(value: unknown, fallback: string, maxLength = 160): string {
    if (typeof value !== 'string' && typeof value !== 'number') return fallback;

    const sanitized = String(value)
        .replace(CONTROL_CHARACTERS_PATTERN, '')
        .replace(HTML_TAG_PATTERN, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);

    return sanitized || fallback;
}

function toBoundedInteger(value: unknown, fallback: number, min: number, max: number): number {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return fallback;
    return Math.min(max, Math.max(min, Math.round(numericValue)));
}

function normalizeHexColor(value: unknown, fallback: string): string {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return HEX_COLOR_PATTERN.test(trimmed) ? trimmed : fallback;
}

function normalizeSlide(value: unknown, index: number, fallback: MatchFeedSlide): MatchFeedSlide {
    if (!isRecord(value)) {
        return { ...fallback, id: index + 1 };
    }

    return {
        id: toBoundedInteger(value.id, index + 1, 1, 99),
        text: sanitizePlainText(value.text, fallback.text, 220),
        isGoal: value.isGoal === true
    };
}

function hasMinimumFeedShape(value: unknown): value is RawMatchFeedShape {
    if (!isRecord(value)) return false;
    return isRecord(value.liveMatch) && isRecord(value.completedMatch) && isRecord(value.upcomingMatch);
}

export function cloneMatchFeed(feed: MatchFeedResponse = DEFAULT_MATCH_FEED): MatchFeedResponse {
    return {
        liveMatch: {
            ...feed.liveMatch,
            slides: feed.liveMatch.slides.map(slide => ({ ...slide }))
        },
        completedMatch: { ...feed.completedMatch },
        upcomingMatch: { ...feed.upcomingMatch }
    };
}

export function normalizeMatchFeed(
    value: unknown,
    fallback: MatchFeedResponse = DEFAULT_MATCH_FEED
): MatchFeedResponse | null {
    if (!hasMinimumFeedShape(value)) return null;

    const liveMatch = value.liveMatch;
    const completedMatch = value.completedMatch;
    const upcomingMatch = value.upcomingMatch;
    const fallbackFeed = cloneMatchFeed(fallback);
    const slidesSource = Array.isArray(liveMatch.slides) ? liveMatch.slides : fallbackFeed.liveMatch.slides;
    const slides = slidesSource
        .slice(0, 5)
        .map((slide, index) => normalizeSlide(slide, index, fallbackFeed.liveMatch.slides[0]))
        .filter(slide => slide.text.length > 0);

    return {
        liveMatch: {
            homeTeam: sanitizePlainText(liveMatch.homeTeam, fallbackFeed.liveMatch.homeTeam, 24).toUpperCase(),
            awayTeam: sanitizePlainText(liveMatch.awayTeam, fallbackFeed.liveMatch.awayTeam, 24).toUpperCase(),
            homeScore: toBoundedInteger(liveMatch.homeScore, fallbackFeed.liveMatch.homeScore, 0, 20),
            awayScore: toBoundedInteger(liveMatch.awayScore, fallbackFeed.liveMatch.awayScore, 0, 20),
            minute: toBoundedInteger(liveMatch.minute, fallbackFeed.liveMatch.minute, 0, 130),
            primaryColor: normalizeHexColor(liveMatch.primaryColor, fallbackFeed.liveMatch.primaryColor),
            secondaryColor: normalizeHexColor(liveMatch.secondaryColor, fallbackFeed.liveMatch.secondaryColor),
            slides: slides.length > 0 ? slides : fallbackFeed.liveMatch.slides
        },
        completedMatch: {
            homeTeam: sanitizePlainText(completedMatch.homeTeam, fallbackFeed.completedMatch.homeTeam, 24).toUpperCase(),
            awayTeam: sanitizePlainText(completedMatch.awayTeam, fallbackFeed.completedMatch.awayTeam, 24).toUpperCase(),
            homeScore: toBoundedInteger(completedMatch.homeScore, fallbackFeed.completedMatch.homeScore, 0, 20),
            awayScore: toBoundedInteger(completedMatch.awayScore, fallbackFeed.completedMatch.awayScore, 0, 20)
        },
        upcomingMatch: {
            homeTeam: sanitizePlainText(upcomingMatch.homeTeam, fallbackFeed.upcomingMatch.homeTeam, 24).toUpperCase(),
            awayTeam: sanitizePlainText(upcomingMatch.awayTeam, fallbackFeed.upcomingMatch.awayTeam, 24).toUpperCase(),
            time: sanitizePlainText(upcomingMatch.time, fallbackFeed.upcomingMatch.time, 32)
        }
    };
}

export function readCachedMatchFeed(
    storage: MatchFeedStorage = window.localStorage,
    now = Date.now()
): MatchFeedResponse | null {
    try {
        const cached = storage.getItem(MATCH_FEED_CACHE_KEY);
        if (!cached) return null;

        const parsed = JSON.parse(cached) as unknown;
        if (!isRecord(parsed) || typeof parsed.timestamp !== 'number' || now - parsed.timestamp > MATCH_FEED_CACHE_TTL_MS) {
            storage.removeItem(MATCH_FEED_CACHE_KEY);
            return null;
        }

        const feed = normalizeMatchFeed(parsed.data);
        if (!feed) {
            storage.removeItem(MATCH_FEED_CACHE_KEY);
            return null;
        }

        return feed;
    } catch {
        storage.removeItem(MATCH_FEED_CACHE_KEY);
        return null;
    }
}

export function writeCachedMatchFeed(
    feed: MatchFeedResponse,
    storage: MatchFeedStorage = window.localStorage,
    now = Date.now(),
    eventTarget: Pick<Window, 'dispatchEvent'> | null = typeof window === 'undefined' ? null : window
): void {
    storage.setItem(MATCH_FEED_CACHE_KEY, JSON.stringify({ timestamp: now, data: feed }));
    eventTarget?.dispatchEvent(new CustomEvent(MATCH_FEED_UPDATED_EVENT, { detail: feed }));
}
