//dot env config
require('dotenv').config();

const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const app = express();
const PORT = process.env.PORT || 3000;

//EJS
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//Bodyparser
app.use(bodyParser.urlencoded({ extended: false }));

//method-override
app.use(methodOverride('_method'));

// parse application/json
app.use(bodyParser.json());

//Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//Connect flash
app.use(flash());

//Global variables
app.use((req, res, next) => {
    
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', require('./routes/index'));

const server = app.listen(PORT, console.log(`Server started on port ${PORT}`));
