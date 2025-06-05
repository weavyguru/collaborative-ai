# Weavy Messenger MVP with AI Agent Builder

A complete messaging application built with Next.js and Weavy that combines real-time messaging with AI agent management capabilities. This project demonstrates how to integrate Weavy's powerful collaboration features with custom AI agent functionality.

## ✨ Features

### 🚀 Core Functionality
- **Real-time Messaging**: Full-featured chat interface powered by Weavy Messenger
- **Google OAuth Authentication**: Secure sign-in with Google accounts
- **AI Agent Builder**: Create, edit, and manage AI agents with custom instructions
- **Knowledge Base Management**: File upload and management for agent knowledge bases
- **Responsive Design**: Mobile-friendly Bootstrap UI

### 🤖 Agent Management
- **Create Agents**: Build custom AI agents with names, descriptions, and instructions
- **Edit Agents**: Update agent details and instructions
- **Delete Agents**: Remove agents with confirmation
- **Knowledge Bases**: Automatic file app creation for each agent
- **Agent Listing**: Browse all created agents with detailed information

### 🔐 Authentication & Security
- **Google OAuth Integration**: Seamless sign-in with Google accounts
- **Access Token Management**: Secure token generation for Weavy integration
- **User Profile Sync**: Automatic user creation in Weavy with Google profile data
- **Session Management**: Persistent authentication state

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: NextAuth.js with Google Provider
- **UI Framework**: Bootstrap 5.3
- **Real-time Chat**: Weavy UIKit
- **Language**: TypeScript
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (version 18 or higher)
2. **A Weavy account** and environment
3. **Google OAuth credentials**
4. **Vercel account** (for deployment)

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-username/weavy-messenger-mvp.git
cd weavy-messenger-mvp
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Create a \`.env.local\` file in the root directory:

\`\`\`env
# Weavy Configuration
WEAVY_URL=https://your-weavy-environment.weavy.io
WEAVY_API_KEY=your-weavy-api-key
NEXT_PUBLIC_WEAVY_URL=https://your-weavy-environment.weavy.io
NEXT_PUBLIC_WEAVY_API_KEY=your-weavy-api-key

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
\`\`\`

### 4. Configure Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - \`http://localhost:3000/api/auth/callback/google\` (development)
   - \`https://your-domain.com/api/auth/callback/google\` (production)

### 5. Configure Weavy

1. Sign up for a [Weavy account](https://www.weavy.com/)
2. Create a new environment
3. Generate an API key
4. Note your environment URL

### 6. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
weavy-messenger-mvp/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth configuration
│   │   ├── weavy/
│   │   │   ├── agents/             # Agent management endpoints
│   │   │   ├── token/              # Token generation
│   │   │   └── users/              # User management
│   ├── auth/                       # Authentication pages
│   ├── agent-builder/              # Agent builder page
│   ├── components/                 # React components
│   │   ├── agent-detail.tsx        # Agent detail modal
│   │   ├── create-agent-modal.tsx  # Create agent form
│   │   └── edit-agent-modal.tsx    # Edit agent form
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home page (messenger)
│   └── providers.tsx               # Context providers
├── middleware.ts                   # NextAuth middleware
└── README.md
\`\`\`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| \`WEAVY_URL\` | Your Weavy environment URL | ✅ |
| \`WEAVY_API_KEY\` | Your Weavy API key | ✅ |
| \`NEXT_PUBLIC_WEAVY_URL\` | Public Weavy URL for client-side | ✅ |
| \`NEXT_PUBLIC_WEAVY_API_KEY\` | Public Weavy API key | ✅ |
| \`NEXTAUTH_SECRET\` | Secret for NextAuth.js | ✅ |
| \`NEXTAUTH_URL\` | Your application URL | ✅ |
| \`GOOGLE_CLIENT_ID\` | Google OAuth client ID | ✅ |
| \`GOOGLE_CLIENT_SECRET\` | Google OAuth client secret | ✅ |

### Weavy Setup

1. **Create Environment**: Set up your Weavy environment
2. **Generate API Key**: Create an API key with appropriate permissions
3. **Configure CORS**: Add your domain to allowed origins

## 🚀 Deployment

### Deploy to Vercel

1. **Connect Repository**:
   \`\`\`bash
   vercel --prod
   \`\`\`

2. **Set Environment Variables** in Vercel dashboard

3. **Update OAuth Settings**:
   - Add production URL to Google OAuth redirect URIs
   - Update \`NEXTAUTH_URL\` to your production domain

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:
- **Netlify**: Use the Next.js build command
- **Railway**: Connect your GitHub repository
- **DigitalOcean App Platform**: Deploy from GitHub

## 📖 Usage

### Basic Messaging

1. **Sign In**: Use Google OAuth to authenticate
2. **Start Chatting**: The messenger loads automatically
3. **Real-time Communication**: Messages appear instantly

### Agent Management

1. **Navigate to Agent Builder**: Click the "Agent Builder" tab
2. **Create Agent**: Click "Create New Agent" and fill in details
3. **Manage Knowledge Base**: Upload files to agent knowledge bases
4. **Edit Agents**: Click the edit button on any agent card
5. **Delete Agents**: Click the trash button with confirmation

### Knowledge Base Files

1. **Automatic Creation**: Each agent gets a dedicated file app
2. **Upload Files**: Use the Weavy Files interface
3. **File Management**: Organize and manage agent knowledge

## 🔌 API Endpoints

### Authentication
- \`POST /api/auth/[...nextauth]\` - NextAuth.js endpoints

### Weavy Integration
- \`POST /api/weavy/token\` - Generate Weavy access tokens
- \`GET /api/weavy/users\` - Get user information
- \`POST /api/weavy/users\` - Create/update users

### Agent Management
- \`GET /api/weavy/agents\` - List all agents
- \`GET /api/weavy/agents/[uid]\` - Get specific agent
- \`POST /api/weavy/agents/create\` - Create new agent
- \`PATCH /api/weavy/agents/[uid]/update\` - Update agent
- \`DELETE /api/weavy/agents/[uid]/delete\` - Delete agent

## 🎨 Customization

### Styling

The project uses Bootstrap 5.3 for styling. Customize by:

1. **Modify \`globals.css\`** for global styles
2. **Update Bootstrap variables** by importing custom SCSS
3. **Add custom components** with Tailwind-style classes

### Weavy Components

Customize Weavy components by:

1. **CSS Variables**: Override Weavy's CSS custom properties
2. **Custom Themes**: Apply your brand colors and fonts
3. **Component Configuration**: Modify Weavy component attributes

## 🐛 Troubleshooting

### Common Issues

**Authentication Errors**:
- Verify Google OAuth configuration
- Check redirect URIs match exactly
- Ensure \`NEXTAUTH_SECRET\` is set

**Weavy Connection Issues**:
- Verify API key permissions
- Check CORS settings in Weavy
- Ensure environment URL is correct

**Agent Creation Fails**:
- Check Weavy API key has agent creation permissions
- Verify all required fields are provided
- Check server logs for detailed errors

### Debug Mode

Enable debug logging by setting:
\`\`\`env
NODE_ENV=development
\`\`\`

Check browser console and server logs for detailed error information.

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: \`git checkout -b feature/amazing-feature\`
3. **Commit changes**: \`git commit -m 'Add amazing feature'\`
4. **Push to branch**: \`git push origin feature/amazing-feature\`
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Weavy](https://www.weavy.com/)** - For the excellent collaboration platform
- **[NextAuth.js](https://next-auth.js.org/)** - For authentication made simple
- **[Vercel](https://vercel.com/)** - For seamless deployment
- **[Bootstrap](https://getbootstrap.com/)** - For responsive UI components

## 📞 Support

- **Documentation**: [Weavy Docs](https://www.weavy.com/docs)
- **Community**: [Weavy Community](https://www.weavy.com/community)
- **Issues**: [GitHub Issues](https://github.com/your-username/weavy-messenger-mvp/issues)

## 🔗 Links

- **Live Demo**: [https://your-app.vercel.app](https://your-app.vercel.app)
- **Weavy Platform**: [https://www.weavy.com](https://www.weavy.com)
- **v0.dev**: [https://v0.dev](https://v0.dev)

---

Built with ❤️ using [v0.dev](https://v0.dev) and [Weavy](https://www.weavy.com)
