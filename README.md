# Diplomprojekt-WKO

Repository für das Diplomprojekt mit der WKO Inhouse GmbH

run with

```bash
deno run --allow-net --allow-read --allow-write --allow-import --allow-env main.ts
```

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
