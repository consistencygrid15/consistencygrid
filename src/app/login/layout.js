import { generateMetadata, pageMetadata } from '@/lib/seo';

export const metadata = generateMetadata({
  ...pageMetadata.login,
  url: "https://consistencygrid.com/login"
});

export default function LoginLayout({ children }) {
  return children;
}
