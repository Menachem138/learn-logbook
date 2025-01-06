const MAX_PREVIEW_LENGTH = 300;

export const truncateHtml = (html: string, maxLength: number = MAX_PREVIEW_LENGTH): { truncated: string; isTruncated: boolean } => {
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const textContent = tempDiv.textContent || '';
  
  // If the text is shorter than maxLength, return original HTML
  if (textContent.length <= maxLength) {
    return { truncated: html, isTruncated: false };
  }

  let currentLength = 0;
  let truncatedContent = '';
  const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);

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

  truncatedContent = tempDiv.innerHTML;
  return { truncated: truncatedContent, isTruncated: true };
};