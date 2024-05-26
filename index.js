const fs = require('fs');
const csv = require('csv-parser');
const FTPClient = require('ftp');
const path = require('path');

// FTP configuration
const ftpConfig = {
    host: '206.81.26.56',
    user: 'ftpuser',
    password: 'ftpuser1'
};

// Path to the directory containing the CSV files on the FTP server (root directory)
const ftpDirPath = '';

// Local path to save the downloaded CSV file
const localCsvPath = 'data.csv';

// Directory to save generated HTML files
const outputDir = 'docs';

// Read the HTML template
const template = fs.readFileSync('template.html', 'utf-8');

// Function to replace placeholders with actual data
function generateHtml(row, columns) {
    let html = template;
    columns.forEach(column => {
        const placeholder = `{{${column}}}`;
        const value = row[column];
        // Replace the placeholder with the corresponding value, handling special characters
        html = html.split(placeholder).join(value);
    });
    return html;
}

// Function to sanitize the file name
function sanitizeFileName(name) {
    return name.replace(/\./g, '').replace(/[^a-zA-Z0-9-_]/g, '');
}

// Function to create Rough Video URL
function createRoughVideoUrl(vendorStockNumber) {
    // Find the position of the first period
    const periodIndex = vendorStockNumber.indexOf('.');
    if (periodIndex === -1) {
        // return "No period found";
        return vendorStockNumber;
    }

    // Find the position of the first 'L' after the period
    const lIndex = vendorStockNumber.indexOf('L', periodIndex);
    if (lIndex === -1) {
        // return "No 'L' found after the period";
        return vendorStockNumber;
    }

    // Extract the substring from the 'L' and the next 5 characters
    const result = vendorStockNumber.substring(lIndex, lIndex + 6);

    return `https://v3602586.v360.in/vision360.html?d=${result}`;
}

// Function to fix striping 
function stripHttps(url) {
    const result = `${url.substring(8)}`;

    return result;
}

// Download the latest CSV file from the FTP server
function downloadLatestCsv(callback) {
    const client = new FTPClient();
    client.on('ready', () => {
        client.list(ftpDirPath, (err, list) => {
            if (err) throw err;
            // Find the latest CSV file
            const csvFiles = list.filter(file => file.name.endsWith('.csv'));
            if (csvFiles.length === 0) {
                console.error('No CSV files found.');
                client.end();
                return;
            }
            const latestFile = csvFiles.reduce((latest, file) => {
                return new Date(latest.date) > new Date(file.date) ? latest : file;
            });

            const latestFilePath = `${ftpDirPath}${latestFile.name}`;
            console.log(`Latest CSV file: ${latestFile.name}`);

            client.get(latestFilePath, (err, stream) => {
                if (err) throw err;
                stream.once('close', () => { client.end(); });
                stream.pipe(fs.createWriteStream(localCsvPath)).on('finish', callback);
            });
        });
    });

    client.connect(ftpConfig);
}

// Process the CSV file and generate HTML files
function processCsv() {
    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir);
    }

    const indexHtml = [];
    let rowIndex = 0;
    let columns = [];

    fs.createReadStream(localCsvPath)
        .pipe(csv())
        .on('headers', (headers) => {
            columns = headers;
        })
        .on('data', (row) => {
            // Replace Rough Video URL
            row['Rough Video'] = createRoughVideoUrl(row['VendorStockNumber']);
            // row['Certificate Url'] = stripHttps(row['Certificate Url']);
            // row['Certificate Url'] = (row['Certificate Url']);

            // Generate HTML for each row
            const html = generateHtml(row, columns);
            const fileName = sanitizeFileName(row[columns[0]]) + '.html';
            const filePath = path.join(outputDir, fileName);
            fs.writeFileSync(filePath, html);

            // Add link to the index file
            const fileUrl = `https://www.yerushalmi.online/${fileName}`;
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(fileUrl)}&size=150x150`;
            const rowData = columns.map(column => `<td>${row[column]}</td>`).join('');
            indexHtml.push(`
                <tr>
                    <td>${rowIndex + 1}</td>
                    <td><a href="${fileUrl}">${fileName}</a></td>
                    ${rowData}
                    <td><a href="${qrCodeUrl}">QR Code</a></td>
                </tr>
            `);
            rowIndex++;
        })
        .on('end', () => {
            // Generate index HTML
            const headers = columns.map(column => `<th>${column}</th>`).join('');
            const indexContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Index</title>
                </head>
                <body>
                <script>
                    const urlParams = new URLSearchParams(window.location.search);
                    const id = urlParams.get('id');
                    const redirectUrl = id.split('.').join('');
                    if (id.length > 0) window.location.href = 'https://yerushalmi.online/' + redirectUrl + '.html';
                </script>
                    <table border="1">
                        <tr>
                            <th>Index</th>
                            <th>File</th>
                            ${headers}
                            <th>QR Code</th>
                        </tr>
                        ${indexHtml.join('')}
                    </table>
                </body>
                </html>
            `;
            fs.writeFileSync(path.join(outputDir, 'index.html'), indexContent);
            console.log('HTML files and index generated successfully.');
        });
}

// Main function to execute the process
function main() {
    downloadLatestCsv(() => {
        processCsv();
    });
}

main();
