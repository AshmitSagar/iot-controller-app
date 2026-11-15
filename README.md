# IoT Controller App

A modern, responsive web application for controlling Home Assistant devices with AI-powered automation.

## Features

- **Modern Angular Frontend**: Responsive UI with Tailwind CSS v4
- **Home Assistant Integration**: Real-time device control via WebSocket and REST APIs
- **Progressive Web App**: Installable on mobile devices
- **Device Controls**: Interactive cards for lights, switches, and sensors
- **Dark/Light Theme**: Toggle with system preference support
- **AI Agent**: Control devices via natural language (OpenRouter integration)

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- Home Assistant instance or use included demo setup

## Quick Start with Docker

1. Start the entire stack:
```bash
docker-compose up -d
```

2. Access the applications:
   - IoT Controller: http://localhost
   - Home Assistant: http://localhost:8123

3. Configure Home Assistant:
   - Complete onboarding at http://localhost:8123
   - Generate long-lived access token: Profile → Security → Long-Lived Access Tokens

4. Login to IoT Controller:
   - URL: `http://localhost:8123`
   - Paste your access token

## Development Setup

1. Install dependencies:
```bash
cd iot-controller
npm install
```

2. Start development server:
```bash
npm start
```

3. Access at http://localhost:4200

## Project Structure

```
iot-controller-app/
├── docker-compose.yml          # Docker orchestration
├── ha-config/                  # Home Assistant configuration
│   └── configuration.yaml
└── iot-controller/             # Angular application
    ├── src/
    │   ├── app/
    │   │   ├── core/           # Services and models
    │   │   ├── features/       # Feature modules
    │   │   └── shared/         # Shared components
    │   └── manifest.webmanifest
    └── package.json
```

## Technology Stack

- **Frontend**: Angular 18, Tailwind CSS v4, TypeScript
- **State Management**: NgRx Signals
- **Backend**: Home Assistant (Docker)
- **AI**: OpenRouter API (OpenAI-compatible)
- **PWA**: Angular Service Worker

## License

MIT
