# dorm-admin-front

## Project Setup (Local)

```sh
npm install
npm run dev
```

visit your browser with an address: "localhost:5173"

### Building for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Project Setup (Docker)

```sh
docker compose up -d
```

The application should run on: "localhost:8080"

### Run tests via docker

```sh
docker compose up test
```

### Run the server locally via docker

```sh
docker compose up app
```

visit your browser with an address: "localhost:8080"