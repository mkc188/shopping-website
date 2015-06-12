require('express-namespace'); // must come before express()
var config = require('./config.js');

// var util = require('util');
var express = require('express');
var epilogue = require('epilogue');
var express_enforces_ssl = require('express-enforces-ssl');
var expressValidator = require('express-validator');
var bcrypt = require('bcrypt');
var session = require('express-session');
var csrf = require('csurf');
var csrfProtection = csrf();
// var RedisStore = require('connect-redis')(session);
var _ = require('underscore');
var sessionConfig = {
  sessionSecret: config.sessionSecret,
  cookieSecret: config.cookieSecret,
  cookieMaxAge: (1000 * 60 * 60 * 24 * 90)
};
var helmet = require('helmet');
var app = express();
var port = process.env.PORT || 5000;

var Sequelize = require('sequelize');
var sequelize = new Sequelize('shop52', config.dbUsername, config.dbPassword, {
  dialect: "mysql", // or 'sqlite', 'postgres', 'mariadb'
  host: config.dbHost,
  port: 3306, // or 5432 (for postgres)
})

var paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': config.paypalID,
  'client_secret': config.paypalSecret
});

sequelize
  .authenticate()
  .complete(function (err) {
    if (!!err) {
      console.log('Unable to connect to the database:', err);
    } else {
      console.log('Connection has been established successfully.');
    }
  });


var Payment = sequelize.define('payment', {
  userid: {
    type: Sequelize.STRING
  },
  paymentId: {
    type: Sequelize.STRING,
    unique: true
  },
  state: Sequelize.STRING
}, {
  tableName: 'payments'
});
var Product = sequelize.define('product', {
  catid: Sequelize.INTEGER,
  name: Sequelize.STRING,
  price: Sequelize.DECIMAL(10, 2),
  description: Sequelize.STRING,
  photo: Sequelize.STRING
}, {
  tableName: 'products', // this will define the table's name
  timestamps: false // this will deactivate the timestamp columns
});

var Category = sequelize.define('category', {
  name: Sequelize.STRING
}, {
  tableName: 'categories', // this will define the table's name
  timestamps: false // this will deactivate the timestamp columns
});
Category.hasMany(Product, {
  foreignKey: 'catid'
});

var User = sequelize.define('user', {
  username: {
    type: Sequelize.STRING,
    unique: true
  },
  password: Sequelize.STRING,
  auth: {
    type: Sequelize.STRING,
    unique: true
  },
  admin: Sequelize.BOOLEAN
}, {
  tableName: 'users', // this will define the table's name
  timestamps: false // this will deactivate the timestamp columns
});

sequelize
  .sync()
  .complete(function (err) {
    if (!!err) {
      console.log('An error occurred while creating the table:', err);
    } else {
      console.log('It worked!');
    }
  });

app.enable('trust proxy');
app.use(express_enforces_ssl());
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'"],
  imgSrc: ["'self'", 'https://elasticbeanstalk-ap-southeast-1-812616711981.s3-ap-southeast-1.amazonaws.com', 'data:'],
  connectSrc: ["'self'"],
  fontSrc: ["'self'"],
  objectSrc: ["'self'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'self'"],
  sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin'],
  reportOnly: false, // set to true if you only want to report errors
  setAllHeaders: false, // set to true if you want to set all headers
  disableAndroid: false, // set to true if you want to disable Android (browsers can vary and be buggy)
  safari5: false // set to true if you want to force buggy CSP in Safari 5
}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser(sessionConfig.cookieSecret));
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    return {
      param: param,
      error: msg,
      value: value
    };
  }
}));
app.use(session({
  // store: new RedisStore({
  //   host: 'ierg4210.wjkcoi.0001.apse1.cache.amazonaws.com',
  //   port: 6379,
  //   prefix: 'sess'
  // }),
  secret: sessionConfig.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: (1000 * 60 * 60 * 24 * 3)
  }
}));

// config the uploader
var options = {
  tmpDir: '/tmp',
  uploadUrl: '/uploaded/files/',
  maxPostSize: 11000000000, // 11 GB
  minFileSize: 1,
  maxFileSize: 10000000000, // 10 GB
  acceptFileTypes: /.+/i,
  // Files not matched by this regular expression force a download dialog,
  // to prevent executing any scripts in the context of the service domain:
  inlineFileTypes: /\.(gif|jpe?g|png)/i,
  imageTypes: /\.(gif|jpe?g|png)/i,
  copyImgAsThumb: true, // required
  imageVersions: {
    maxWidth: 200,
    maxHeight: 200
  },
  accessControl: {
    allowOrigin: '*',
    allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
    allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
  },
  storage: {
    type: 'aws',
    aws: {
      accessKeyId: config.s3ID,
      secretAccessKey: config.s3Secret,
      region: 'ap-southeast-1', //make sure you know the region, else leave this option out
      bucketName: 'elasticbeanstalk-ap-southeast-1-812616711981'
    }
  }
};
var uploader = require('blueimp-file-upload-expressjs')(options);
app.post('/upload', function (req, res) {
  uploader.post(req, res, function (obj, redirect, error) {
    if (!error) {
      res.send(JSON.stringify(obj));
    }
  });
});

app.use(express.logger())
app.use(express.bodyParser());
app.use(express.methodOverride());
epilogue.initialize({
  app: app,
  sequelize: sequelize
});
var paymentResource = epilogue.resource({
  model: Payment,
  endpoints: ['/api/payments', '/api/payments/:id']
});
var productResource = epilogue.resource({
  model: Product,
  endpoints: ['/api/products', '/api/products/:id']
});
var categoryResource = epilogue.resource({
  model: Category,
  endpoints: ['/api/categories', '/api/categories/:id']
});

app.set('view engine', 'html');
app.set('views', 'dist');
app.engine('html', require('hbs').__express);
app.use(express.static('dist/js'));
app.use(express.static('dist/css'));
app.use(express.static('dist/fonts'));
app.use(express.static('dist/img'));
app.use(app.router);

app.use(function(req, res, next) {
  if (req.url != '/' && /^((?!(api|foo|checkout|upload)).)*$/.test(req.url)) {
    var newUrl = req.protocol + '://' + req.get('Host') + '#' + req.url.substring(1);
    return res.redirect(newUrl);
  } else {
    next();
  }
});
app.get("/", csrfProtection, function (req, res) {
  res.render('index', {
    csrfToken: req.csrfToken()
  });
});

app.get("/foo/auth", function (req, res) {
  User.find({
    where: {
      auth: req.signedCookies.auth,
      admin: true
    }
  }).success(function (user) {
    if (req.session.user) {
      res.json({
        auth: true,
        user: _.omit(user.get(), ['password', 'auth'])
      });
    } else {
      res.json({
        auth: false
      });
    }
  }).error(function () {
    User.find({
      where: {
        auth: req.signedCookies.auth
      }
    }).success(function (user) {
      res.json({
        auth: true,
        user: _.omit(user.get(), ['password', 'auth'])
      });
    }).error(function () {
      res.json({
        error: "Client has no valid login cookies."
      });
    });
  });
});

app.post("/foo/auth/login", csrfProtection, function (req, res) {
  req.checkBody('username', 'Invalid username').notEmpty().isEmail();
  req.checkBody('password', '6 to 20 characters required').len(6, 20);

  var errors = req.validationErrors();
  if (errors) {
    // res.send('There have been validation errors: ' + util.inspect(errors), 400);
    res.json(errors[0]);
    return;
  }

  User.find({
    where: {
      username: req.body.username
    }
  }).success(function (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      res.cookie('auth', user.auth, {
        signed: true,
        maxAge: sessionConfig.cookieMaxAge
      });
      req.session.regenerate(function () {
        req.session.user = _.omit(user.get(), ['password', 'auth']);
        return res.json({
          auth: true,
          csrf: req.csrfToken(),
          user: req.session.user
        });
      });
    } else {
      return res.json({
        error: "Invalid username or password."
      });
    }
  }).error(function () {
    // Could not find the username
    res.json({
      error: "Username does not exist."
    });
  });
});

app.post("/foo/auth/signup", csrfProtection, function (req, res) {
  req.checkBody('username', 'Invalid username').notEmpty().isEmail();
  req.checkBody('password', '6 to 20 characters required').len(6, 20);
  req.checkBody('passwordConfirm', 'Passwords must match').equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    // res.send('There have been validation errors: ' + util.inspect(errors), 400);
    res.json(errors[0]);
    return;
  }

  User.create({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, 8),
    auth: bcrypt.genSaltSync(8),
    admin: false
  }).success(function () {
    User.find({
      where: {
        username: req.body.username
      }
    }).success(function (user) {
      res.cookie('auth', user.auth, {
        signed: true,
        maxAge: sessionConfig.cookieMaxAge
      });
      req.session.regenerate(function () {
        req.session.user = _.omit(user.get(), ['password', 'auth']);
        return res.json({
          auth: true,
          csrf: req.csrfToken(),
          user: req.session.user
        });
      });
    }).error(function () {
      res.json({
        error: "Error while trying to register user."
      });
    });
  }).error(function () {
    res.json({
      error: "Username has been taken."
    });
  });
});

app.post("/foo/auth/logout", function (req, res) {
  req.session.user = null;
  res.clearCookie('auth');
  res.json({
    success: "User successfully logged out."
  });
});

app.post("/foo/auth/remove_account", function (req, res) {
  User.destroy({
    where: {
      id: req.session.user.id,
      auth: req.signedCookies.auth
    }
  }).success(function () {
    req.session.user = null;
    res.clearCookie('auth');
    res.json({
      success: "User successfully deleted."
    });
  }).error(function () {
    res.json({
      error: "Error while trying to delete user."
    });
  });
});

app.post("/foo/auth/changepw", function (req, res) {
  req.checkBody('password', '6 to 20 characters required').len(6, 20);
  req.checkBody('passwordConfirm', 'Passwords must match').equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    // res.send('There have been validation errors: ' + util.inspect(errors), 400);
    res.json(errors[0]);
    return;
  }

  User.find({
    where: {
      id: req.session.user.id
    }
  }).success(function (user) {
    user.updateAttributes({
      password: bcrypt.hashSync(req.body.password, 8),
      auth: bcrypt.genSaltSync(8)
    }).success(function () {
      req.session.user = null;
      res.clearCookie('auth');
      return res.json({
        success: "Password changed. Now logout."
      });
    }).error(function (err) {
      console.log(err);
      res.json({
        error: "Change password error."
      });
    });
  }).error(function () {
    // Could not find the username
    res.json({
      error: "User does not exist."
    });
  });
});

app.post('/foo/payment_details', function(req, res) {
  paypal.payment.get(req.body.paymentId, function (error, payment) {
    if (error) {
      res.json(error);
      throw error;
    } else {
      res.json(payment);
      console.log("Get Payment Response");
      console.log(JSON.stringify(payment));
    }
  });
});

app.get('/checkout/thankyou', function (req, res) {
  // you need to apply some input checks
  var paymentId = req.query.paymentId;
  var execute_payment_json = {
    "payer_id": req.query.PayerID
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      res.redirect('#checkout/error').end();
    } else {
      console.log("Get Payment Response");
      console.log(JSON.stringify(payment));
      // if payment state is approved
      //   update the payment DB
      //   res.render('payment-thankyou');
      // otherwise
      //   res.redirect('error').end();
      if (payment.state == "approved") {
        Payment.find({
          where: {
            paymentId: payment.id
          }
        }).success(function(p) {
          p.updateAttributes({
            state: payment.state
          }).success(function() {
            res.redirect('#checkout/thankyou').end();
          }).error(function(err) {
            console.log(err);
          });
        }).error(function(err) {
          console.log(err);
        })
      } else {
        res.redirect('#checkout/error').end();
      }
    }
  });
});


app.get('/checkout/error', function (req, res) {
  // you need to apply some input checks
  var token = req.query.token;
  // say cancel or error
  // display the url to retry
  res.writeHead(302, {'Location': 'https://store52.ierg4210.org/#checkout/error?token=' + token});
  res.end();
});

// assume this URL will take the request for different pids and qtys
app.post('/checkout', function (req, res) {
  // if no login session
  //   save the pids and qtys tentatively
  //   quit and redirect to login page
  var cart = req.body.cart;
  var ids = [];
  var qtys = [];
  var total = 0.0;
  for (var i = 0; i < cart.length; i++) {
    ids[i] = cart[i].id;
    qtys[cart[i].id] = parseInt(cart[i].quantity);
  }
  var items = []
  Product.findAll({
    where: { id: ids }
  }).success(function(products) {
    products.forEach(function(product) {
      var qty = qtys[parseInt(product.get().id)];
      total += (parseFloat(product.get().price) * qty);
      items.push({
        "sku": product.get().id,
        "name": product.get().name,
        "quantity": qty,
        "price": product.get().price,
        "currency": "HKD"
      });
    });

    var create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        // change the URLs
        "return_url": "https://store52.ierg4210.org/checkout/thankyou",
        "cancel_url": "https://store52.ierg4210.org/checkout/error"
      },
      "transactions": [{
        "item_list": {
          // populate the purchased items based on the user-supplied pids and qtys, and other things such as prices and names from DB
          "items": items
        },
        "amount": {
          "currency": "HKD",
          // calculate the correct amount
          "total": total.toFixed(2)
        },
        // a good description that you like
        "description": "IERG4210 Shop52"
      }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        console.error(JSON.stringify(error));
      } else {
        console.log("Created Payment Response");
        console.log(payment);

        // update the payment DB to record the paymentId from paypal
        Payment.create({
          userid: req.session.user.id,
          paymentId: payment.id,
          state: payment.state
        }).success(function() {
          res.json(payment.links);

        }).error(function(err) {
          console.log(err);

        })

        // get the approval_url from payment
        // res.redirect(approval_url);
      }
    });
  }).error(function(err) {
    console.log(err);
  });
});

app.listen(port, function () {
  console.log("Express server listening on port " + port);
});
