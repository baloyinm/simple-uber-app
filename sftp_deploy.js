import Client from 'ssh2-sftp-client';
import fs from 'fs';
import path from 'path';

async function deploy() {
    const sftp = new Client();
    const config = {
        host: '156.155.252.29',
        port: 22,
        username: 'cjcutduh',
        password: 'zuY8NEXzMdhHev2VwJ'
    };

    try {
        console.log('Connecting to SFTP server...');
        await sftp.connect(config);
        console.log('Connected!');

        const remoteDir = '/domains/omholdings.co.za/public_html';
        const distPath = path.resolve('dist');
        const apiPath = path.resolve('api');

        console.log('Uploading dist contents...');
        await sftp.uploadDir(distPath, remoteDir);

        console.log('Uploading api contents (excluding config.php for safety)...');
        const apiFiles = fs.readdirSync(apiPath);
        for (const file of apiFiles) {
            if (file === 'config.php') continue;
            const localFile = path.join(apiPath, file);
            const remoteFile = `${remoteDir}/api/${file}`;
            if (fs.statSync(localFile).isFile()) {
                await sftp.put(localFile, remoteFile);
                console.log(`Uploaded ${file}`);
            }
        }

        console.log('Deployment successful!');
    } catch (err) {
        console.error('Deployment failed:', err.message);
    } finally {
        await sftp.end();
    }
}

deploy();
