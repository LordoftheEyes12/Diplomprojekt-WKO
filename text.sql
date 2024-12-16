CREATE TABLE `categories` (
  `CategoryID` INT NOT NULL UNIQUE PRIMARY KEY ,
  `CategoryName` varchar(255) DEFAULT NULL,
  `Description` varchar(255) DEFAULT NULL
);
CREATE TABLE `customers` (
  `CustomerID` INT NOT NULL UNIQUE PRIMARY KEY,
  `CustomerName` varchar(255) DEFAULT NULL,
  `ContactName` varchar(255) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `City` varchar(255) DEFAULT NULL,
  `PostalCode` varchar(255) DEFAULT NULL,
  `Country` varchar(255) DEFAULT NULL
);
CREATE TABLE `employees` (
  `EmployeeID` INT NOT NULL UNIQUE PRIMARY KEY,
  `LastName` varchar(255) DEFAULT NULL,
  `FirstName` varchar(255) DEFAULT NULL,
  `BirthDate` date DEFAULT NULL,
  `Photo` varchar(255) DEFAULT NULL,
  `Notes` text
);
CREATE TABLE `orders` (
  `OrderID` INT NOT NULL UNIQUE PRIMARY KEY,
  `CustomerID` INT DEFAULT NULL,
  `EmployeeID` INT DEFAULT NULL,
  `OrderDate` date DEFAULT NULL,
  `ShipperID` INT DEFAULT NULL,
FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`),
FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`),
FOREIGN KEY (`ShipperID`) REFERENCES `shippers` (`ShipperID`)
);
CREATE TABLE `order_details` (
  `OrderDetailID` INT NOT NULL UNIQUE PRIMARY KEY,
  `OrderID` INT DEFAULT NULL,
  `ProductID` INT DEFAULT NULL,
  `Quantity` INT DEFAULT NULL,
  FOREIGN KEY (`OrderID`) REFERENCES `orders` (`OrderID`),
FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`)
);
CREATE TABLE `products` (
  `ProductID` INT NOT NULL UNIQUE PRIMARY KEY,
  `ProductName` varchar(255) DEFAULT NULL,
  `SupplierID` INT DEFAULT NULL,
  `CategoryID` INT DEFAULT NULL,
  `Unit` varchar(255) DEFAULT NULL,
  `Price` double DEFAULT NULL,
  FOREIGN KEY (`CategoryID`) REFERENCES `categories` (`CategoryID`),
FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`)
);
CREATE TABLE `shippers` (
  `ShipperID` INT NOT NULL UNIQUE PRIMARY KEY,
  `ShipperName` varchar(255) DEFAULT NULL,
  `Phone` varchar(255) DEFAULT NULL
);
CREATE TABLE `suppliers` (
  `SupplierID` INT NOT NULL UNIQUE PRIMARY KEY,
  `SupplierName` varchar(255) DEFAULT NULL,
  `ContactName` varchar(255) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `City` varchar(255) DEFAULT NULL,
  `PostalCode` varchar(255) DEFAULT NULL,
  `Country` varchar(255) DEFAULT NULL,
  `Phone` varchar(255) DEFAULT NULL
);
