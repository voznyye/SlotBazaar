import MarkdownPage from '../components/MarkdownPage';
import termsFile from '../markdown/terms.md';

export default function Terms() {
  return <MarkdownPage file={termsFile} />;
}
