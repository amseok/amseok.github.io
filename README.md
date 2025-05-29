# 🌙 Dream Journal ✨

A beautiful, dark-themed dream journal web application where you can record, organize, and analyze your dreams with AI-powered insights.

## Features

- **🎨 Beautiful Dark Theme**: Cosmic-inspired design with animated stars and dreamy gradients
- **📝 Dream Recording**: Easy-to-use form for capturing dream details, moods, and tags
- **📅 Timeline View**: Chronological display of all your dreams with editing capabilities
- **🔮 AI Analysis**: Get dream interpretations using OpenAI's GPT API with beautiful markdown rendering
- **💾 Local Storage**: All dreams are saved locally in your browser
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **🚀 GitHub Pages Ready**: Easy deployment to GitHub Pages

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dream-journal.git
cd dream-journal
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:3000`

## Deployment to GitHub Pages

1. **Update the base path** in `vite.config.js`:
   ```javascript
   base: '/your-repository-name/',
   ```

2. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

3. **Enable GitHub Pages** in your repository settings:
   - Go to Settings > Pages
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch
   - Save

Your dream journal will be available at: `https://yourusername.github.io/your-repository-name/`

## Using AI Dream Analysis

To use the dream analysis feature:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click the 🔮 button on any dream
3. Enter your API key (stored locally and securely)
4. Enjoy beautiful markdown-formatted dream interpretations!

## Project Structure

```
src/
├── components/
│   ├── DreamEntry.jsx      # Dream input form
│   ├── DreamTimeline.jsx   # Dreams timeline display
│   └── DreamAnalyzer.jsx   # AI analysis modal
├── App.jsx                 # Main application
├── index.css              # Global styles
└── main.jsx               # Application entry point
```

## Technologies Used

- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Markdown** - Beautiful markdown rendering
- **OpenAI API** - AI-powered dream analysis
- **CSS3** - Custom animations and cosmic theme
- **Local Storage** - Client-side data persistence

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the mystery and beauty of dreams
- Built with modern web technologies
- Cosmic design elements for that dreamy feel

---

Sweet dreams! 🌙✨te

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
