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
docker run --env-file docker.env --name diplomprojekt_container -it --rm -p 3741:3741 diplomprojekt
```

to start the container.

once started navigate to the host ip address on port 3741 in your browser and the user interface should launch.

To use the programme simply enter the question and select the desired option

## first setup

Usage requirements:

- Deno needs to be installed on the host system
- For the Docker container docker-engine needs to be installed on the host system. The container will install all dependencies
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
    "debug": "0",
    "daten": [
        [
            10264,
            2,
            "Chang",
            35
        ],
        [
            10264,
            41,
            "Jacks New England Clam Chowder",
            25
        ],
        [
            10327,
            2,
            "Chang",
            25
        ],
        [
            10327,
            11,
            "Queso Cabrales",
            50
        ],
        [
            10327,
            30,
            "Nord-Ost Matjeshering",
            35
        ],
        [
            10327,
            58,
            "Escargots de Bourgogne",
            30
        ],
        [
            10378,
            71,
            "Fløtemysost",
            6
        ],
        [
            10434,
            11,
            "Queso Cabrales",
            6
        ],
        [
            10434,
            76,
            "Lakkalikööri",
            18
        ]
    ],
    "mdTable": "| OrderID | ProductID | ProductName           | Quantity |\n|---------|-----------|-----------------------|----------|\n| 10264   | 2         | Chang                 | 35       |\n| 10264   | 41        | Jack's New England Clam Chowder | 25       |\n| 10327   | 2         | Chang                 | 25       |\n| 10327   | 11        | Queso Cabrales        | 50       |\n| 10327   | 30        | Nord-Ost Matjeshering | 35       |\n| 10327   | 58        | Escargots de Bourgogne | 30     |\n| 10378    | 71        | Fløtemysost           | 6        |\n| 10434   | 11        | Queso Cabrales        | 6        |\n| 10434   | 76        | Lakkalikööri          | 18       |"
}
```

in Debug mode the Response looks like this

```json
{
    "debug": "1",
    "input": "give me all the orders and products from customer 24",
    "result": "SELECT orders.OrderID, order_details.ProductID\nFROM orders\nINNER JOIN order_details ON orders.OrderID = order_details.OrderID\nWHERE orders.CustomerID = 24;",
    "daten": [
        [
            10264,
            2
        ],
        [
            10264,
            41
        ],
        [
            10327,
            2
        ],
        [
            10327,
            11
        ],
        [
            10327,
            30
        ],
        [
            10327,
            58
        ],
        [
            10378,
            71
        ],
        [
            10434,
            11
        ],
        [
            10434,
            76
        ]
    ],
    "mdTable": "| OrderID | ProductID |\n|---------|-----------|\n| 10264   | 2         |\n| 10264   | 41        |\n| 10327   | 2         |\n| 10327   | 11        |\n| 10327   | 30        |\n| 10327   | 58        |\n| 10378   | 71        |\n| 10434   | 11        |\n| 10434   | 76        |"
}
```
