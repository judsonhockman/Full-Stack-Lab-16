var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'chirperUser',
    password: 'chirperpassword',
    database: 'Chirper'
});

var clientPath = path.join(__dirname, '../client');

var app = express();
app.use(express.static(clientPath));

app.use(bodyParser.json());  // filters incoming and stores on req.body

app.route('/api/chirps')
    .get(function (req, res) {  // incoming request and outgoing response
        rows('GetChirps')
            .then(function(chirps) {
                res.send(chirps);
            }).catch(function(err) {
                console.log(err);
                res.sendStatus(500);
            });
    }).post(function (req, res) {
        var newChirp = req.body;
        row('InsertChirp', [newChirp.message, newChirp.userid])
            .then(function(id) {
                res.status(201).send(id);
            }).catch(function(err) {
                console.log(err);
                res.sendStatus(500);
            });
    });
app.route('/api/chirps/:id') // get all chirps
    .get(function (req, res) {
        row('GetChirp', [req.params.id])
            .then(function(chirp) {
                res.send(chirp);
            }).catch(function (err) {
                console.log(err);
                res.sendStatus(500);
            });
    }).put(function (req, res) {
        empty('UpdateChirp', [req.params.id, req.body.message])
            .then(function() {
                res.sendStatus(204);
            }).catch(function (err) {
                console.log(err);
                res.sendStatus(500);
            });
    }).delete(function (req, res) {
        empty('DeleteChirp', [req.params.id])
            .then(function() {
                res.sendStatus(204);
            }).catch(function(err) {
                console.log(err);
                res.sendStatus(500);
            });
    });

app.get('/api/users', function (req, res) { // get one chirp
    rows('GetUsers') // rows because we want multiple things from the database
        .then(function (users) {
            res.send(users);
        }).catch(function (err) {
            console.log(err);
            res.sendStatus(500);
        });
});

app.listen(3000);



function callProcedure(procedureName, args) {
    return new Promise(function (resolve, reject) { // Called executof
        pool.getConnection(function (err, connection) {  // call-back...error is first parameter. Success is second.
            if (err) {
                reject(err);
            } else {
                var placeholders = '';
                if (args && args.length > 0) {
                    for (var i = 0; i < args.length; i++) {
                        if (i === args.length - 1) {
                            placeholders += '?';
                        } else {
                            placeholders += '?,';
                        }
                    }
                }
                var callString = 'CALL ' + procedureName + '(' + placeholders + ');';
                connection.query(callString, args, function(err, resultsets) {
                    connection.release();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(resultsets);
                    }
                });
            }
        });
    });
}

function rows(procedureName, args) {
    return callProcedure(procedureName, args)
        .then(function (resultsets) {
            return resultsets[0];
        });
}

function row(procedureName, args) {
    return callProcedure(procedureName, args)
        .then(function (resultsets) {
            return resultsets[0][0];
        });
}
function empty(procedureName, args) {
    return callProcedure(procedureName, args)
        .then(function () {
            return;

        });
}

