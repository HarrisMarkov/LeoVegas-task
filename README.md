## 📃 Documentation

This file contains information about the API and should be read testing the solution. Some important notes:

- All endpoints besides the `/register` one are protected using JWT (JSON Web Token) - once the user is registered the token is returned in the response body and should be used to access the other endpoints;
- A `.env` file is provided with the environment variables needed to run the project (database, auth, etc);
- The project contains 17 unit tests covering various - more tests can always be added but these 17 should cover most (if not all) cases possible:
  - successfull cases
  - failure due to invalid authentication
  - failure due to invalid payload
  - failure due to invalid permissions
  - failure due to user not being found

### 💻 Main technologies chosen:

- NodeJS
- Typescript
- Joi
- JWT
- Express
- MySQL
- Prisma
- Docker (to run a mysql container)

### ⚙️ Requirements:

- NodeJS version v20.12.2 or higher
- Docker and other technologies might vary in needed version based on your OS (I'm running Docker version 27.1.1, build 6312585 on Fedora 40 OS)

### 🖊️ Commands:

The following commands show `npm` but can be executed with any package manager that works for NodeJS (i.e: yarn, pnpm, etc)

#### Installing packages

```bash
$ npm i
```

#### Init database

```bash
$ docker compose up -d
```

#### Run prisma generate and db push

The following commands should be run when the Database container is already running.
Generate the schema inside the DB and then apply it:

```bash
$ npm run prisma:generate
$ npm run prisma:db-push
```

#### Start the server locally

```bash
$ npm run dev
```

#### Run tests

```bash
$ npm test
```

### 🛣️ Routes

- Base url = `http://localhost:3000/api`

Bellow are some examples of the endpoints requested in the task description. A more detailed documentation of these routes can be found at `/docs`.

#### POST /register

- Request body:

```json
{
  "name": "Jon Doe",
  "email": "jondoe@example.com",
  "password": "password",
  "role": "ADMIN"
}
```

- Successfull response:

```json
{
  "message": "User registered successfully.",
  "user": {
    "id": "1a3029ef-a795-4306-8512-a1e00a8b442c",
    "name": "Jop Doe",
    "email": "jondoe@example.com",
    "password": "$2b$10$3czzo5/hbRewT4xPdjRv5ufq/Mc41oyMw9bnC3WLcbEc7XgPdr1Dq",
    "role": "ADMIN",
    "createdAt": "2024-08-09T12:57:07.934Z",
    "updatedAt": "2024-08-09T12:57:07.934Z",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

- Error when the email is already registered:

```json
{
  "name": "PAYLOAD_ERROR",
  "httpCode": 400,
  "message": "User.register() error: This email is already registered.",
  "metadata": []
}
```

- Error when the request body is missing a field:

```json
{
  "name": "PAYLOAD_ERROR",
  "httpCode": 400,
  "message": "password is required",
  "metadata": [
    {
      "key": "password",
      "reason": "FIELD_IS_REQUIRED"
    }
  ]
}
```

#### GET /user/list

- Query params:

```json
limit = 2
offset = 0
```

- Successfull response:

```json
{
  "message": "Users fetched successfully.",
  "users": [
    {
      "id": "05f5d3d8-c367-4466-83ff-09b8d9cd3e87",
      "name": "Peter Parker",
      "email": "peterparker@example.com",
      "role": "USER",
      "createdAt": "2024-08-09T01:58:48.347Z",
      "updatedAt": "2024-08-09T01:58:48.347Z"
    },
    {
      "id": "0cb07029-2ac4-4a5e-bf59-2a74232a3d57",
      "name": "Harry Potter",
      "email": "harrypotter@example.com",
      "role": "USER",
      "createdAt": "2024-08-09T03:07:19.736Z",
      "updatedAt": "2024-08-09T03:07:19.736Z"
    }
  ]
}
```

- Error when a USER role tries to fetch all users:

```json
{
  "name": "AUTHORIZATION_ERROR",
  "httpCode": 403,
  "message": "validateRole() error: You do not have permission to execute this operation",
  "metadata": []
}
```

#### GET /user/:id

- Query params:

```json
id = "0cb07029-2ac4-4a5e-bf59-2a74232a3d57"
```

- Successfull response:

```json
{
  "message": "User fetched successfully.",
  "user": {
    "id": "0cb07029-2ac4-4a5e-bf59-2a74232a3d57",
    "name": "Harry Potter",
    "email": "harrypotter@example.com",
    "role": "USER",
    "createdAt": "2024-08-09T03:07:19.736Z",
    "updatedAt": "2024-08-09T03:07:19.736Z"
  }
}
```

- Error when user is not found:

```json
{
  "name": "NOT_FOUND_ERROR",
  "httpCode": 404,
  "message": "Prisma error code P2025: User.getOne() error: No User found",
  "metadata": []
}
```

- Error when USER role tries to view another user's details:

```json
{
  "name": "AUTHORIZATION_ERROR",
  "httpCode": 403,
  "message": "User.getOne() error: Only ADMIN users can see other user details",
  "metadata": []
}
```

#### PATCH /user/:id

- Query params and request body:

```json
id = "1a3029ef-a795-4306-8512-a1e00a8b442c"

{
    "name": "Bob Ross",
    "email": "bobross@example.com"
}
```

- Successfull response:

```json
{
  "message": "User updated successfully.",
  "users": {
    "id": "1a3029ef-a795-4306-8512-a1e00a8b442c",
    "name": "Bob Ross",
    "email": "bobross@example.com",
    "role": "ADMIN",
    "createdAt": "2024-08-09T12:57:07.934Z",
    "updatedAt": "2024-08-09T13:12:27.488Z"
  }
}
```

- This endpint also responds with `403` or `404` respectively (like the endpoint above) when the user executing the action doesn't have permissions or the user being updated is not found.

#### DELETE /user/:id

- Query params:

```json
id = "0cb07029-2ac4-4a5e-bf59-2a74232a3d57"
```

- Successfull response:

```json
{
  "message": "User deleted successfully.",
  "users": {
    "id": "0cb07029-2ac4-4a5e-bf59-2a74232a3d57",
    "name": "Peter Parker",
    "email": "peterparker@example.com",
    "role": "ADMIN",
    "createdAt": "2024-08-09T12:57:07.934Z",
    "updatedAt": "2024-08-09T13:12:27.488Z"
  }
}
```

#### GET /docs

This endpoint exposes a more detailed API documentation using OpenAPI 3.0 and Swagger.
