import "https://deno.land/x/dotenv@v3.2.2/load.ts"; // Import dotenv for environment variables

async function createMarkdownTable(query: string, data: string) {
  const apiUrl = Deno.env.get("OLLAMA_API_URL"); // Load API URL from .env
  const model = "qwen2.5-coder:14b";

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
    const markdownTable = result.message.content; // Extract the markdown table

    console.log("Generated Markdown Table:");
    console.log(markdownTable);
    return markdownTable;
  } catch (error) {
    console.error("Error communicating with Ollama API:", error.message);
  }
}

// Example usage
if (import.meta.main) {
  const query = "SELECT name, age FROM users;";
  const data = '[{name: "John", age: 30}, {name: "Jane", age: 25}]';

  await createMarkdownTable(query, data);
}
