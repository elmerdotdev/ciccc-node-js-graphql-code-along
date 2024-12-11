import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone'

// Sample data
const customers = [
  { id: "1", name: "John Smith", email: "john@mail.com"},
  { id: "2", name: "Jane Done", email: "jane@mail.com"},
  { id: "3", name: "Joe Moe", email: "joe@mail.com"}
]

const products = [
  { id: "1", productName: "iPhone 30 Max", price: 199.00},
  { id: "2", productName: "MacBook M15 Air", price: 249.00}
]

const orders = [
  { id: "1", customerId: "1", productIds: ["2"] },
  { id: "2", customerId: "2", productIds: ["1", "2"] },
  { id: "3", customerId: "3", productIds: ["1"] },
]

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
`

// Resolvers
const resolvers = {
  Query: {
    customers: () => customers,
    products: () => products,
    orders: () => 
      orders.map(order => {
        return {
          ...order,
          customer: customers.find(cust => cust.id === order.customerId),
          products: order.productIds.map(prodId =>
            products.find(prod => prod.id == prodId)
          )
        }
      }),
    customerById: (_: unknown, { id }: { id: string }) =>
      customers.find(customer => customer.id === id),
    ordersByCustomer: (_: unknown, { customerId }: { customerId: string }) =>
      orders
        .filter(order => order.customerId === customerId)
        .map(order => ({
          ...order,
          customer: customers.find(cust => cust.id === order.customerId),
          products: order.productIds.map(prodId =>
            products.find(prod => prod.id == prodId)
          )
        }))
  },
  Customer: {
    orders: (parent: { id: string }) => 
      orders
        .filter(order => order.customerId === parent.id)
        .map(order => ({
          ...order,
          products: order.productIds.map(prodId =>
            products.find(prod => prod.id == prodId)
          )
        }))
  }
}

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers
})

// Start Apollo Server
const startServer = async () => {
  const { url } = await startStandaloneServer(server)
  console.log(`Server is running on ${url}...`)
}

startServer()