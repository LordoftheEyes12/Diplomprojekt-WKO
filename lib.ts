import XRegExp from 'xregexp';
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

import { getModels, setModel, populateDB } from "./modelHandle.ts";
export { getModels, setModel, populateDB };


const schema = "CREATE TABLE `categories` ( `CategoryID` INT NOT NULL UNIQUE PRIMARY KEY , `CategoryName` varchar(255) DEFAULT NULL, `Description` varchar(255) DEFAULT NULL ); CREATE TABLE `customers` ( `CustomerID` INT NOT NULL UNIQUE PRIMARY KEY, `CustomerName` varchar(255) DEFAULT NULL, `ContactName` varchar(255) DEFAULT NULL, `Address` varchar(255) DEFAULT NULL, `City` varchar(255) DEFAULT NULL, `PostalCode` varchar(255) DEFAULT NULL, `Country` varchar(255) DEFAULT NULL ); CREATE TABLE `employees` ( `EmployeeID` INT NOT NULL UNIQUE PRIMARY KEY, `LastName` varchar(255) DEFAULT NULL, `FirstName` varchar(255) DEFAULT NULL, `BirthDate` date DEFAULT NULL, `Photo` varchar(255) DEFAULT NULL, `Notes` text ); CREATE TABLE `orders` ( `OrderID` INT NOT NULL UNIQUE PRIMARY KEY, `CustomerID` INT DEFAULT NULL, `EmployeeID` INT DEFAULT NULL, `OrderDate` date DEFAULT NULL, `ShipperID` INT DEFAULT NULL, FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`), FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`), FOREIGN KEY (`ShipperID`) REFERENCES `shippers` (`ShipperID`) ); CREATE TABLE `order_details` ( `OrderDetailID` INT NOT NULL UNIQUE PRIMARY KEY, `OrderID` INT DEFAULT NULL, `ProductID` INT DEFAULT NULL, `Quantity` INT DEFAULT NULL, FOREIGN KEY (`OrderID`) REFERENCES `orders` (`OrderID`), FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`) ); CREATE TABLE `products` ( `ProductID` INT NOT NULL UNIQUE PRIMARY KEY, `ProductName` varchar(255) DEFAULT NULL, `SupplierID` INT DEFAULT NULL, `CategoryID` INT DEFAULT NULL, `Unit` varchar(255) DEFAULT NULL, `Price` double DEFAULT NULL, FOREIGN KEY (`CategoryID`) REFERENCES `categories` (`CategoryID`), FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`) ); CREATE TABLE `shippers` ( `ShipperID` INT NOT NULL UNIQUE PRIMARY KEY, `ShipperName` varchar(255) DEFAULT NULL, `Phone` varchar(255) DEFAULT NULL ); CREATE TABLE `suppliers` ( `SupplierID` INT NOT NULL UNIQUE PRIMARY KEY, `SupplierName` varchar(255) DEFAULT NULL, `ContactName` varchar(255) DEFAULT NULL, `Address` varchar(255) DEFAULT NULL, `City` varchar(255) DEFAULT NULL, `PostalCode` varchar(255) DEFAULT NULL, `Country` varchar(255) DEFAULT NULL, `Phone` varchar(255) DEFAULT NULL );";


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



// Function to generate a SELECT query with API
export async function generateSelectQuery(schema: string, input: string) {
  const provider = Deno.env.get("API_PROVIDER");
  let apiUrl;
  let model;
  let apiKey;
  if (provider === "OA") {
  apiUrl = Deno.env.get("OA_API_URL"); 
  model = Deno.env.get("OA_MODEL");
  apiKey = Deno.env.get("OA_API_KEY");
  }
  else if (provider === "OL"){
  apiUrl = Deno.env.get("OL_API_URL"); 
  model = Deno.env.get("OL_MODEL");
  apiKey = Deno.env.get("OL_API_KEY");
  
  }
  apiUrl = apiUrl + "/v1/chat/completions";
  console.log("model", model);
  console.log("apiUrl", apiUrl);
  if (!apiUrl) {
    console.error("Error: API_URL is not set in the .env file.");
    return;
  }


  
  const payload = {
    model: model,
    messages: [{ role: "user", content: `using the SQLite database with this schema\n schema: ${schema} \n answer the following query. Only generate select queries. under no circumstances use the word SELECT anywhere other than in the query itself query: ${input}` }],
    stream: false,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    //console.log(result);
    const queryResult = result.choices[0]?.message?.content || "No response from the model";

    console.log("Generated SELECT Query:");
    console.log(queryResult);
    return queryResult;
  } catch (error) {
    console.error("Error generating SELECT query:", error.message);
  }
}

// Function to create a Markdown table using a query and data
async function createMarkdownTable(query: string, data: string) {
  const provider = Deno.env.get("API_PROVIDER");
  let apiUrl;
  let model;
  let apiKey;
  if (provider === "OA") {
  apiUrl = Deno.env.get("OA_API_URL"); 
  model = Deno.env.get("OA_MODEL");
  apiKey = Deno.env.get("OA_API_KEY");
  }
  else if (provider === "OL"){
  apiUrl = Deno.env.get("OL_API_URL"); 
  model = Deno.env.get("OL_MODEL");
  apiKey = Deno.env.get("OL_API_KEY");
  }
  apiUrl = apiUrl + "/v1/chat/completions";

  if (!apiUrl) {
    console.error("Error: API_URL is not set in the .env file.");
    return;
  }
 

  const payload = {
    model: model,
    messages: [
      {
        role: "user",
        content: `using this SQL query: ${query} and this result: ${data} create a markdown table that contains meaningful headings and the data. only return the table syntax filled with the data that can be used with any common Markdown Readers. the database uses this schema: ${schema}`,
      },
    ],
    stream: false,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const result = await response.json();
    const markdownTable = result.choices[0]?.message?.content || "No markdown table generated";

    console.log("Generated Markdown Table:");
    console.log(markdownTable);
    const resp = extractMarkdownTable(markdownTable);
    return resp;
  } catch (error) {
    console.error("Error communicating with API:", error.message);
  }
}



export async function getMarkdownTable(daten: string, result: string) {
  const query = result;
  const data = daten;
  const file = await createMarkdownTable(query, data);
  return file;
}



export async function getSQLQuery(input: string | null) {
  const response = await generateSelectQuery(schema, input || "");
  const apfelsaft = extractSQLSelect(response.toString());
  return apfelsaft;
}

export function changeProvider(provider: string){
  if (provider == "OA" || provider == "OL"){
    Deno.env.set("API_PROVIDER", provider);
    return JSON.stringify({provider});
  } 
  else{
    return JSON.stringify({provider: "No Provider"});
  }
  
}

export function filterThought(input: string): string {
  const thinkBlockPattern = XRegExp('<think[^>]*>[\\s\\S]*?</think>', 'g');
  const cleanedString = XRegExp.replace(input, thinkBlockPattern, '');
  return cleanedString;
}