# CSV to HTML Generator for Diamonds inventory info

This Node.js project downloads the latest CSV file from an FTP server, processes the CSV data to generate separate HTML files for each row using a template, and creates an index HTML file with links to each generated file and a QR code generation link.

## Features

- Connects to an FTP server and retrieves the latest CSV file.
- Reads the CSV file and dynamically processes its columns.
- Generates separate HTML files for each row in the CSV file using a predefined template.
- Creates a central index HTML file with:
  - Links to each generated HTML file.
  - The first three columns from the CSV.
  - QR code generation links.

## Prerequisites

- Node.js (v12.x or later)
- npm (v6.x or later)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/csv-to-html.git
    cd csv-to-html
    ```

2. Install the necessary dependencies:

    ```bash
    npm install
    ```

## Configuration

1. Update the FTP configuration in `index.js` with your FTP server details:

    ```javascript
    const ftpConfig = {
        host: '206.81.26.56',
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

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

Boutique Tech Studios LTD

