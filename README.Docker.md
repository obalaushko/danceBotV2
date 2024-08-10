# Docker Guide for Telegram Dance Bot

This guide provides instructions on how to build, run, and manage the Telegram Dance Bot using Docker. It also outlines the CI/CD process that automatically updates the bot on the server whenever changes are pushed to the `main` branch.

## Prerequisites

Before you begin, ensure that you have the following installed:

-   Docker: [Install Docker](https://docs.docker.com/get-docker/)
-   Docker Compose: [Install Docker Compose](https://docs.docker.com/compose/install/)
-   Git: [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

## Building the Docker Image

To build the Docker image locally, run the following command from the root directory of the project:

```bash
docker build -t your-dockerhub-username/telegram-dance-bot:latest .
```
