# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Environment Setup

Copy the environment variables template:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration values:

**MCP Configuration:**
- `VITE_MCP_SERVER_URL`: URL of your MCP (Model Context Protocol) server for weather tools

**Azure AD / MSAL Configuration:**
- `VITE_AZURE_APP_CLIENT_ID`: Your Azure AD Application (client) ID
- `VITE_AZURE_TENANT_AUTHORITY`: Your Azure AD tenant authority URL
- `VITE_MSAL_REDIRECT_URI`: Redirect URI after successful login
- `VITE_MSAL_POST_LOGOUT_REDIRECT_URI`: Redirect URI after logout  
- `VITE_MSAL_NAVIGATE_TO_LOGIN_REQUEST_URL`: Whether to navigate back to original request location after auth

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.
