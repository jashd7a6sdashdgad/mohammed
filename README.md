# School Chat Application

A modern, professional Next.js chat application designed for educational environments. Features a clean, responsive interface with AI-powered learning assistance.

## Features

- **Modern UI Design**: Glassmorphism effects with smooth animations
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Real-time Chat**: Instant messaging with typing indicators
- **Mobile Responsive**: Optimized for all screen sizes
- **AI Integration**: Connected to n8n webhook for AI responses
- **Professional Theme**: School-appropriate design with educational branding
- **Loading States**: Elegant loading animations and error handling
- **Message History**: Persistent chat history during session
- **Smooth Animations**: Framer Motion powered transitions
- **Session Management**: Unique session IDs for conversation memory
- **Session Persistence**: Session state persists across page refreshes
- **Session Reset**: Easy way to start fresh conversations
- **YouTube Integration**: Automatic thumbnail display for YouTube links
- **Smart Link Detection**: All links are clickable and highlighted in blue
- **Rich Media Display**: Beautiful thumbnails with hover effects for video links
- **Message History**: Sliding panel to view all previous messages
- **Persistent Storage**: History saved in localStorage (last 100 messages)
- **History Management**: Clear history option and visual indicators

## Technology Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **n8n Webhook** integration

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Webhook Configuration

The application is configured to communicate with:
```
https://n8n.1000273.xyz/webhook/school-chat
```

Messages are sent in the format:
```json
{
  "message": "user input text",
  "sessionId": "session_1692123456789_abc123def456"
}
```

### Session Management
- **Unique Session ID**: Each chat session gets a unique identifier for memory persistence
- **Session Persistence**: Session ID is stored in localStorage and persists across page refreshes
- **Session Reset**: Users can start a new session using the reset button in the header
- **Memory Support**: n8n can use the sessionId to maintain conversation context and memory

### YouTube Integration
- **Automatic Detection**: Recognizes YouTube URLs in bot messages
- **Thumbnail Display**: Shows video thumbnails with loading states
- **Clickable Links**: All YouTube links are blue and clickable
- **Hover Effects**: Play button overlay appears on hover
- **Error Handling**: Fallback display if thumbnail fails to load
- **Supported Formats**: 
  - `https://youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://youtube.com/embed/VIDEO_ID`

### Message History
- **Sliding Panel**: Right-side panel with smooth animations
- **Persistent Storage**: Automatically saves last 100 messages to localStorage
- **Visual Organization**: User messages on right, bot messages on left
- **Clickable Links**: All links in history remain functional
- **History Management**: Clear all history with one click
- **Responsive Design**: Adapts to different screen sizes
- **Real-time Updates**: History updates as you chat

## Key Components

### Chat Interface (`/src/app/page.tsx`)
- Main chat application component
- Handles message state and UI interactions
- Manages dark/light mode toggle
- Integrates with n8n webhook

### Styling (`/src/app/globals.css`)
- Custom animations and transitions
- Glassmorphism effects
- Responsive design utilities
- Custom scrollbar styling

## Design Features

- **Gradient Backgrounds**: Beautiful blue to purple gradients
- **Backdrop Blur**: Modern glassmorphism effects
- **Smooth Transitions**: 300ms duration for all interactions
- **Hover Effects**: Subtle scale and glow effects
- **Professional Typography**: System font stack for readability
- **Educational Icons**: BookOpen icon for school branding
- **Rich Media Cards**: YouTube thumbnails with play overlays
- **Smart Link Styling**: Blue links with external link indicators
- **Responsive Thumbnails**: Auto-scaling video previews

## Mobile Optimization

- Responsive design for all screen sizes
- Touch-friendly interface elements
- Optimized typography for mobile reading
- Smooth scrolling and animations

## Development

### Project Structure
```
src/
├── app/
│   ├── page.tsx          # Main chat component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
└── ...
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

This application can be easily deployed to:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Any Node.js hosting provider

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - feel free to use this for educational purposes.
