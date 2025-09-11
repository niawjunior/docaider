# DocAider

An AI-powered Knowledge Management and Retrieval-Augmented Generation (RAG) system that helps users build, manage, and query their knowledge base using natural language processing and semantic search.

## Features

- 📄 **Document Processing**: Upload and process various file formats (PDF, DOCX, CSV, TXT, MD) with automatic text extraction and chunking
- 📚 **Knowledge Base Management**: Create, edit, and organize knowledge bases with an intuitive UI
- 🤖 **AI-Powered Chat**: Ask questions about your documents and get accurate, contextual responses
- 🔗 **Collaboration & Sharing**: Share knowledge bases via email or make them public
- 🔌 **Embeddable Chatbox**: Embed your knowledge base chat on any website with extensive customization
- 🌐 **Multi-Language Support**: Use the application in English or Thai with easy switching
- 🎨 **Theme Support**: Choose between light, dark, or system theme
- 🔍 **Advanced Search & Filter**: Find and organize your knowledge bases with comprehensive filtering options
- 💳 **Subscription Management**: Manage subscription plans with Stripe integration
- 📊 **Billing History**: Track payment history and manage billing details
- ✨ **Modern UI**: Built with Next.js App Router and Tailwind CSS for a responsive, accessible experience

## Key Features

### 1. Knowledge Base Management

- **Create & Organize**: Create public or private knowledge bases
- **Pin Favorites**: Pin important knowledge bases for quick access
- **Advanced Search & Filter**: Find knowledge bases with comprehensive filtering options including name, status, and content
- **Dashboard Views**: Categorized views for My Knowledge Bases, Shared With You, and Public Knowledge Bases
- **Real-time Filtering**: Debounced search with multiple sorting options (Recently Updated, Name A-Z/Z-A, Created Date)

### 2. Document Processing

- **Multiple Formats**: Support for various document formats
- **Automatic Processing**: Chunking and embedding for efficient retrieval
- **Document Validation**: Title validation to prevent duplicates with separate validation for regular and knowledge base documents
- **Document Management**: Add or remove documents from knowledge bases with automatic updates to knowledge base references
- **Optimized Vector Storage**: Separate document metadata from chunks/vectors for better performance
- **Batch Processing**: Efficient handling of document chunks with proper error handling

### 3. AI-Powered Chat

- **Multiple Sessions**: Create multiple chat sessions per knowledge base
- **Suggested Prompts**: Quick access to common questions
- **Context-Aware**: Responses based on your document content
- **Always Search**: Option to always search through documents for answers
- **Document Filtering**: Filter responses by specific document names
- **Optimized Vector Search**: Improved PostgreSQL vector search functions for better results

### 4. Collaboration & Sharing

- **Email Sharing**: Share knowledge bases with specific users via email
- **Public Publishing**: Make knowledge bases available to everyone
- **Access Control**: Manage who can access your shared resources
- **Share Chat Links**: Generate and share links to specific chat sessions
- **Embeddable Chatbox**: Add your knowledge base chat to any external website
- **Comprehensive Embedding Customization**: Configure colors, position, size, welcome messages, and appearance of embedded chat
- **Shared Knowledge Base Dashboard**: View all knowledge bases shared with you in a dedicated section

### 5. Multi-Language Support

- **Bilingual Interface**: Full support for English and Thai languages
- **Easy Switching**: Change language on the fly
- **Consistent Experience**: Fully localized interface throughout the application
- **User Preferences**: Language preference saved to user profile
- **Localized AI Responses**: AI responses in the selected language

### 6. User Dashboard

- **Intuitive Interface**: Manage all your knowledge resources in one place
- **Quick Access**: Easily access recent and pinned knowledge bases
- **Advanced Search & Filter**: Find knowledge bases with comprehensive filtering options
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Results Summary**: View filtered vs. total counts for each knowledge base section

### 7. Subscription Management

- **Subscription Plans**: Choose from different subscription plans (Free, Pro, Enterprise)
- **Billing Management**: View and manage your billing information
- **Payment History**: Access your payment history and invoices
- **Usage Tracking**: Monitor your usage and credits
- **Stripe Integration**: Secure payment processing with Stripe
- **Subscription Status**: View active, canceling, or canceled subscription status
- **Customer Portal**: Access Stripe Customer Portal for payment methods

## Tech Stack

- **Frontend**: Next.js 15.3 with TypeScript
- **UI Components**: Tailwind CSS, Shadcn UI
- **AI/ML**: OpenAI Embeddings, Vector Search
- **Backend**: Next.js API Routes
- **Database**: Vector Database (Supabase)
- **Authentication**: Supabase Auth
- **Payment Processing**: Stripe
- **State Management**: React Query
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- OpenAI API key (for embeddings and AI features)
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
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
OPENAI_API_KEY=<your_openai_api_key>
```

5. Run database migrations (if applicable)

6. Start the development server:

```bash
npm run dev
# or
yarn dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

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
