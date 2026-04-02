import './globals.css';
import Nav from '@/components/Nav';
import { TransitionProvider, PageTransitionWrapper } from '@/components/TransitionContext';

export const metadata = {
  title: "Jai's Journey – Portfolio",
  description: "Personal E-Portfolio of Jai Chavan – BTech Computer Science Engineer passionate about building creative and meaningful tech experiences.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <TransitionProvider>
          <Nav />
          <PageTransitionWrapper>
            {children}
          </PageTransitionWrapper>
          
          {/* Global Floating Resume Button */}
          <a 
            href="/resume.pdf" 
            download="Jai Chavan's Resume.pdf" 
            className="global-resume-fab"
            title="Download Resume"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Resume
          </a>
        </TransitionProvider>
      </body>
    </html>
  );
}
