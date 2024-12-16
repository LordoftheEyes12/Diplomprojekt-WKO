import XRegExp from 'xregexp';

export function extractByRegex(input: string, pattern: RegExp): string | null {
    const eingabe = input.toString();
    const match = eingabe.match(pattern);
    return match ? match[0] : null; 
  }

export function extractByXRegex(input: string, pattern: string): string | null {
  // Compile the XRegExp pattern
  const regex = XRegExp(pattern);
  
  // Match using XRegExp
  const match = XRegExp.exec(input, regex);

  // Return the first match or null if not found
  return match ? match[0] : null;
}

export function extractSQLSelect(input: string): string | null {
  const pattern = `
    SELECT\\b             # Match the word SELECT as a whole word
    [\\s\\S]*?            # Match any characters (non-greedy) after SELECT
    (?:                   # Non-capturing group for options
        \\bFROM\\b[\\s\\S]*?;  # Match FROM clause followed by a semicolon
        |                  # OR
        \\bFROM\\b[\\s\\S]*?$  # Match FROM clause to the end of the string
    )
  `;

  // Compile the regex with case-insensitive ('i') and extended ('x') flags
  const regex = XRegExp(pattern, 'ix');

  // Match the input text
  const match = XRegExp.exec(input, regex);

  // Return the matched SQL query or null if no match
  return match ? match[0].trim() : null;
}

