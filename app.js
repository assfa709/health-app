const http = require('http');
const mysql = require('mysql2');

const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME    
};

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    // Home page
    if (req.url === '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>Health App</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1>🏥 Health Analytics</h1>
                <p>Server is running securely!</p>
                <a href="/db-test">Test Database Connection</a>
            </body>
            </html>
        `);
    }

    // Database test page - FIXED SQL QUERY
    else if (req.url === '/db-test') {
        if (!dbConfig.user || !dbConfig.password) {
            res.writeHead(500, {'Content-Type': 'text/html'});
            res.end(`
                <h2 style="color:red">❌ Configuration Error</h2>
                <p>Database credentials not set.</p>
                <a href="/">Back</a>
            `);
            return;
        }

        const connection = mysql.createConnection(dbConfig);
        
        connection.connect(function(err) {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/html'});
                res.end(`
                    <h2 style="color:red">❌ Connection Failed</h2>
                    <p>Error: ${err.message}</p>
                    <p>Host: ${dbConfig.host}:${dbConfig.port}</p>
                    <p>User: ${dbConfig.user}</p>
                    <a href="/">Back</a>
                `);
                return;
            }

            // FIXED: Removed 'as current_time' - simpler query
            connection.query('SELECT NOW() as server_time, DATABASE() as db_name', function(err, results) {
                if (err) {
                    res.end(`<h2 style="color:red">❌ Query Error: ${err.message}</h2><a href="/">Back</a>`);
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(`
                        <h2 style="color:green">✅ Database Connected Successfully!</h2>
                        <p><strong>Server Time:</strong> ${results[0].server_time}</p>
                        <p><strong>Database Name:</strong> ${results[0].db_name}</p>
                        <p><strong>Host:</strong> ${dbConfig.host}:${dbConfig.port}</p>
                        <p><strong>User:</strong> ${dbConfig.user}</p>
                        <a href="/">← Back to Home</a>
                    `);
                }
                connection.end();
            });
        });
    }
    
    else {
        res.writeHead(404);
        res.end(`<h1>404 - Not Found</h1><a href="/">Home</a>`);
    }
});

server.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log("✅ Health Analytics Server Started");
    console.log('='.repeat(50));
    console.log(`Port: ${PORT}`);
    console.log(`Database: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`DB User: ${dbConfig.user ? 'SET ✓' : 'MISSING ✗'}`);
    console.log(`DB Password: ${dbConfig.password ? 'SET ✓' : 'MISSING ✗'}`);
    console.log(`DB Name: ${dbConfig.database ? 'SET ✓' : 'MISSING ✗'}`);
    console.log('='.repeat(50));
});