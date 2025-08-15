[![github-bio](https://github.com/LucasCur/github-bio/blob/main/header-image-light.png)](https://github.com/LucasCur/github-bio)

### Dynamic GitHub Repository Image Generator

> **Inspired by:** [GitHub Readme Stats](https://github.com/anuraghazra/github-readme-stats),  
> but rebuilt from scratch with **Next.js** and focused on generating **beautiful, fully-customizable images**,
> rather than just copying GitHub's default style.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A **dynamic, customizable image generator** for GitHub repositories. Create beautiful, information-rich preview images for any GitHub repository with just a username and repo name.

---

## 🌟 Features

- Generate **real-time images** for any public GitHub repository
- Display comprehensive repository information:
  - Repository name and description
  - Star count, fork count, and open issues
  - Primary programming languages with color coding
  - Creation and last updated dates
- **GitHub-styled dark theme** with professional appearance
- **No setup required** - works directly via URL
- Easy integration in **READMEs, documentation, and websites**
- Serverless architecture - fast and scalable

---

## 🚀 Usage

### Direct API Usage

Simply use the API endpoint with any GitHub repository:

```
https://your-domain.vercel.app/api/repo?username=<USERNAME>&repo=<REPO>
```

**Parameters:**

| Parameter | Description | Required |
|-----------|-------------|----------|
| `username` | GitHub username of the repository owner | Yes |
| `repo` | Repository name | Yes |

### Examples

**Embed in Markdown:**
```markdown
![Repository Preview](https://your-domain.vercel.app/api/repo?username=facebook&repo=react)
```

**HTML:**
```html
<img src="https://your-domain.vercel.app/api/repo?username=microsoft&repo=vscode" alt="Repository Preview" />
```

---

## 🔧 Installation & Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LucasCur/github-bio)

1. Click the "Deploy with Vercel" button above, or
2. Fork this repository and connect it to Vercel

### Local Development

```bash
git clone https://github.com/LucasCur/github-bio.git
cd github-bio
npm install
npm run dev
```

Open `http://localhost:3000` to access the preview interface.

---

## 🔑 GitHub Authentication (Optional but Recommended)

### Why Use a GitHub Token?

GitHub's API has different rate limits depending on authentication:

- **Without token (anonymous)**: 60 requests per hour per IP
- **With Personal Access Token**: 5,000 requests per hour

For production use, a GitHub token is highly recommended to avoid rate limiting.

### Setup

1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens)
   - No special scopes needed for public repositories
   - For private repositories, add `repo` scope
2. Add to your environment variables:
   ```env
   GITHUB_TOKEN=your_github_token_here
   ```
3. In Vercel, add this as an environment variable in your project settings

**Note:** The application gracefully handles missing tokens by falling back to anonymous requests, but you may encounter rate limits during high usage.

### Additional Configuration (Non-Vercel Hosting)

If you're not deploying to Vercel, you may want to set: 
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```
Used for enhanced security validation so your site can access the route that gets the number of stars THIS repo has, when displaying it on the site's generation page.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💡 Use Cases

- **README banners** for your GitHub repositories
- **Documentation** and project showcases
- **Social media sharing** with rich repository previews
- **Portfolio websites** displaying your projects
- **Blog posts** about open source projects
