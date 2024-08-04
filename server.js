const express = require('express');
const html_routes = require('./routes/html-routes');
const api_routes = require('./routes/api-routes.js');
const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));
app.use(api_routes);
app.use(html_routes);

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});
