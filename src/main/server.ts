const express = require('express')
const https = require('https');
const fs = require('fs');
const { createCA, createCert } = require('mkcert');
const os = require('os');

let server: any; // 用于存储服务器实例

function getLocalIPAddresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];

    for (const interfaceName in interfaces) {
        const networkInterface = interfaces[interfaceName];
        for (const network of networkInterface) {
            // 只获取IPv4地址，并排除loopback地址
            if (network.family === 'IPv4' && !network.internal) {
                addresses.push(network.address);
            }
        }
    }

    return addresses;
}


// Generate CA
const generateCA = async () => {
    const ca = await createCA({
        organization: 'plugins',
        countryCode: 'NP',
        state: 'mix',
        locality: 'lab',
        validity: 365,
    });
    // fs.writeFileSync('ca.key', ca.key);
    // fs.writeFileSync('ca.crt', ca.cert);
    return {
        key: ca.key, crt: ca.cert
    }
};

// Generate Server Certificate
const generateServerCert = async (caKey: string, caCert: string) => {
    // const caKey = fs.readFileSync('ca.key');
    // const caCert = fs.readFileSync('ca.crt');

    const cert = await createCert({
        ca: { key: caKey, cert: caCert },
        domains: ['127.0.0.1', 'localhost'],
        validity: 365,
    });
    // fs.writeFileSync('server.key', cert.key);
    // fs.writeFileSync('server.crt', cert.cert);
    return {
        key: cert.key, crt: cert.cert
    }
};


const start = async (port = 3000, path: string, html: string) => {
    // Generate CA and Server Certificate
    const { key, crt } = await generateCA()
    const { key: serverKey, crt: serverCrt } = await generateServerCert(key, crt);

    // HTTPS Server Configuration
    const options = {
        key: serverKey,
        cert: serverCrt,
    };

    const app = express()
    app.use((req: any, res: any, next: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        next()
    })

    app.get('/test', function (req: any, res: any) {
        res.send('Hello World')
    })

    // 渲染HTML页面的路由示例
    app.get(`/${path || ''}`, (req: any, res: any) => {
        res.send(html||'');
    });


    return new Promise((res, rej) => {
        server = https.createServer(options, app).listen(port, '0.0.0.0', () => {
            const host = getLocalIPAddresses();
            const port = server.address().port;
            console.log('Web服务已启动', server);
            console.log(`访问地址: https://${host}:${port}`);
            res(`https://${host}:${port}`);
        });
    })

}

const stop = () => {
    if (server) {
        server.close(() => {
            console.log('Web服务已关闭')
            server = null;
        })
    }
}

export default { start, stop }

