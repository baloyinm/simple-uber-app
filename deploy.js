import * as ftp from "basic-ftp";
import fs from "fs";

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            host: '156.155.252.29',
            user: 'cjcutduh',
            password: 'zuY8NEXzMdhHev2VwJ',
            secure: false
        });

        console.log('Connected to FTP Server');

        const targetDir = '/domains/omholdings.co.za/public_html';
        console.log(`Target directory chosen: ${targetDir}`);

        // Navigate to target
        await client.cd(targetDir);


        console.log('Removing old frontend files...');
        try {
            await client.remove("index.html");
            await client.remove("vite.svg");
            // Do not remove api/ directory, to preserve config.php
        } catch (e) {
            // ignore
        }

        console.log('Uploading new frontend files...');
        await client.uploadFromDir('dist', targetDir);

        console.log('Uploading API files (skipping config.php)...');
        await client.ensureDir(targetDir + '/api');
        const apiFiles = fs.readdirSync('api');
        for (const file of apiFiles) {
            if (file === 'config.php') continue;
            await client.uploadFrom(`api/${file}`, targetDir + '/api/' + file);
            console.log(`Uploaded api/${file}`);
        }


        console.log('Deployment complete!');
    } catch (err) {
        console.error('Deployment failed:', err);
    }
    client.close();
}

deploy();
