import * as ftp from "basic-ftp";

async function listFtp() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: 'dahost7.vpslocal.co.za',
            user: 'cjcutduh',
            password: 'zuY8NEXzMdhHev2VwJ',
            secure: false
        });
        const list = await client.list('/public_html/api');
        console.log("FILES IN API:");
        list.forEach(item => console.log(`${item.name} - ${item.size} bytes - ${JSON.stringify(item.permissions)}`));

        const parent = await client.list('/public_html');
        const apiDir = parent.find(i => i.name === 'api');
        console.log("API DIR METADATA:", JSON.stringify(apiDir));
    } catch (e) {
        console.error(e);
    }
    client.close();
}
listFtp();
