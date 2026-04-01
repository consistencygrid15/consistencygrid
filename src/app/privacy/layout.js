import { generateMetadata, pageMetadata } from '@/lib/seo';

export const metadata = generateMetadata({
    ...pageMetadata.privacy,
    url: "https://consistencygrid.com/privacy"
});

export default function PrivacyLayout({ children }) {
    return children;
}
