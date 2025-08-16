'use client';

import { useState, useEffect } from 'react';
import { Dice6, Download, Github, AlertTriangle, Star } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [repo, setRepo] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [starCount, setStarCount] = useState<number | null>(null);
  const [starLoading, setStarLoading] = useState(true);

  // fetch star count on component mount
  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch('/api/stars');
        const data = await response.json();
        if (data.stars !== undefined) {
          setStarCount(data.stars);
        }
      } catch (error) {
        console.error('Failed to fetch star count:', error);
      } finally {
        setStarLoading(false);
      }
    };
    
    fetchStars();
  }, []);

  // popular repositories for random selection
  const popularRepos = [
    { username: 'facebook', repo: 'react' },
    { username: 'microsoft', repo: 'vscode' },
    { username: 'vercel', repo: 'next.js' },
    { username: 'nodejs', repo: 'node' },
    { username: 'vuejs', repo: 'vue' },
    { username: 'angular', repo: 'angular' },
    { username: 'sveltejs', repo: 'svelte' },
    { username: 'tailwindlabs', repo: 'tailwindcss' },
    { username: 'expressjs', repo: 'express' },
    { username: 'django', repo: 'django' },
    { username: 'rails', repo: 'rails' },
    { username: 'laravel', repo: 'laravel' },
    { username: 'spring-projects', repo: 'spring-boot' },
    { username: 'pytorch', repo: 'pytorch' },
    { username: 'tensorflow', repo: 'tensorflow' },
    { username: 'scikit-learn', repo: 'scikit-learn' },
    { username: 'pandas-dev', repo: 'pandas' },
    { username: 'numpy', repo: 'numpy' }
  ];

  const randomizeRepo = () => {
    const randomRepo = popularRepos[Math.floor(Math.random() * popularRepos.length)];
    setUsername(randomRepo.username);
    setRepo(randomRepo.repo);
    // preserve existing error state - only clear when actually generating
  };

  const generateImage = async () => {
    if (!username.trim() || !repo.trim()) {
      setError('Please enter both username and repository name');
      return;
    }

    setLoading(true);
    setError(''); // clear error state when starting new generation
    setImageLoading(true);
    
    try {
      const url = `/api/repo?username=${encodeURIComponent(username.trim())}&repo=${encodeURIComponent(repo.trim())}`;
      setImageUrl(url);
      setHasGenerated(true);
      
      // artificial delay for smoother user experience
      setTimeout(() => {
        setLoading(false);
      }, 800);
    } catch {
      setError('Failed to generate image');
      setLoading(false);
      setImageLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${username}-${repo}-preview.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      console.error('Failed to download image');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      generateImage();
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setError('Failed to load repository data. Please check the username and repository name.');
  };

  const getPreviewUrl = () => {
    if (!hasGenerated) {
      return "Generate to preview";
    }
    if (loading) {
      return "Generating...";
    }
    return `${typeof window !== 'undefined' ? window.location.origin : ''}${imageUrl}`;
  };

  const formatStarCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-stone-100 py-8 px-6">
      <div className="w-full max-w-3xl mx-auto">
        {/* main header section */}
        <motion.div 
          className="text-left mb-6 p-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold">
              <span className='text-zinc-800'>github</span> <span className='text-zinc-500'>bio</span>
            </h1>
            
            {/* github star button */}
            <motion.a
              href="https://github.com/LucasCur/github-bio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 border border-zinc-300 rounded-md hover:bg-zinc-50 transition-all hover:scale-105 active:scale-100 duration-200 text-sm font-medium text-zinc-700 hover:text-zinc-900"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Star className="w-4 h-4" />
              <span>Star</span>
              <div className="flex items-center bg-zinc-300/50 px-2 py-0.5 rounded-full text-xs text-zinc-600">
                {starLoading ? (
                  <span>?</span>
                ) : (
                  <span>{starCount !== null ? formatStarCount(starCount) : '0'}</span>
                )}
              </div>
            </motion.a>
          </div>
          
          <p className="text-zinc-500 text-lg font-light mb-4">
            A dynamic, customizable image generator for GitHub repositories.
          </p>
          <p className="text-zinc-400 text-sm font-light">
            You don&apos;t need this page to generate images. Just use the URL format directly: 
            <code className="text-xs bg-zinc-100 px-2 py-1 rounded mx-1 font-mono whitespace-nowrap">
              /api/repo?username=USER&repo=REPO
            </code>
            <br />
            This page is for previewing and testing your images.
          </p>
        </motion.div>

        {/* repository input form */}
        <motion.div 
          className="bg-white/70 backdrop-blur-sm border border-zinc-200/60 rounded-2xl p-8 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="block text-xl text-zinc-500">
                {'// Your Repository'}
              </label>
            </div>
            
            {/* section with example repositories */}
            <motion.div 
              className="text-left text-zinc-400 text-sm space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="font-light">Enter any GitHub username and repository name to create a preview</p>
              <div className="flex justify-start items-center space-x-2 text-xs">
                <span className="bg-zinc-200/60 px-3 py-1 rounded-full">facebook/react</span>
                <span className="bg-zinc-200/60 px-3 py-1 rounded-full">microsoft/vscode</span>
                <span className="bg-zinc-200/60 px-3 py-1 rounded-full">vercel/next.js</span>
              </div>
            </motion.div>

            <div className="flex items-center justify-between">
              {/* New container for the input fields */}
              <div className="flex items-center flex-1 border border-zinc-200/60 rounded-lg px-4 py-3 bg-white hover:border-zinc-300 focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-100 transition-all duration-200">
                <span className="text-zinc-500 font-mono text-base select-none">github.com/</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="username"
                  className="bg-transparent border-none outline-none text-zinc-700 placeholder-zinc-400 font-mono text-base min-w-0 flex-shrink-0 px-1"
                  style={{ width: Math.min(Math.max(80, username.length * 9 + 5),250) + 'px' }}
                />
                <span className="text-zinc-500 font-mono text-base select-none">/</span>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="repo"
                  className="bg-transparent border-none outline-none text-zinc-700 placeholder-zinc-400 font-mono text-base min-w-0 flex-1 px-1"
                />
              </div>
              <button
                onClick={randomizeRepo}
                className="ml-3 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100/80 rounded-lg transition-all duration-200 group"
                title="Try a random repository"
              >
                <Dice6 className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            {/* input validation error display */}
            {error && !error.includes('Failed to load repository data') && (
              <motion.div 
                className="text-red-500 text-sm font-medium bg-red-50 px-4 py-3 rounded-lg border border-red-100"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {/* generate button with sliding error notification */}
            <div className="flex items-center space-x-3">
              {/* animated error indicator container */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: error.includes('Failed to load repository data') ? '48px' : 0
                }}
                transition={{ duration: error.includes('Failed to load repository data') ? 0.3 : 0, ease: "easeInOut" }}
                className="relative overflow-hidden"
              >
                <motion.div 
                  className="w-12 h-12 bg-red-100 border border-red-200 rounded-xl flex items-center justify-center text-red-500 cursor-help group"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: error.includes('Failed to load repository data') ? 1 : 0
                  }}
                  transition={{ 
                    duration: error.includes('Failed to load repository data') ? 0.2 : 0,
                    delay: error.includes('Failed to load repository data') ? 0.3 : 0,
                    ease: "easeInOut"
                  }}
                >
                  <AlertTriangle className="w-5 h-5" />
                  
                  {/* error tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-zinc-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap max-w-64 text-center">
                      Failed to load repository data. Please check the username and repository name.
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-800"></div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* main generate button */}
              <motion.button
                onClick={generateImage}
                disabled={loading}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 group"
                animate={{ 
                  flex: error.includes('Failed to load repository data') ? '1 1 0%' : '1 1 100%'
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Preview</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* preview section - always visible */}
        <motion.div 
          className="bg-white/70 backdrop-blur-sm border border-zinc-200/60 rounded-2xl p-8 shadow-sm"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl text-zinc-500">{'// Preview'}</h2>
            <button
              onClick={downloadImage}
              disabled={!hasGenerated || loading}
              className="px-4 py-2 h-12 w-12 bg-zinc-800 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-0 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 group"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          <motion.div 
            className={`border rounded-xl overflow-hidden bg-white relative ${
              error.includes('Failed to load repository data') 
                ? 'border-red-200 shadow-red-100' 
                : 'border-zinc-200 shadow-sm'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ aspectRatio: '1200/400' }} // maintain consistent aspect ratio
          >
            {/* skeleton loader and placeholder states */}
            {(!hasGenerated || imageLoading || loading || error.includes('Failed to load repository data')) && (
              <div className={`absolute inset-0 ${error.includes('Failed to load repository data') ? 'bg-gradient-to-r from-red-50 via-red-25 to-red-50' : 'bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100'} ${!hasGenerated ? '' : 'animate-pulse'}`}>                  
                {/* skeleton content pattern or placeholder message */}
                <div className={`absolute inset-0 flex items-center justify-center ${error.includes('Failed to load repository data') ? 'opacity-30' : ''}`}>
                  {!hasGenerated ? (
                    <div className="text-center">
                      <div className="text-zinc-400 text-lg font-medium mb-2">Generate to preview</div>
                      <div className="text-zinc-300 text-sm">Enter a repository above and click generate</div>
                    </div>
                  ) : (
                    <div className="p-8 flex w-full">
                      <div className="flex-1 space-y-4">
                        <div className={`h-8 ${error.includes('Failed to load repository data') ? 'bg-red-200' : 'bg-zinc-200'} rounded w-2/3`}></div>
                        <div className={`h-4 ${error.includes('Failed to load repository data') ? 'bg-red-200' : 'bg-zinc-200'} rounded w-full`}></div>
                        <div className={`h-4 ${error.includes('Failed to load repository data') ? 'bg-red-200' : 'bg-zinc-200'} rounded w-3/4`}></div>
                        <div className="flex space-x-2 mt-4">
                          <div className={`h-3 w-3 ${error.includes('Failed to load repository data') ? 'bg-red-300' : 'bg-zinc-300'} rounded-full`}></div>
                          <div className={`h-4 ${error.includes('Failed to load repository data') ? 'bg-red-200' : 'bg-zinc-200'} rounded w-20`}></div>
                        </div>
                      </div>
                      <div className="w-32 space-y-3 text-right">
                        <div className={`h-6 ${error.includes('Failed to load repository data') ? 'bg-red-200' : 'bg-zinc-200'} rounded w-16 ml-auto`}></div>
                        <div className={`h-6 ${error.includes('Failed to load repository data') ? 'bg-red-200' : 'bg-zinc-200'} rounded w-12 ml-auto`}></div>
                        <div className={`h-6 ${error.includes('Failed to load repository data') ? 'bg-red-200' : 'bg-zinc-200'} rounded w-8 ml-auto`}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {hasGenerated && imageUrl && (
              <motion.img
                src={imageUrl}
                alt={`${username}/${repo} repository preview`}
                className={`w-full h-auto transition-opacity duration-300 ${(imageLoading || loading || error.includes('Failed to load repository data')) ? 'opacity-0' : 'opacity-100'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: (imageLoading || loading || error.includes('Failed to load repository data')) ? 0 : 1 }}
                transition={{ duration: 0.3 }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
          </motion.div>
          
          <motion.div 
            className="mt-6 p-4 bg-zinc-50/80 rounded-xl border border-zinc-200/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-sm font-medium text-zinc-600 mb-2">Use the image with this URL:</p>
            <code className="text-xs bg-white/80 px-3 py-2 rounded-lg text-zinc-600 break-all border border-zinc-200/60 block">
              {getPreviewUrl()}
            </code>
          </motion.div>
        </motion.div>

        {/* project attribution footer */}
        <motion.div 
          className="mt-8 pt-8 border-t border-zinc-200/60 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-center space-x-2 text-zinc-400 text-sm">
            <a 
              href="https://github.com/LucasCur/github-bio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-800 transition-colors duration-200"
            >
              <Github className="w-4 h-4" />
            </a>
            <span>Open source project @</span>
            <a 
              href="https://github.com/LucasCur/github-bio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-800 font-medium transition-colors duration-200"
            >
              lucascur/github-bio
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}