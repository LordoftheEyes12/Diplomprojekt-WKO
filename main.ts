import { DB } from 'https://deno.land/x/sqlite/mod.ts';
import { route, type Route } from "@std/http/unstable-route";
import { getMarkdownTable,  getSQLQuery, changeProvider, getModels, setModel, populateDB,answerDatabaseQuestion } from "./lib.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";


let debug = Deno.env.get("DEBUG");
const DataBase = new DB('dev.db');


const routes: Route[] = [
  {
    method: ["GET", "HEAD"],
    pattern: new URLPattern({ pathname: "/api" }),
    handler: async (req: Request) => {
      if (req.method === "HEAD") {
        return new Response(null);
      }
      if (req.method === "GET") {
        const url = new URL(req.url);
        const input = url.searchParams.get("Input");
        const result = await apiCall(input);
        return new Response(result, { headers: { "Content-Type": "application/json" } });
      }

      return new Response("Method not allowed", { status: 405 });
    },
  },
  {
    method: ["GET", "HEAD"],
    pattern: new URLPattern({ pathname: "/dataset" }),
    handler: async (req: Request) => {
      if (req.method === "HEAD") {
        return new Response(null);
      }
      if (req.method === "GET") {
        const url = new URL(req.url);
        const input = url.searchParams.get("Input");

        const result = await answerDatabaseQuestion(input||"Explain the Database to me");
        return new Response(result, { headers: { "Content-Type": "application/json" } });
      }

      return new Response("Method not allowed", { status: 405 });
    },
  },
  {
    method: ["GET", "HEAD"],
    pattern: new URLPattern({ pathname: "/model" }),
    handler: (req: Request) => {
      if (req.method === "HEAD") {
        return new Response(null);
      }
      if (req.method === "GET") {
        const url = new URL(req.url);

        let model = url.searchParams.get("Model");
        if (!model) {
          model = url.searchParams.get("model");
          if (!model) {
            return new Response("Model parameter is required", { status: 400 });
          }
        }
        const result = setModel(model);
        return new Response(result, { headers: { "Content-Type": "application/json" } });
      }

      return new Response("Method not allowed", { status: 405 });
    },
  },
  {
    method: ["GET", "HEAD"],
    pattern: new URLPattern({ pathname: "/debug" }),
    handler: (req: Request) => {
      if (req.method === "HEAD") {
        return new Response(null);
      }
      if (req.method === "GET") {
        const url = new URL(req.url);
        const debugParam = url.searchParams.get("debug");


        if (debugParam === null) {
          
          return new Response(debug, { headers: { "Content-Type": "text/plain" } });
        }

        debug = debugParam;
        console.log("Debug mode set to:", debug);
        return new Response(`Debug mode set to: ${debug}`);


      }

      return new Response("Method not allowed", { status: 405 });
    },
  },
  {
    method: ["GET", "HEAD"],
    pattern: new URLPattern({ pathname: "/" }),
    handler: async (req: Request) => {
      if (req.method === "HEAD") {
        return new Response(null);
      }
      if (req.method === "GET") {
        await populateDB();

        const html = await Deno.readFile("./public/index.html");

        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      return new Response("Method not allowed", { status: 405 });
    },
  },
  {
    method: ["GET"],
    pattern: new URLPattern({ pathname: "/script.js" }),
    handler: async (req: Request) => {
      if (req.method === "GET") {
        const script = await Deno.readFile("./public/script.js");
        return new Response(script, { headers: { "Content-Type": "application/javascript" } });
      }
  
      return new Response("Method not allowed", { status: 405 });
    },
  },
  {
    method: ["GET"],
    pattern: new URLPattern({ pathname: "/style.css" }),
    handler: async (req: Request) => {
      if (req.method === "GET") {
        const styles = await Deno.readFile("./public/style.css");
        return new Response(styles, { headers: { "Content-Type": "text/css" } });
      }
  
      return new Response("Method not allowed", { status: 405 });
    },
  },
  {
    method: ["GET"],
    pattern: new URLPattern({ pathname: "/provider" }),
    handler: (req: Request) => {
      if (req.method === "GET") {
        const url = new URL(req.url);
        const provider = url.searchParams.get("provider");

        if (provider === null) {
          return new Response("Provider parameter is required", { status: 400 });
        }
        const response = changeProvider(provider); 
        
        return new Response(response, { headers: { "Content-Type": "text/plain" } });
      }
  
      return new Response("Method not allowed", { status: 405 });
    },
  },
  {
    method: ["GET", "HEAD"],
    pattern: new URLPattern({ pathname: "/logo.png" }),
    handler: async (req: Request) => {
      if (req.method === "HEAD") {
        return new Response(null);
      }
      if (req.method === "GET") {
        const html = await Deno.readFile("./public/logo.png");
        return new Response(html, { headers: { "Content-Type": "image/png" } });
      }

      return new Response("Method not allowed", { status: 405 });
    },
  },
  {
    method: ["GET", "HEAD"],
    pattern: new URLPattern({ pathname: "/getModels" }),
    handler: async (req: Request) => {
      if (req.method === "HEAD") {
        return new Response(null);
      }
      if (req.method === "GET") {
        const result = await getModels();
        
        return new Response(result, { headers: { "Content-Type": "text/plain" } });
      }

      return new Response("Method not allowed", { status: 405 });
    },
  }
];

async function apiCall(input: string | null) {
  console.log("Input value:", input);
  let mdTable = "";
  const result = await getSQLQuery(input) || "";
  const daten = DataBase.query(result);
  if (Object.keys(daten).length === 0) {
    mdTable = "no data";
  } else {
    mdTable = await getMarkdownTable(daten.toString(), result) || "";
  }
  if (debug == "1") {
    return JSON.stringify({ debug, input, result, daten, mdTable });
  } else {
    return JSON.stringify({ debug, daten, mdTable });
  }
}


function defaultHandler(_req: Request) {
  return new Response("Not found", { status: 404 });
}


Deno.serve({ port: 3741 }, route(routes, defaultHandler));


