import { generateMetadata, pageMetadata } from '@/lib/seo';

export const metadata = generateMetadata({
    ...pageMetadata.terms,
    url: "https://consistencygrid.com/terms"
});

export default function TermsLayout({ children }) {
    return children;
}
