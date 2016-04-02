var http = require('http');
var express = require('express');
var routes = require('./routes');
var mongoose = require('mongoose');
var dbUrl = 'mongodb://localhost/quiz';
var db = mongoose.connect(dbUrl);
var path = require('path');
var fs = require('fs');
var bcrypt = require('bcrypt');
var expressLayouts = require('express-ejs-layouts');
//var db = require('./model/db');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var app = express();
// all environments
var engine = require('ejs-locals');
app.engine('ejs', engine);
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');


app.use(expressLayouts);
app.use(session({ resave: true,
  saveUninitialized: true,
  secret: 'uwotm8',
  store: new MongoStore({
    url: dbUrl,
    ttl: 14 * 24 * 60 * 60
  })
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.locals.title = "Fitness manager";

app.get('/', routes.index);


// dynamically include routes (Controller)
fs.readdirSync('./controllers').forEach(function (file) {
  if(file.substr(-3) == '.js') {
      route = require('./controllers/' + file);
      route.controller(app);
  }
});


// error handling middleware should be loaded after the loading the routes
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.get('*',function(req,res,next){
  res.render('404page',{
      title : 'Oops! No page found',
      layout : 'layout'
  })
});

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});