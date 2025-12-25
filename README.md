# Salhakar - Legal AI Platform

Salhakar is an AI-powered legal research platform that provides instant access to legal judgments, acts, and legal guidance for lawyers, students, and legal professionals in India.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 14.0 or higher)
- **npm** (version 6.0 or higher) or **yarn**
- **Git**

You can check if you have these installed by running:
```bash
node --version
npm --version
git --version
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Captain0731/-salhakars.git
   cd salhakar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   Or if you prefer using yarn:
   ```bash
   yarn install
   ```

3. **Set up environment variables** (if needed)
   Create a `.env` file in the root directory and add any required environment variables:
   ```env
   REACT_APP_API_URL=your_api_url_here
   ```

## 📦 Project Dependencies

### Main Dependencies

- **react** (^19.2.0) - React library
- **react-dom** (^19.2.0) - React DOM rendering
- **react-router-dom** (^7.9.3) - Client-side routing
- **react-scripts** (5.0.1) - Create React App scripts
- **framer-motion** (^12.23.24) - Animation library
- **lucide-react** (^0.544.0) - Icon library
- **react-icons** (^5.5.0) - Additional icon library
- **clsx** (^2.1.1) - Utility for constructing className strings
- **cors** (^2.8.5) - CORS middleware
- **express** (^5.1.0) - Web framework (if using backend)
- **@lottiefiles/dotlottie-react** (^0.17.6) - Lottie animations

### Development Dependencies

- **tailwindcss** (^3.4.13) - Utility-first CSS framework
- **postcss** (^8.5.6) - CSS post-processor
- **autoprefixer** (^10.4.21) - CSS vendor prefixer
- **http-proxy-middleware** (^3.0.5) - HTTP proxy middleware

## 🏃 Running the Project

### Development Mode

Start the development server:
```bash
npm start
```

The application will open in your browser at [http://localhost:3000](http://localhost:3000).

The page will automatically reload when you make changes to the code.

### Build for Production

Create an optimized production build:
```bash
npm run build
```

This creates a `build` folder with optimized production files ready for deployment.

### Run Tests

Run the test suite:
```bash
npm test
```

## 📁 Project Structure

```
salhakar/
├── public/                 # Static files
├── src/
│   ├── components/         # Reusable React components
│   │   ├── landing/       # Landing page components
│   │   └── dashboard/     # Dashboard components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── hooks/             # Custom React hooks
│   └── App.js             # Main App component
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🛠️ Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## 🔧 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Kill the process using port 3000 or use a different port
   set PORT=3001 && npm start
   ```

2. **Node modules issues**
   ```bash
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build fails**
   - Ensure all dependencies are installed
   - Check for syntax errors in your code
   - Clear the build folder and try again

## 📝 Features

- 🔍 Legal Judgments Search (High Court & Supreme Court)
- 📚 Law Library (Central Acts & State Acts)
- 🤖 AI Legal Chatbot (Kiki AI Assistant)
- 📄 PDF Viewer with AI Search
- 🔖 Bookmarks System
- 📝 Notes Feature
- 🌐 Multi-language Support
- 📱 Responsive Design

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Team

- **Pratham Shah** - Founder & CEO
- **Parth Chelani** - Chief Operating Officer

## 📧 Contact

For inquiries, please contact: info@salhakar.com

---

Made with ❤️ by the Salhakar Team
