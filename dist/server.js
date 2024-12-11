"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
// Sample data
const customers = [
    { id: "1", name: "John Smith", email: "john@mail.com" },
    { id: "2", name: "Jane Done", email: "jane@mail.com" },
    { id: "3", name: "Joe Moe", email: "joe@mail.com" }
];
const products = [
    { id: "1", productName: "iPhone 30 Max", price: 199.00 },
    { id: "2", productName: "MacBook M15 Air", price: 249.00 }
];
const orders = [
    { id: "1", customerId: "1", productIds: ["2"] },
    { id: "2", customerId: "2", productIds: ["1", "2"] },
    { id: "3", customerId: "3", productIds: ["1"] },
];
// Schema
const typeDefs = `#graphql
  type Customer {
    id: ID!,
    name: String,
    email: String,
    orders: [Order]
  }

  type Product {
    id: ID!,
    productName: String,
    price: Float
  }

  type Order {
    id: ID!,
    customer: Customer,
    products: [Product]
  }

  type Query {
    customers: [Customer],
    products: [Product],
    orders: [Order],
    customerById(id: ID!): Customer,
    ordersByCustomer(customerId: ID!): [Order]
  }
`;
// Resolvers
const resolvers = {
    Query: {
        customers: () => customers,
        products: () => products,
        orders: () => orders.map(order => {
            return Object.assign(Object.assign({}, order), { customer: customers.find(cust => cust.id === order.customerId), products: order.productIds.map(prodId => products.find(prod => prod.id == prodId)) });
        }),
        customerById: (_, { id }) => customers.find(customer => customer.id === id),
        ordersByCustomer: (_, { customerId }) => orders
            .filter(order => order.customerId === customerId)
            .map(order => (Object.assign(Object.assign({}, order), { customer: customers.find(cust => cust.id === order.customerId), products: order.productIds.map(prodId => products.find(prod => prod.id == prodId)) })))
    },
    Customer: {
        orders: (parent) => orders
            .filter(order => order.customerId === parent.id)
            .map(order => (Object.assign(Object.assign({}, order), { products: order.productIds.map(prodId => products.find(prod => prod.id == prodId)) })))
    }
};
// Create Apollo Server
const server = new server_1.ApolloServer({
    typeDefs,
    resolvers
});
// Start Apollo Server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = yield (0, standalone_1.startStandaloneServer)(server);
    console.log(`Server is running on ${url}...`);
});
startServer();
