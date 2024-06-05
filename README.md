# CSV to HTML Generator for Diamonds inventory info
Latest version includes an react control panel to handle all operations.
This Node.js project downloads the latest CSV file from an FTP server, processes the CSV data to generate separate HTML files for each row using a template, and creates an index HTML file with links to each generated file and a QR code generation link.

## Features

- Connects to an FTP server and retrieves the latest CSV file.
- Upload CSV to FTP
- Reads the CSV file and dynamically processes its columns.
- Generates separate HTML files for each row in the CSV file using a predefined template.
- Creates a central index HTML file with:
  - Links to each generated HTML file.
  - The first three columns from the CSV.
  - QR code generation links.
- Push/Upload the generated files to gitHub pages.

## Prerequisites

- Node.js (v12.x or later)
- npm (v6.x or later)

## Installation

1. Clone the repository:

    ```bash
    git clone git@github.com:BotechStudio/yerushalmi.git
    cd yerushalmi
    ```

2. Install the necessary dependencies:

    ```bash
    npm install
    ```

## Configuration

1. Update the FTP configuration in `index.js` with your FTP server details:

    ```javascript
    const ftpConfig = {
        host: '206.81.26.56', // ftp.yerushalmi.online 
        user: 'ftpuser',
        password: 'ftpuser1'
    };
    ```

2. Ensure that the path to your CSV files on the FTP server is set correctly. The current configuration assumes the CSV files are in the root directory:

    ```javascript
    const ftpDirPath = '';
    ```

## Usage

1. Place your HTML template in a file named `template.html` in the project directory. Ensure it contains placeholders for the CSV columns, e.g., `{{Column1}}`.

2. Run the script:

    ```bash
    node index.js
    ```

3. The script will:
   - Download the latest CSV file from the FTP server.
   - Process the CSV file and generate separate HTML files for each row.
   - Create an index HTML file with links to each generated file and QR code generation links.

## License

See the https://themeforest.net/licenses/terms/regular (LICENSE) file for details.

Boutique Tech Studios LTD

eThis project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
