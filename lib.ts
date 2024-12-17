import XRegExp from 'xregexp';



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

export function extractMarkdownTable(text:string) : string | null {
  const pattern = XRegExp(
    "```markdown\\s*([\\s\\S]*?)\\s*```", // Matches content between "````markdown" and closing "````"
    "gm" // Global and multiline flags
  );

  const match = XRegExp.exec(text, pattern);
  return match && match[1] ? match[1].trim() : null;

}
export function stringToMarkdownTable(input: string): string {
  const lines = input.trim().split('\n');

  const header = lines[0].split('|').map((h) => h.trim()).filter(Boolean);
  const divider = lines[1].split('|').map(() => '---'); 
  const rows = lines.slice(2).map(line => 
      line.split('|').map((cell) => cell.trim()).filter(Boolean)
  );

  const markdownTable: string[] = [];
  markdownTable.push(`| ${header.join(' | ')} |`);
  markdownTable.push(`| ${divider.join(' | ')} |`);
  rows.forEach(row => {
      markdownTable.push(`| ${row.join(' | ')} |`);
  });

  return markdownTable.join('\n');
}
export function buildJsonResponse(markdownTable: string): string {

  const jsonResponse = {
      success: true,
      data: {
          table: markdownTable
      }
  };

  // Convert to JSON string
  return JSON.stringify(jsonResponse, null, 2);
}


export async function createMarkdownTable(query: string, data: string) {
  const apiUrl = "https://llmtest.bendaschner.com/api/chat"; // Ollama's API endpoint
  const model = "qwen2.5-coder:14b";

  const payload = {
    model: model,
    messages: [
      {
        role: "user",
        content: `using this SQL query: ${query} and this result: ${data} create a markdown table that contains meaningful headings and the data. only return the table syntax filled with the data that can be used with any common Markdown Readers`,
      },
    ],
    stream: false,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Ollama API responded with status: ${response.status}`);
    }

    const result = await response.json();
    const markdownTable = result.message.content; // Extract the markdown table

    console.log("Generated Markdown Table:");
    console.log(markdownTable);
    return markdownTable;
  } catch (error) {
    console.error("Error communicating with Ollama API:", error.message);
  }
}