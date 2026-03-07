import * as ftp from "basic-ftp";

async function check() {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    try {
        await client.access({
            host: 'dahost7.vpslocal.co.za',
            user: 'cjcutduh',
            password: 'zuY8NEXzMdhHev2VwJ',
            secure: false
        });

        const root = await client.list('/');
        console.log("Root directories:", root.filter(d => d.type === 2).map(f => f.name).join(', '));

        try {
            const pub = await client.list('/public_html');
            console.log("\n/public_html contains:");
            pub.forEach(f => console.log(f.name + (f.type === 2 ? '/' : '')));
        } catch (e) {
            console.log("No /public_html");
        }

        try {
            const dom = await client.list('/domains/omholdings.co.za/public_html');
            console.log("\n/domains/omholdings.co.za/public_html contains:");
            dom.forEach(f => console.log(f.name + (f.type === 2 ? '/' : '')));
        } catch (e) {
            console.log("No /domains/omholdings.co.za/public_html");
        }
    } catch (err) {
        console.error(err);
    }
    client.close();
}
check();
