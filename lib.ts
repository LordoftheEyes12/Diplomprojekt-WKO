import XRegExp from 'xregexp';
import "https://deno.land/x/dotenv@v3.2.2/load.ts";



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




// Function to generate a SELECT query using Ollama API
export async function generateSelectQuery(schema: string, input: string) {
  const apiUrl = Deno.env.get("OLLAMA_API_URL"); // Load API URL from .env
  const model = Deno.env.get("OLLAMA_MODEL") || "qwen2.5-coder:14b"; // Default model fallback
  console.log("model", model);
  console.log("apiUrl", apiUrl);
  if (!apiUrl) {
    console.error("Error: OLLAMA_API_URL is not set in the .env file.");
    return;
  }

  
  const payload = {
    model: model,
    messages: [{ role: "user", content: `using the SQLite database with this schema\n schema: ${schema} \n answer the following query. Only generate SELECT queries. query: ${input}` }],
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
      throw new Error(`Ollama API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const queryResult = result.message?.content || "No response from the model";

    console.log("Generated SELECT Query:");
    console.log(queryResult);
    return queryResult;
  } catch (error) {
    console.error("Error generating SELECT query:", error.message);
  }
}

// Function to create a Markdown table using a query and data
async function createMarkdownTable(query: string, data: string) {
  const apiUrl = Deno.env.get("OLLAMA_API_URL"); // Load API URL from .env
  const model = Deno.env.get("OLLAMA_MODEL") || "qwen2.5-coder:14b"; // Default model fallback

  if (!apiUrl) {
    console.error("Error: OLLAMA_API_URL is not set in the .env file.");
    return;
  }

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
    const markdownTable = result.message?.content || "No markdown table generated";

    console.log("Generated Markdown Table:");
    console.log(markdownTable);
    const resp = extractMarkdownTable(markdownTable);
    return resp;
  } catch (error) {
    console.error("Error communicating with Ollama API:", error.message);
  }
}



export async function getMarkdownTable(daten: string, result: string) {
  const query = result;
  const data = daten;
  const file = await createMarkdownTable(query, data);
  return file;
}