# Dance Bot - Telegram Subscription Manager

This is a **Telegram bot** built with [grammY](https://grammy.dev/), **TypeScript**, and **MongoDB** using **mongoose** as the ORM. The bot is designed to manage subscriptions for students, allowing teachers (administrators) to track who attends classes, when payments were made, and students can monitor their subscription status.

## Features

-   Admin panel for teachers to manage and track student attendance and payments.
-   Students can view their subscription status, class attendance, and remaining lessons.
-   Built with **grammY** framework for handling Telegram API interactions.
-   MongoDB is used for data storage with **mongoose** as the ORM.

## Prerequisites

To run this project, you need to have the following installed on your machine:

-   **Node.js** version 20.9.0 or higher.
-   **MongoDB** instance for database storage.

## Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/yourusername/dance-bot-grammy.git
    cd dance-bot-grammy
    ```
2. Install dependencies:

    ```bash
    npm install
    ```

3. Copy the example environment file and update the variables with your own values:

    ```bash
    cp .env.example .env
    ```

4. Build the TypeScript project:
    ```bash
    npm run build
    ```

## Running the Project

To run the project, there are two main environments:

### Development

For running the bot in a development environment, use the following command:

```bash
npm run dev
```

### Production

To start the bot in production mode, build the project first and then run:

```bash
npm run build
npm start
```

## Docker Setup

You can also run the project using Docker. Make sure you have Docker installed on your machine.

1. Build the Docker image:

    ```bash
    docker build -t dance-bot-grammy .
    ```

2. Run the Docker container:
    ```bash
    docker run --env-file .env -p 3000:3000 dance-bot-grammy
    ```

## Scripts

Here are some useful npm scripts available for this project:

-   **Start the bot:** `npm start`
-   **Development mode:** `npm run dev`
-   **Build the project:** `npm run build`
-   **Run tests:** `npm run test`
-   **Check code formatting:** `npm run format:check`
-   **Fix code formatting:** `npm run format:write`
-   **Check linting:** `npm run lint:check`
-   **Fix linting issues:** `npm run lint:fix`

## Environment Variables

The project uses the following environment variables:

| Variable    | Description                           |
| ----------- | ------------------------------------- |
| `BOT_TOKEN` | Telegram bot token from BotFather     |
| `MONGO_URI` | MongoDB connection string             |
| `LOG_LEVEL` | Set the log level (info, debug, etc.) |

For a complete list of environment variables, refer to the `.env.example` file.

## License

This project is licensed under the ISC License.
