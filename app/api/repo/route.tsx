import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface RepoLanguages {
  [language: string]: number;
}

async function fetchRepoData(username: string, repo: string): Promise<GitHubRepo | null> {
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'GitHub-Repo-Image-Generator',
      'Accept': 'application/vnd.github+json',
    };

    // Only add authentication if token is available in environment
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${username}/${repo}`, {
      headers,
    });
    
    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching repo data:', error);
    return null;
  }
}

async function fetchRepoLanguages(username: string, repo: string): Promise<RepoLanguages | null> {
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'GitHub-Repo-Image-Generator',
      'Accept': 'application/vnd.github+json',
    };

    // Only add authentication if token is available in environment
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${username}/${repo}/languages`, {
      headers,
    });
    
    if (!response.ok) {
      console.error(`GitHub API languages error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching languages data:', error);
    return null;
  }
}

function getLanguageColor(language: string): string {
  const colors: { [key: string]: string } = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Java': '#b07219',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'C': '#555555',
    'C++': '#f34b7d',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Swift': '#fa7343',
    'Kotlin': '#A97BFF',
    'Dart': '#00B4AB',
    'HTML': '#e34c26',
    'CSS': '#1572B6',
    'Shell': '#89e051',
  };
  
  return colors[language] || '#586069';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const repo = searchParams.get('repo');
    
    if (!username || !repo) {
      return new Response('Missing username or repo parameter', { status: 400 });
    }
    
    const repoData = await fetchRepoData(username, repo);
    
    if (!repoData) {
      return new Response('Repository not found or rate limit exceeded', { status: 404 });
    }
    
    const languagesData = await fetchRepoLanguages(username, repo);
    
    // Get top languages sorted by bytes of code
    const topLanguages = languagesData 
      ? Object.entries(languagesData)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([name]) => name)
      : (repoData.language ? [repoData.language] : []);
    
    // Ensure we have at least the main language if languagesData failed but repoData has one
    if (topLanguages.length === 0 && repoData.language) {
      topLanguages.push(repoData.language);
    }
    
    const createdDate = new Date(repoData.created_at).toLocaleDateString();
    const updatedDate = new Date(repoData.updated_at).toLocaleDateString();
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0d1117',
            color: '#f0f6fc',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            padding: '30px',
          }}
        >
          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flex: '1',
            }}
          >
            {/* Left Section - Main Info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: '2',
                paddingRight: '30px',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '25px',
                    backgroundColor: '#21262d',
                    marginRight: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}
                >
                  📁
                </div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#58a6ff',
                    display: 'flex',
                  }}
                >
                  {repoData.owner.login}/{repoData.name}
                </div>
              </div>
              
              {/* Description */}
              {repoData.description && (
                <div
                  style={{
                    fontSize: '18px',
                    color: '#8b949e',
                    marginBottom: '15px',
                    lineHeight: 1.4,
                    display: 'flex',
                  }}
                >
                  {repoData.description}
                </div>
              )}
              
              {/* Languages */}
              {topLanguages.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {topLanguages.map((lang, index) => (
                    <div
                      key={`${lang}-${index}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: index === 0 ? '16px' : '14px',
                        opacity: index === 0 ? 1 : 0.7,
                      }}
                    >
                      <div
                        style={{
                          width: index === 0 ? '14px' : '10px',
                          height: index === 0 ? '14px' : '10px',
                          borderRadius: '50%',
                          backgroundColor: getLanguageColor(lang),
                          display: 'flex',
                        }}
                      />
                      <span>{lang}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right Section - Stats */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: '15px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  fontSize: '22px',
                }}
              >
                <span>{repoData.stargazers_count}</span>
                <span>⭐</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  fontSize: '22px',
                }}
              >
                <span>{repoData.forks_count}</span>
                <span>🔀</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  fontSize: '22px',
                }}
              >
                <span>{repoData.open_issues_count}</span>
                <span>⚠️</span>
              </div>
            </div>
          </div>
          
          {/* Bottom Section - Dates and GitHub Label */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '20px',
              paddingTop: '15px',
              borderTop: '1px solid #21262d',
            }}
          >
            {/* Left - Dates */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                fontSize: '14px',
                color: '#8b949e',
              }}
            >
              <div
                style={{
                  display: 'flex',
                }}
              >
                <span>Created: {createdDate}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                }}
              >
                <span>Updated: {updatedDate}</span>
              </div>
            </div>
            
            {/* Right - GitHub Logo */}
            <div
              style={{
                fontSize: '14px',
                color: '#6e7681',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>GitHub Repository</span>
              <svg
                width='16'
                height='16'
                viewBox="0 0 24 24"
                fill="#6e7681"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 400,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}