# GraphQL Integration

**Type**: API Query Language & Runtime
**Created**: 2012 (Facebook)
**Purpose**: Declarative data fetching with precise client control
**Key Innovation**: Single endpoint, typed schema, no over/under-fetching

## Overview

GraphQL is a query language and server-side runtime that enables clients to request exactly the data they need in a single request. Unlike REST APIs with multiple endpoints, GraphQL provides a single endpoint through which clients can query any combination of data defined in the schema.

## Core Concepts

### Schema Definition

```graphql
# Type definitions describe data shape
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  comments: [Comment!]!
}

type Query {
  user(id: ID!): User
  posts(limit: Int): [Post!]!
}

type Mutation {
  createPost(input: PostInput!): Post!
}
```

### Query Language

```graphql
# Client specifies exact data needs
query GetUserWithPosts($userId: ID!) {
  user(id: $userId) {
    name
    email
    posts {
      title
      content
      comments {
        text
        author {
          name
        }
      }
    }
  }
}
```

## Type System

GraphQL defines six named type categories:

### 1. Object Types
```graphql
type Container {
  id: ContainerID!
  from(address: String!): Container!
  withExec(args: [String!]!): Container!
}
```

### 2. Scalar Types
```graphql
scalar DateTime
scalar JSON
scalar ContainerID  # Custom scalar
```

### 3. Enum Types
```graphql
enum Status {
  PENDING
  ACTIVE
  COMPLETED
  FAILED
}
```

### 4. Interface Types
```graphql
interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
  name: String!
}
```

### 5. Union Types
```graphql
union SearchResult = User | Post | Comment
```

### 6. Input Types
```graphql
input PostInput {
  title: String!
  content: String!
  authorId: ID!
}
```

## Integration Patterns

### 1. API Gateway Pattern

```javascript
// Single GraphQL gateway for microservices
const gateway = new ApolloGateway({
  serviceList: [
    { name: 'users', url: 'http://users-service:4001' },
    { name: 'posts', url: 'http://posts-service:4002' },
    { name: 'comments', url: 'http://comments-service:4003' }
  ]
});
```

### 2. Schema Stitching

```javascript
// Combine multiple schemas
const schema = stitchSchemas({
  schemas: [userSchema, postSchema, commentSchema],
  mergeTypes: true
});
```

### 3. Federation

```graphql
# Distributed schema with Apollo Federation
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type User @key(fields: "id") {
  id: ID! @external
  posts: [Post!]!
}
```

## Best Practices (2024)

### 1. Declarative Data Fetching

```javascript
// Components declare their data needs
const USER_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserFragment
    }
  }
`;

// Fragments for reusability
const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    name
    email
  }
`;
```

### 2. Security Implementation

```javascript
// Role-based field access
const resolvers = {
  User: {
    email: (parent, args, context) => {
      if (!context.user.hasRole('ADMIN')) {
        throw new ForbiddenError('Unauthorized');
      }
      return parent.email;
    }
  }
};

// Query depth limiting
const depthLimit = require('graphql-depth-limit');
app.use('/graphql', depthLimit(5));
```

### 3. Performance Optimization

```javascript
// DataLoader for batching
const userLoader = new DataLoader(async (ids) => {
  const users = await getUsersByIds(ids);
  return ids.map(id => users.find(u => u.id === id));
});

// Resolver with batching
const resolvers = {
  Post: {
    author: (post) => userLoader.load(post.authorId)
  }
};
```

### 4. Error Handling

```graphql
# Structured error responses
{
  "errors": [
    {
      "message": "User not found",
      "extensions": {
        "code": "USER_NOT_FOUND",
        "id": "123"
      }
    }
  ],
  "data": null
}
```

## Apollo Dagger Integration

The Apollo Dagger MCP uses GraphQL for container operations:

```graphql
# Dagger's GraphQL schema
type Container {
  from(address: String!): Container!
  withExec(args: [String!]!): Container!
  withDirectory(path: String!, directory: DirectoryID!): Container!
  stdout: String!
  stderr: String!
  exitCode: Int!
}

# Query execution
query RunContainer {
  container {
    from(address: "node:18")
    withExec(args: ["npm", "test"])
    stdout
  }
}
```

## Advantages Over REST

### 1. No Over/Under-fetching
```graphql
# Get exactly what you need
query { 
  user(id: "1") { 
    name  # Only these fields
    email # Nothing more, nothing less
  } 
}
```

### 2. Single Request
```graphql
# Multiple resources in one query
query {
  user(id: "1") { name }
  posts(limit: 10) { title }
  notifications { count }
}
```

### 3. Type Safety
```javascript
// Compile-time type checking with TypeScript
type User = {
  id: string;
  name: string;
  email: string;
};
```

### 4. Self-Documenting
```graphql
# Introspection query for schema
query {
  __schema {
    types {
      name
      description
      fields {
        name
        type
      }
    }
  }
}
```

## Evolution Without Versioning

### Deprecation Strategy
```graphql
type User {
  id: ID!
  name: String!
  username: String @deprecated(reason: "Use 'name' instead")
}
```

### Field Addition
```graphql
# Safe to add new fields
type User {
  id: ID!
  name: String!
  email: String!
  avatar: String  # New field, non-breaking
}
```

## Tools and Ecosystem

### Development Tools
- **GraphiQL**: Interactive query explorer
- **GraphQL Playground**: Advanced IDE
- **Apollo Studio**: Schema registry and analytics

### Client Libraries
- **Apollo Client**: Full-featured caching client
- **Relay**: Facebook's GraphQL client
- **urql**: Lightweight alternative

### Server Implementations
- **Apollo Server**: Node.js
- **GraphQL Yoga**: Fully-featured server
- **Hasura**: Instant GraphQL APIs

## Zero-Entropy Insights

### 1. **Schema Is Contract**
The schema defines the complete API surface, eliminating ambiguity.

### 2. **Clients Drive Requirements**
Clients declare their needs; servers provide capabilities.

### 3. **Graph Thinking**
Model domains as graphs, not resources.

### 4. **Evolution Over Versioning**
Continuous evolution without breaking changes.

## Related

- [[Apollo Dagger Integration]]
- [[Dagger CI-CD]]
- [[Container Orchestration]]
- [[Apollo MCP Server]]
- [[MCP Servers Configuration]]

---

*"GraphQL: Ask for what you need, get exactly that"*