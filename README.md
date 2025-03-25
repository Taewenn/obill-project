# OBill Project

A modern invoice management system with OCR capabilities built with NestJS and Nuxt.js.

## Features

-   Invoice management with OCR capabilities using Mistral AI
-   Category and department management
-   Analytics and reporting
-   Modern UI with shadcn-vue components
-   RESTful API with Swagger documentation

## Prerequisites

-   Node.js (v18 or higher)
-   PostgreSQL
-   Mistral AI API key

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/obill-project.git
cd obill-project
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp api/.env.example api/.env
cp app/.env.example app/.env
```

4. Update the environment variables in both `.env` files with your configuration.

5. Start the development servers:

```bash
npm run dev
```

This will start both the API (port 3000) and the frontend application (port 3001).

## Project Structure

```
obill-project/
├── api/                 # NestJS API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   ├── dto/
│   │   └── modules/
│   └── ...
└── app/                 # Nuxt.js frontend
    ├── components/
    ├── pages/
    ├── composables/
    └── ...
```

## API Documentation

Once the API is running, you can access the Swagger documentation at:

```
http://localhost:3000/api
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
# obill-project
