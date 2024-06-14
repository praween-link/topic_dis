const express = require('express');
const http = require('http');
const router = require('./routes/routes');
const viewRouter = require('./routes/admin_routes');
const errors = require('./core/error_handler');
const db = require('./config');
const cors = require('cors');
const path = require('path');

const SocketIO = require('./socket/socket');

const app = express();
const port = 5018;

const bodyparser = require('body-parser');

app.use(bodyparser.json());

// parse some custom thing into a Buffer
app.use(bodyparser.raw({ type: 'application/vnd.custom-type' }));

// parse an HTML body into a string
app.use(bodyparser.text({ type: 'text/html' }));
// app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// Uploaded Files
app.use('/profile', express.static('./uploads/images/profile'));

app.use(cors());
// Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));
app.use(router);
app.use(viewRouter);

app.use(errors.errorHeandler);

const server = http.createServer(app);
SocketIO.init(server);
server.listen(port, () => {
    console.log("App is listening on port: " + port + "!");
})

/**
 * Packages/Modules :-
 * 1. Express Js (Franework Based on NodeJs)
 * 2. Mongoose (object Data Modeling (ODM) library)
 * 3. EJS  (Embedded JavaScript Templating Engin)
 * 4. Multer (Image uploading)
 * 5. Dotenv (Environment Variables)
 * 6. Nodemone (Monitoring Server)
 * 
 * Frontend Library :-
 * 1. Bootstrap 5 (Designing)
 * 2. DataTable (Pagination, Sorting etc.)
 * 3. Fontawesome (Icons)
 */

