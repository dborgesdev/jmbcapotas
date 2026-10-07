export const headingText = (text: string) => text.trim().replace(/\.$/, "");
export const eyebrowText = (text: string) =>
  text.replace(/^\s*\d{1,2}\s*\/\s*/, "");
