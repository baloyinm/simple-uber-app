import * as ftp from "basic-ftp";
import fs from "fs";

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            host: 'dahost7.vpslocal.co.za',
            user: 'cjcutduh',
            password: 'zuY8NEXzMdhHev2VwJ',
            secure: false
        });

        console.log('Connected to FTP Server');

        const targetDir = 'public_html';
        console.log(`Target directory chosen: /${targetDir}`);

        // Navigate to target
        await client.cd('/' + targetDir);

        console.log('Removing old frontend files...');
        try {
            await client.remove("index.html");
            await client.remove("vite.svg");
            // Do not remove api/ directory, to preserve config.php
        } catch (e) {
            // ignore
        }

        try {
            await client.removeDir("assets");
        } catch (e) {
            // ignore
        }

        // Re-ensure api dir
        await client.ensureDir("api");

        console.log('Uploading dist directory...');
        await client.uploadFromDir('dist', '/' + targetDir);

        console.log('Uploading api directory (excluding config.php)...');
        const apiFiles = fs.readdirSync('api');
        for (const file of apiFiles) {
            if (file === 'config.php') {
                console.log('Skipping config.php to preserve live credentials');
                continue;
            }
            if (fs.statSync(`api/${file}`).isFile()) {
                await client.uploadFrom(`api/${file}`, `/${targetDir}/api/${file}`);
            }
        }

        console.log('Deployment complete!');
    } catch (err) {
        console.error('Deployment failed:', err);
    }
    client.close();
}

deploy();
