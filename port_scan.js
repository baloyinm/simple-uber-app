import net from 'net';

const host = '156.155.252.29';
const ports = [21, 22, 2222, 990, 18765];

async function checkPort(port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);
        socket.on('connect', () => {
            socket.destroy();
            resolve({ port, open: true });
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve({ port, open: false, error: 'timeout' });
        });
        socket.on('error', (err) => {
            socket.destroy();
            resolve({ port, open: false, error: err.message });
        });
        socket.connect(port, host);
    });
}

async function scan() {
    console.log(`Scanning ${host}...`);
    const results = await Promise.all(ports.map(checkPort));
    results.forEach(r => {
        console.log(`Port ${r.port}: ${r.open ? 'OPEN' : 'CLOSED'} (${r.error || ''})`);
    });
}

scan();
