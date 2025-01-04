import { DB } from 'https://deno.land/x/sqlite/mod.ts';
import { route, type Route } from "@std/http/unstable-route";
import { extractSQLSelect, getMarkdownTable, generateSelectQuery } from "./lib.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

let debug = Deno.env.get("DEBUG");
const DataBase = new DB('dev.db');

const schema = "CREATE TABLE `categories` ( `CategoryID` INT NOT NULL UNIQUE PRIMARY KEY , `CategoryName` varchar(255) DEFAULT NULL, `Description` varchar(255) DEFAULT NULL ); CREATE TABLE `customers` ( `CustomerID` INT NOT NULL UNIQUE PRIMARY KEY, `CustomerName` varchar(255) DEFAULT NULL, `ContactName` varchar(255) DEFAULT NULL, `Address` varchar(255) DEFAULT NULL, `City` varchar(255) DEFAULT NULL, `PostalCode` varchar(255) DEFAULT NULL, `Country` varchar(255) DEFAULT NULL ); CREATE TABLE `employees` ( `EmployeeID` INT NOT NULL UNIQUE PRIMARY KEY, `LastName` varchar(255) DEFAULT NULL, `FirstName` varchar(255) DEFAULT NULL, `BirthDate` date DEFAULT NULL, `Photo` varchar(255) DEFAULT NULL, `Notes` text ); CREATE TABLE `orders` ( `OrderID` INT NOT NULL UNIQUE PRIMARY KEY, `CustomerID` INT DEFAULT NULL, `EmployeeID` INT DEFAULT NULL, `OrderDate` date DEFAULT NULL, `ShipperID` INT DEFAULT NULL, FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`), FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`), FOREIGN KEY (`ShipperID`) REFERENCES `shippers` (`ShipperID`) ); CREATE TABLE `order_details` ( `OrderDetailID` INT NOT NULL UNIQUE PRIMARY KEY, `OrderID` INT DEFAULT NULL, `ProductID` INT DEFAULT NULL, `Quantity` INT DEFAULT NULL, FOREIGN KEY (`OrderID`) REFERENCES `orders` (`OrderID`), FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`) ); CREATE TABLE `products` ( `ProductID` INT NOT NULL UNIQUE PRIMARY KEY, `ProductName` varchar(255) DEFAULT NULL, `SupplierID` INT DEFAULT NULL, `CategoryID` INT DEFAULT NULL, `Unit` varchar(255) DEFAULT NULL, `Price` double DEFAULT NULL, FOREIGN KEY (`CategoryID`) REFERENCES `categories` (`CategoryID`), FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`) ); CREATE TABLE `shippers` ( `ShipperID` INT NOT NULL UNIQUE PRIMARY KEY, `ShipperName` varchar(255) DEFAULT NULL, `Phone` varchar(255) DEFAULT NULL ); CREATE TABLE `suppliers` ( `SupplierID` INT NOT NULL UNIQUE PRIMARY KEY, `SupplierName` varchar(255) DEFAULT NULL, `ContactName` varchar(255) DEFAULT NULL, `Address` varchar(255) DEFAULT NULL, `City` varchar(255) DEFAULT NULL, `PostalCode` varchar(255) DEFAULT NULL, `Country` varchar(255) DEFAULT NULL, `Phone` varchar(255) DEFAULT NULL );";

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

        Deno.env.set("OLLAMA_MODEL", model || "qwen2.5-coder:14b");
        console.log("Model set to:", model);
        return new Response(`Model set to: ${model}`);
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
          return new Response("Debug parameter is required", { status: 400 });
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
        const html = await Deno.readFile("./public/index.html");
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      return new Response("Method not allowed", { status: 405 });
    },
  },
  {
    method: ["GET", "HEAD"],
    pattern: new URLPattern({ pathname: "/new" }),
    handler: async (req: Request) => {
      if (req.method === "HEAD") {
        return new Response(null);
      }
      if (req.method === "GET") {
        const html = await Deno.readFile("./public/new.html");
        return new Response(html, { headers: { "Content-Type": "text/html" } });
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
  }
];

async function apiCall(input: string | null) {
  console.log("Input value:", input);
  let mdTable = "";
  const result = await getSQLQuery(input) || "";
  const daten = DataBase.query(result);
  console.log(daten);
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

async function getSQLQuery(input: string | null) {
  const response = await generateSelectQuery(schema, input || "");
  const apfelsaft = extractSQLSelect(response.toString());
  return apfelsaft;
}

function defaultHandler(_req: Request) {
  return new Response("Not found", { status: 404 });
}

Deno.serve(route(routes, defaultHandler));
