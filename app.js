const http = require('http');
const mysql = require('mysql2');

// Simple database config
// Read configration from environment variables
// These are set in server. Not in code files
const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME    
};

const PORT = process.env.PORT || 3000;

// Create server
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
                <p>Server is running securely with environment variables</p>
                <a href="/db-test">Test Database Connection</a>
            </body>
            </html>
            `);
    }

    //Database test page
    else if (req.url === 'db-test') {
        // Check if config is missing
        if (!dbConfig.user || !dbConfig.password) {
            res.writeHead(500, {'Content-Type': 'text/html'});
            res.end(`
                <h2 style="color:red">❌ Configuration Error</h2>
                <p>Database credentials not set in environment variables.</p>
                <p>Please configure DB_USER and DB_PASSWORD in Plesk.</p>
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

            connection.query(`SELECT NOW() as current_time, DATABASE() as db_name`, function(err, result) {
                if (err) {
                    res.end(`<h2 style="color:red">Query Error: ' + err.message + '</h2><a href="/">Back</a>`);
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(`
                        <h2 style="color:green">✅ Database Connected Successfully!</h2>
                        <p><strong>Server Time:</strong> ${results[0].current_time}</p>
                        <p><strong>Database:</strong> ${results[0].db_name}</p>
                        <p><strong>Host:</strong> ${dbConfig.host}:${dbConfig.port}</p>
                        <p><strong>User:</strong> ${dbConfig.user}</p>
                        <a href="/">← Back to Home</a>
                    `);
                }

                connection.end();
            });
            
        });
    }

    // Debug page - show what variables are set (but hides passwords!)
    else if (req.url === '/debug-env') {
        // IMPORTANT: never show actual password!
        const maskedConfig = {
            host: dbConfig.host || 'NOT SET', 
            port: dbConfig.port,
            user: dbConfig.user, 
            password: dbConfig.password ? '*************' : 'NOT SET',
            database: dbConfig.database || 'NOT SET'
        };

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`
            <h2>Environment Configuration</h2>
            <pre>${JSON.stringify(maskedConfig, null, 2)}</pre>
            <p><a href="/">Back</a></p>
            `);
    }
    else {
        res.writeHead(404);
        res.end(`<h1>404 - Not Found</h1><a href="/">Home</a>`);
    }
})

// Start server
server.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log("server started");
    console.log('='.repeat(50));
    console.log(`port: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`DB User: ${dbConfig.user ? 'SET ✓' : 'MISSING ✗'}`);
    console.log(`DB Password: ${dbConfig.password ? 'SET ✓' : 'MISSING ✗'}`);
    console.log(`DB Name: ${dbConfig.database ? 'SET ✓' : 'MISSING ✗'}`);
    console.log('=' .repeat(50));
})