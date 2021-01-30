const express = require('express');
const app = express();
const bodyparser = require('body-parser');
require('dotenv').config()
port = process.env.PORT || 8000;
const mysql = require('mysql');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const MySQLStore = require('express-mysql-session')(session);


require('./config/passport-config')(passport); //Passport Login location

app.use(bodyparser.urlencoded({
    extended : true
}));
app.use(bodyparser.json()); //Body Parser for req.body

app.set('view engine', 'ejs'); //EJS Configuration
app.use( express.static( "public" ) );


//============Database Connection==============



db = mysql.createPool({
    connectionLimit : 20,
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'net',
    multipleStatements : true
});


var sessionStore = new MySQLStore({
    createDatabaseTable: true,
    endConnectionOnClose: true,
    connectionLimit: 20,
    checkExpirationInterval: 1000*60*10,
    expiration: 1000*60*60,
    clearExpired: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, db);


app.set('trust proxy', 1)
app.use(session({
    secret: 'secreter',
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
    // rolling: true,
    cookie: {
        maxAge: 1000*60*60,
        //PRODUCTION
        // secure: true,
        // sameSite: 'none',
        // httpOnly: false,

    }
}));




//==============================================


//=================Passport Login Configuration========





app.use(passport.initialize());
app.use(passport.session());

app.use(flash());


app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//=====================================================

PaytmConfig = {
	mid: "MvRloZ65975295905696",
	key: "F5PAgH3S9@Qsx51W",
	website: "WEBSTAGING"
}




//ROUTES



app.use('/adminPanel', require('./routes/admin'));
app.use('/workerPanel', require('./routes/workerPanel'));
app.use('/payments', require('./routes/payments'));
app.use('/customerPanel', require('./routes/customer'));
app.use('/adminLogin', require('./routes/adminLogin'));
app.use('/', require('./routes/customerLogin'));

//Server Connection
app.listen(port, ()=>{
    console.log("Server Connected");
});