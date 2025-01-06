const MAX_PREVIEW_LENGTH = 300;

export const truncateHtml = (html: string, maxLength: number = MAX_PREVIEW_LENGTH): { truncated: string; isTruncated: boolean } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  let textContent = doc.body.textContent || '';
  
  if (textContent.length <= maxLength) {
    return { truncated: html, isTruncated: false };
  }

  let currentLength = 0;
  let truncatedHtml = '';
  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const remainingLength = maxLength - currentLength;
      
      if (currentLength + text.length > maxLength) {
        const truncatedText = text.slice(0, remainingLength) + '...';
        node.textContent = truncatedText;
        break;
      }
      
      currentLength += text.length;
    }
  }

  truncatedHtml = Array.from(doc.body.children)
    .map(el => el.outerHTML)
    .join('');

  return { truncated: truncatedHtml, isTruncated: true };
};