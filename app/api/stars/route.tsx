import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// simple in-memory cache for the edge runtime
let starCountCache: { count: number; timestamp: number } | null = null;
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// rate limiting: track requests by IP (simple implementation)
const requestTracker = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per IP

function getClientIP(request: NextRequest): string {
  // get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = forwarded?.split(',')[0] || realIP || 'unknown';
  return clientIP;
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userRequests = requestTracker.get(ip);
  
  if (!userRequests || now > userRequests.resetTime) {
    // first request or window expired
    requestTracker.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (userRequests.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  // increment counter
  userRequests.count++;
  return false;
}

async function fetchStarCount(): Promise<number | null> {
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'GitHub-Bio-Generator/1.0',
      'Accept': 'application/vnd.github+json',
    };

    // only add authentication if token is available
    // this is secure - token never leaves the server
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch('https://api.github.com/repos/LucasCur/github-bio', {
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('GitHub API request timed out');
    } else {
      console.error('Error fetching star count:', error);
    }
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // rate limiting
    const clientIP = getClientIP(request);
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' }, 
        { status: 429 }
      );
    }

    // validate origin in production
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    // restrict requests to site domain, only for use by preview page
    if (process.env.NODE_ENV === 'production' && origin && referer) {
      const allowedOrigins = [
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        process.env.NEXT_PUBLIC_SITE_URL || null,
        'https://githubbio.vercel.app', // repo vercel domain
        'http://localhost:3000' // local development
      ].filter((url): url is string => url !== null);
      
      if (allowedOrigins.length > 0 && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        console.warn(`Blocked request from unauthorized origin: ${origin}`);
        // don't block for now, just log - will enable if needed
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const now = Date.now();
    
    // check if we have cached data and it's still valid
    if (starCountCache && (now - starCountCache.timestamp) < CACHE_DURATION) {
      return NextResponse.json({ 
        stars: starCountCache.count,
        cached: true,
        cacheAge: Math.floor((now - starCountCache.timestamp) / 1000)
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600', // browser cache for 1 hour
          'CDN-Cache-Control': 'public, s-maxage=3600',
        }
      });
    }
    
    // fetch fresh data
    const starCount = await fetchStarCount();
    
    if (starCount === null) {
      // return cached data if available, even if expired
      if (starCountCache) {
        return NextResponse.json({ 
          stars: starCountCache.count,
          cached: true,
          error: 'Failed to fetch fresh data, using cached'
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=300', // shorter cache for stale data
          }
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch star count' }, 
        { status: 503 }
      );
    }
    
    // validate the star count is reasonable
    if (starCount < 0 || starCount > 1000000) {
      console.warn(`Suspicious star count received: ${starCount}`);
      return NextResponse.json(
        { error: 'Invalid data received' }, 
        { status: 500 }
      );
    }
    
    // update cache
    starCountCache = {
      count: starCount,
      timestamp: now
    };
    
    return NextResponse.json({ 
      stars: starCount,
      cached: false,
      timestamp: now
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600',
        'CDN-Cache-Control': 'public, s-maxage=3600',
      }
    });
    
  } catch (error) {
    console.error('Error in stars API:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// only allow GET requests
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}