import { generateMetadata, pageMetadata } from '@/lib/seo';

export const metadata = generateMetadata({
  ...pageMetadata.signup,
  url: "https://consistencygrid.com/signup"
});

export default function SignupLayout({ children }) {
  return children;
}
