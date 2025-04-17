# Greenhouse Backend v2

This is the backend for the Greenhouse IoT project. It is built using **Node.js** and provides APIs to manage and monitor greenhouse operations.

## Prerequisites

- **Node.js** (v14 or higher recommended)
- **npm** (Node Package Manager)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/greenhouse_back_v2.git
    cd greenhouse_back_v2
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

## Usage

To start the server, run:
```bash
npm start
```

The server will start and listen on the configured port (default: `3000`).

## Scripts

- **`npm start`**: Starts the application in production mode.
- **`.envexample`**: Contains environment variable examples. To use `nodemon`, set the `DEVMODE` variable to `true` in your `.env` file:
    ```
    DEVMODE=true
    ```
- **`npm run dev`**: Starts the application in development mode with live reloading (requires `nodemon` and a properly configured `.env` file).


## Features

- RESTful API for greenhouse management
- Integration with IoT devices
- Database support (MySQL with MAMP)

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any inquiries, please contact [santiago.estrada6@eia.edu.co].