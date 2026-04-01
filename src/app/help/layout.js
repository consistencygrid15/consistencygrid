import { generateMetadata } from '@/lib/seo';

export const metadata = generateMetadata({
    title: "Help Center",
    description: "Get support, read FAQs, and learn how to get the most out of ConsistencyGrid.",
    url: "https://consistencygrid.com/help"
});

export default function HelpLayout({ children }) {
    return children;
}
