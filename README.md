# Diplomprojekt-WKO

Repository für das Diplomprojekt mit der WKO Inhouse GmbH

## useage instructions

to start the programm run this command in the shell. This assumes the Useage requirements are met

```bash
deno task start
```

or when running in debug mode

```bash
deno task debug
```

using the docker version run

```bash
docker build -t diplomprojekt .
```

and then run

```bash
docker run --env-file docker.env -it --rm -p 3741:3741 diplomprojekt

```

to start the container.

once started navigate to the host ip address on port 3741 in your browser and the user interface should launch.

To use the programme simply enter the question and select the desired option

## first setup

Usage requirements:

- Deno needs to be installed on the host system
- For the Docker container docker-engine and docker-compose need to be installed on the host system
- an AI provider needs to be set. Instructions found below

### set AI provider

For the tool to work as expected one or both AI providers need to be configured. Supported options are Ollama and OpenAI.

To configure the providers populate all the fields in the .env file. Use the template to create it.

set the desired defualt provider in the API_PROVIDER variable.

if only one provider is set up the console will show errors for the provider not set up but the tool will function without issue

## Data structure

a sample JSON response may look like this

```json
{
  "input": "give me all the orders and products from customer 24",
  "result": "SELECT \n    o.OrderID,\n    c.CustomerName,\n    e.FirstName || ' ' || e.LastName AS EmployeeName,\n    o.OrderDate,\n    od.Quantity,\n    p.ProductName,\n    p.Price\nFROM orders o\nJOIN customers c ON o.CustomerID = c.CustomerID\nJOIN employees e ON o.EmployeeID = e.EmployeeID\nJOIN order_details od ON o.OrderID = od.OrderID\nJOIN products p ON od.ProductID = p.ProductID\nWHERE c.CustomerID = 24;",
  "daten": [
    [
      10264,
      "Folk och fä HB",
      "Michael Suyama",
      "1996-07-24",
      35,
      "Chang",
      19
    ],
    [
      10264,
      "Folk och fä HB",
      "Michael Suyama",
      "1996-07-24",
      25,
      "Jacks New England Clam Chowder",
      9.65
    ],
    [
      10327,
      "Folk och fä HB",
      "Andrew Fuller",
      "1996-10-11",
      25,
      "Chang",
      19
    ],
    [
      10327,
      "Folk och fä HB",
      "Andrew Fuller",
      "1996-10-11",
      50,
      "Queso Cabrales",
      21
    ],
    [
      10327,
      "Folk och fä HB",
      "Andrew Fuller",
      "1996-10-11",
      35,
      "Nord-Ost Matjeshering",
      25.89
    ],
    [
      10327,
      "Folk och fä HB",
      "Andrew Fuller",
      "1996-10-11",
      30,
      "Escargots de Bourgogne",
      13.25
    ],
    [
      10378,
      "Folk och fä HB",
      "Steven Buchanan",
      "1996-12-10",
      6,
      "Fløtemysost",
      21.5
    ],
    [
      10434,
      "Folk och fä HB",
      "Janet Leverling",
      "1997-02-03",
      6,
      "Queso Cabrales",
      21
    ],
    [
      10434,
      "Folk och fä HB",
      "Janet Leverling",
      "1997-02-03",
      18,
      "Lakkalikööri",
      18
    ]
  ],
  "mdTable": "| OrderID | CustomerName      | EmployeeName       | OrderDate    | Quantity | ProductName            | Price |\n|---------|-------------------|--------------------|-------------|----------|------------------------|-------|\n| 10264   | Folk och fä HB    | Michael Suyama     | 1996-07-24  | 35       | Chang                  | 19.00 |\n| 10264   | Folk och fä HB    | Michael Suyama     | 1996-07-24  | 25       | Jacks New England Clam Chowder | 9.65 |\n| 10327   | Folk och fä HB    | Andrew Fuller      | 1996-10-11  | 25       | Chang                  | 19.00 |\n| 10327   | Folk och fä HB    | Andrew Fuller      | 1996-10-11  | 50       | Queso Cabrales         | 21.00 |\n| 10327   | Folk och fä HB    | Andrew Fuller      | 1996-10-11  | 35       | Nord-Ost Matjeshering  | 25.89 |\n| 10327   | Folk och fä HB    | Andrew Fuller      | 1996-10-11  | 30       | Escargots de Bourgogne | 13.25 |\n| 10378   | Folk och fä HB    | Steven Buchanan    | 1996-12-10  | 6        | Fløtemysost            | 21.50 |\n| 10434   | Folk och fä HB    | Janet Leverling    | 1997-02-03  | 6        | Queso Cabrales         | 21.00 |\n| 10434   | Folk och fä HB    | Janet Leverling    | 1997-02-03  | 18       | Lakkalikööri           | 18.00 |"
}
```
