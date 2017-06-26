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
    .get(function (req, res) {
        rows('GetChirps')
            .then(function (chirps) {
                res.send(chirps);
            }, function (err) {
                console.log(err);
                res.sendStatus(500);
            });

    }).post(function (req, res) {
        var newChirp = req.body;
        row('InsertChirp', [newChirp.message, newChirp.user])
            .then(function (id) {
                res.status(201).send(id);
            }).catch(function (err) {
                console.log(err);
                res.sendStatus(500);
            });
    });
app.route('/api/chirps/:id')
    .get(function (req, res) {
        row('GetChirp', [req.params.id])
            .then(function (chirp) {
                res.send(chirps);
            }).catch(function (err) {
                console.log(err);
                res.sendStatus(500);
            });

    }).put(function (req, res) {
        empty('UpdateChirp', [req.params.id, req.body.message])
            .then(function() {
                res.sendStatus(204);
            }).catch(function(err) {
                console.log(err);
                res.sendStatus(500);
            });
    }).delete(function(req, res) {
        empty('DeleteChirp', [req.params.id])
            .then(function() {
                res.sendStatus(204);
            }).catch(function(err) {
                console.log(err);
                res.sendStatus(500);
            });
    
    });

app.listen(3000);

// function readFile(filePath, encoding) {
//     return new Promise(function (resolve, reject) {
//         fs.readFile(filePath, encoding, function (err, data) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(data);
//             }
//         });
//     });
// }
// function writefile(filePath, data) {
//     return new Promise(function (resolve, reject) {
//         fs.writeFile(filePath, data, function (err) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve();
//             }
//         });
//     });
// }

// function getChirps() {
//     return new Promise(function (resolve, reject) {
//         pool.getConnection(function (err, connection) {
//             if (err) {
//                 reject(err);
//             } else {
//                 connection.query('CALL GetChirps();', function (err, resultsets) {

//                     connection.release();
//                     if (err) {
//                         reject(err);

//                     } else {
//                         resolve(resultsets[0]);
//                     }
//                 });
//             }
//         });
//     });
// }

function callProcedure(procedureName, args) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
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
                connection.query(callString, args, function (err, resultsets) {
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
       //Instead of: res.end();
       //use:
   //   res.send("Hello World"); 
             // to send text/html
            // or this...
   //     res.send({name: "John"});
           // application/json (and it stringifies it for you!)

         // When using res.send()...
         // Express will automatically set the response status code to 200
         // If you want to set a different value, use res.status()
         //•Can be chained
        //  res.status(201).end(); // or 
        //  res.status(200).send("Hello!"); // or
        //  res.status(404).send("Not found!"); 
// **** Remember:
//           res.status(404); Sets the status code to 404, but does not send a response (connection remains open). 
//                            Requires a .send(...) later.
 //       res.sendStatus(404);  
 //       Sets the status code to 404 and sends NOT FOUND as the response which closes the connection.



