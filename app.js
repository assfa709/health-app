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
                <h1>Health Analytics</h1>
                <p>Welcome to Health Analytics!</p>
                <a href="https://abz.com.et">About Me</a>
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

    // Visits API/ROUTS (view all visits)
    else if (req.url === '/visits') {
        const connection = mysql.createConnection(dbConfig);
        connection.connect(function(err) {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/html'});
                res.end('<h2 style="color: red">Database Error</h2>');
                return;
            }

            // JOINS query to get patient names with visits
            const sql = `
                SELECT v.*, p.first_name, p.last_name
                FROM visits v
                JOIN patients p ON v.patient_id = p.id
                ORDER BY v.visit_date DESC
                LIMIT 20
            `;

            connection.query(sql, function(err, results) {
                if (err) {
                    res.end(`<h2 style="color: red">Error: ${err.message}</h2><a href="/">Back</a>`);
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    let html = `
                        <h1>Patient Visits</h1>
                        <a href="/">Home</a> | <a href="/patients">Patients</a> | <a href="/add-visit">Add Visit</a>
                        <table border="1" cellpadding="8" style="margin-top: 20px; border-collapse: collapse;">
                        <tr style="background: #333; color: white;">
                            <th>ID</th><th>Patient</th><th>Date</th><th>Type</th><th>Chief Complaint</th><th>Diagnosis</th>
                        </tr>
                        `;

                        for (let i = 0; i < results.length; i++) {
                            html += `
                                <tr>
                                    <td>${results[i].id}</td>
                                    <td>${results[i].first_name} ${results[i].last_name}</td>
                                    <td>${results[i].visit_date}</td>
                                    <td>${results[i].visit_type}</td>
                                    <td>${results[i].chief_complaint}</td>
                                    <td>${results[i].diagnosis }</td>
                                </tr>
                                `;
                        }

                        html += `</table><br/><a href="/">Back to Home</a>`;
                        res.end(html);
                }

                connection.end();
            });
        });
    }

    // patients API/Rout (view all patients)
    else if (req.url === '/patients') {
        const connection = mysql.createConnection(dbConfig);
        
        connection.connect(function(err) {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/html'});
                res.end('<h2 style="color: red">Database Error</h2>');
                return;
            }

            connection.query('SELECT * FROM patients ORDER BY created_at DESC', function(err, results) {
                if (err) {
                    res.end(`<h2 style="color: red">Error: ${err.message}</h2>`);
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    let html = `
                        <h1>Patient List</h1>
                        <a href="/">Home</a> | <a href="/visits">Visits</a> | <a href="add-patient">Add Patient</a>
                        <table border="1" cellpadding="12" style="margin-top: 20px; border-collapse: collapse">
                            <tr style="background: #030c5f; color: white;">
                                <th>ID</th>
                                <th>Name</th>
                                <th>DOB</th>
                                <th>Gender</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Created</th>
                            </tr>
                    `;

                    for (let i = 0; i < results.length; i++) {
                        const p = results[i];
                        html += `
                            <tr>
                                <td>${p.id}</td>
                                <td>${p.first_name} ${p.last_name}</td>
                                <td>${p.date_of_birth}</td>
                                <td>${p.gender}</td>
                                <td>${p.phone}</td>
                                <td>${p.email}</td>
                                <td>${p.created_at}</td>
                            </tr>
                        `;
                    }

                    html += '</table> <br> <a href="/">Back</a>'
                    res.end(html)
                }

                connection.end();
            });
        });
    }

    // Show Add patient form API/Route
    else if (req.url === '/app-patient' && req.method === 'GET') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Add Patient</title>
                <style>
                    body {font-family: Arial; padding: 50px;}
                    .container {max-width: 500px; margin: 0 auto;}
                    .form-group {margin-bottom: 15px;}
                    label {display: block; margin-bottom: 5px; font-weight: bold;}
                    input, select {width: 100%; padding: 8px; box-sizing: border-box;}
                    button {background: blue; color: white; padding: 10px 20px; border: none; cursor: pointer;}
                    .error {color: red;}
                </style>
            <body>
                <div class="container">
                    <h1>Add New Patient</h1>
                    <form method="POST" action="/add-patient">
                        <div class="form-group">
                            <label>First Name * </label>
                            <input type="text" name="first_name" required>
                        </div>

                        <div class="form-group">
                        <label>Last Name *</label>
                        <input type="text" name="last_name" required>
                        </div>
                        <div class="form-group">
                            <label>Date of Birth</label>
                            <input type="date" name="date_of_birth">
                        </div>
                        <div class="form-group">
                            <label>Gender</label>
                            <select name="gender">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel" name="phone">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email">
                        </div>
                        <div class="form-group">
                            <label>Address</label>
                            <textarea name="address" rows="3"></textarea>
                        </div>
                        <button type="submit">Save Patient</button>
                        <a href="/patients" style="margin-left: 10px;">Cancel</a>
                    </form>
                </div>
            </body>
            </head>
            </html>
            `);
    }

    // Process Add Patient form(POST)
    else if (req.url === '/add-patient' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            // Parse form data (url-encoded format)
            const params = new URLSearchParams(body);
            const first_name = params.get('first_name');
            const last_name = params.get('last_name');
            const date_of_birth = params.get('date_of_birth') || null;
            const gender = params.get('gender');
            const phone = params.get('phone') || null;
            const email = params.get('email') || null;
            const address = params.get('address') || null;

            // Validate required fields
            if (!first_name || !last_name) {
                res.writeHead(400, {'Content-Type': 'text/html'});
                res.end('<h2 style="color:red">First name and last name are required</h2><a href="/add-patient">Try Again</a>');
                return;
            }

             const connection = mysql.createConnection(dbConfig);
        
            connection.connect(function(err) {
                if (err) {
                    res.end('<h2 style="color:red">Database Error</h2><a href="/add-patient">Back</a>');
                    return;
                }

                const sql = `
                    INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email, address)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                connection.query(sql, [first_name, last_name, date_of_birth, gender, phone, email, address], function(err, result) {
                    if (err) {
                        res.end(`<h2 style="color:red">Error: ${err.message}</h2><a href="/add-patient">Back</a>`);
                    } else {
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.end(`
                            <h2 style="color:green">✅ Patient Added Successfully!</h2>
                            <p>${first_name} ${last_name} has been added to the database.</p>
                            <a href="/patients">View All Patients</a> | 
                            <a href="/add-patient">Add Another</a> |
                            <a href="/">Home</a>
                        `);
                    }
                    connection.end();
                });
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