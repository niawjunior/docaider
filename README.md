# DocAider

An AI-powered case search and resolution system that helps users quickly find relevant support cases and solutions using natural language processing and semantic search.

## Features

- 🔍 **Semantic Search**: Find relevant cases using natural language queries or keywords
- 🤖 **AI-Powered Resolution**: Get AI-generated summaries and solutions for support cases
- 🏷️ **Smart Categorization**: Automatically tag and categorize cases by root cause and resolution
- 📊 **Interactive Interface**: Modern, responsive UI with real-time search results
- 🔄 **Context-Aware**: Understands technical jargon and domain-specific terminology
- 🔐 **Secure & Private**: Enterprise-grade security with role-based access control
- 🚀 **Fast & Scalable**: Built for performance with efficient vector search capabilities

## Key Features

### 1. Document Analysis & Q&A

- **Ask Questions**: Get precise answers from your uploaded documents
- **Semantic Search**: Find relevant information using natural language queries
- **Document Management**: View and organize all your uploaded documents in one place
- **Context-Aware Responses**: AI understands document context for accurate answers

### 2. Data Visualization

- **Pie Charts**: Generate interactive pie charts from structured data
- **Bar Charts**: Create detailed bar charts for data comparison
- **Custom Styling**: Customize charts with different colors and themes

### 3. Web Search Integration

- **Real-time Web Search**: Access current information from the internet
- **Comprehensive Results**: Get summarized search results with sources
- **Current Events**: Stay updated with the latest information
- **Knowledge Expansion**: Combine document knowledge with web information

### 4. Text-to-Speech (TTS)

- **AI Voice Generation**: Convert text to natural-sounding speech
- **Customizable Output**: Adjust voice style and parameters
- **Podcast Creation**: Generate audio content with multiple speakers

### 5. Cryptocurrency Tools

- **Real-time Crypto Prices**: Get current prices for any cryptocurrency
- **Market Overview**: View comprehensive market summaries
- **Multiple Fiat Currencies**: Check prices in your preferred currency
- **Market Trends**: Stay updated with the latest market movements

## Tech Stack

- **Frontend**: Next.js 15.3 with TypeScript
- **UI Components**: Tailwind CSS, Shadcn UI
- **AI/ML**: OpenAI Embeddings, Vector Search
- **Backend**: Next.js API Routes
- **Database**: Vector Database (Supabase)
- **Authentication**: Supabase Auth
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- OpenAI API key (for embeddings and AI features)
- Google Generative AI API key (for web search and TTS)
- Supabase account (for vector database and authentication)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/niawjunior/docaider.git
cd docaider
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Configure your `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=<your_site_url>
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
OPENAI_API_KEY=<your_openai_api_key>
GOOGLE_GENERATIVE_AI_API_KEY=<your_google_generative_ai_api_key>

```

5. Run database migrations (if applicable)

6. Start the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
docaider/
├── app/                  # Next.js 13+ app directory
│   ├── api/              # API routes
│   ├── components/        # Reusable React components
│   ├── lib/              # Utility functions and configurations
│   ├── models/           # Data models and types
│   └── services/         # Business logic and API clients
├── public/               # Static assets
├── styles/               # Global styles
└── types/                # TypeScript type definitions
```

## Development

### Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
# or
yarn build
```

### Running Tests

```bash
npm test
# or
yarn test
```

## Deployment

This project is optimized for deployment on Vercel. To deploy:

1. Push your changes to your Git repository
2. Connect your repository to Vercel
3. Set up the required environment variables in the Vercel dashboard
4. Deploy!

For other deployment options, refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and follow the existing code style.

### Code Style

- Use TypeScript for type safety
- Follow the existing component structure
- Write meaningful commit messages
- Add appropriate test coverage

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:

1. Check the [GitHub Issues](https://github.com/niawjunior/docaider/issues) for existing solutions
2. Open a new issue if you don't find an answer
3. Include detailed reproduction steps and environment information

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenAI](https://openai.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
