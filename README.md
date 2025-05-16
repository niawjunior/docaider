# AskVue

Describe your data in plain language. We’ll turn it into stunning, interactive charts – automatically.

## Features

- 🤖 **AI Integration**: Powered by OpenAI SDK and LangChain for intelligent text processing and analysis
- 📊 **Advanced Data Visualization**: Uses ECharts for sophisticated data visualization capabilities
- 📄 **PDF Processing**: Supports PDF parsing and analysis using pdf-parse
- 🎨 **Modern UI**: Built with Tailwind CSS and Radix UI components for a polished user experience
- 🔄 **Real-time Updates**: Uses Intersection Observer for smooth, performant UI interactions
- 🔐 **Secure Authentication**: Integrated with Supabase for secure user management
- 🚀 **Performance Optimized**: Built with Turbopack for faster development

## Available Tools

### 1. Pie Chart Generator

- Generate interactive pie charts from structured data
- Customizable colors and styling
- ECharts-compatible visualization
- Automatic data validation and error handling

### 2. Data Processing Tools

- Bitkub API integration for cryptocurrency data
- Secure API key management
- Data embedding and relevance scoring
- Customizable chart configurations

### 3. AI-Powered Features

- GPT-4 integration for advanced data analysis
- Smart chart type suggestions
- Automatic data validation
- Interactive chart generation

### 4. Security Tools

- Environment-based API key management
- Secure authentication with Supabase
- Data encryption and protection
- Role-based access control

## Tech Stack

- **Framework**: Next.js 15.3 with TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **AI/ML**: OpenAI SDK, LangChain
- **Data Visualization**: ECharts
- **State Management**: Zod for type-safe validation
- **Authentication**: Supabase
- **PDF Processing**: pdf-parse
- **Animation**: Framer Motion
- **Icons**: React Icons, Lucide React

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- A Supabase account (for authentication)
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:

```bash
git clone [https://github.com/niawjunior/askivue]
cd askivue
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Copy the environment file:

```bash
cp .env.example .env
```

4. Update your `.env` file with required API keys and configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result

## Project Structure

```
askivue/
├── app/              # Next.js app directory
├── components/       # Reusable React components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and configurations
├── public/          # Static assets
└── middleware.ts    # Next.js middleware configuration
```

## Development

This project uses Turbopack for faster development. You can start the development server with:

```bash
npm run dev
```

The page will auto-update as you edit files.

## Deployment

This project is optimized for deployment on Vercel. To deploy:

1. Push your changes to GitHub
2. Import the repository to Vercel
3. Configure your environment variables in Vercel dashboard
4. Deploy with one click

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Support

For support, please open an issue in the GitHub repository or contact the development team directly.
