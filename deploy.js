import * as ftp from "basic-ftp";

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

        let targetDir = 'public_html';

        const list = await client.list();
        const domainsDir = list.find(d => d.name === 'domains');

        if (domainsDir) {
            await client.cd('domains');
            const domainsList = await client.list();
            if (domainsList.find(d => d.name === 'sibanye.omholdings.co.za')) {
                targetDir = 'domains/sibanye.omholdings.co.za/public_html';
            } else if (domainsList.find(d => d.name === 'omholdings.co.za')) {
                await client.cd('omholdings.co.za/public_html');
                const pubList = await client.list();
                if (pubList.find(d => d.name === 'sibanye')) {
                    targetDir = 'domains/omholdings.co.za/public_html/sibanye';
                } else {
                    targetDir = 'domains/omholdings.co.za/public_html';
                }
                await client.cd('../../..');
            } else {
                await client.cd('..');
            }
        }

        console.log(`Target directory chosen: ${targetDir}`);

        // Ensure root and api dir
        await client.cd('/');
        await client.ensureDir(`${targetDir}/api`);
        await client.cd('/');

        console.log('Uploading dist directory...');
        await client.uploadFromDir('dist', targetDir);

        console.log('Uploading api directory...');
        await client.uploadFromDir('api', `${targetDir}/api`);

        console.log('Deployment complete!');
    } catch (err) {
        console.error('Deployment failed:', err);
    }
    client.close();
}

deploy();
