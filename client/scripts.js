var $chirpButton = $('#chirp-button');  // $ let's developer know this is a JQuery object
var $chirpField = $('#chirp-field');
var $chirpList = $('#chirp-list');
var $userSelector = $('#user-selector');

$chirpField.on('input', function () {
    var isEmpty = $chirpField.val().length === 0;
    $chirpButton.prop('disabled', isEmpty)
});
$chirpButton.click(postChirp);

function postChirp() {  // object literal
    var chirp = {
        message: $chirpField.val(),
        userid: $userSelector.val()
    };
    $.ajax({  // $.ajax is a promise
        method: 'POST', // what kind of request
        url: '/api/chirps',  // where is it being sent
        contentType: 'application/json',  // what format is the data in
        data: JSON.stringify(chirp) // This is the actual data
    }).then(function (success) {
        $chirpField.val('');
        $chirpButton.prop('disabled', true);
        getChirps();
    }, function (err) {
        console.log(err);
    });
}

function getChirps() {
    $.ajax({
        method: 'GET',
        url: '/api/chirps'
    }).then(function (chirps) {
        $chirpList.empty();
        for (var i = 0; i < chirps.length; i++) {
            addChirpDiv(chirps[i]);
        }
    }, function (err) {
        console.log(err);
    });
}
getChirps();


function deleteChirp(id) {
    $.ajax({
        method: 'DELETE',
        url: '/api/chirps/' + id
    }).then(function () {
        getChirps();
    }, function (err) {
        console.log(err);
    });
}
function addChirpDiv(chirp) {
    var $chirpDiv = $('<div class="chirp"></div>');
    var $message = $('<p></p>');
    var $user = $('<h4></h4>');
    var $timestamp = $('<h5></h5>');
    var $delButton = $('<button class="delete-button enhanced-button red">Delete</button>');
    $delButton.click(function () {
        deleteChirp(chirp.id);
    });

    $message.text(chirp.message);
    $user.text(chirp.user);
    $timestamp.text(new Date(chirp.timestamp).toLocaleString());

    $message.appendTo($chirpDiv);
    $user.appendTo($chirpDiv);
    $timestamp.appendTo($chirpDiv);
    $delButton.appendTo($chirpDiv);

    $chirpDiv.appendTo($chirpList);
}

function showUsers() {
    $.ajax({  // $.ajax is a promise which leads to the .then two lines later
        method: 'GET',
        url: '/api/users'
    }).then(function (users) {
        for (var i = 0; i < users.length; i++) {
            var $userOption = $('<option value="' + users[i].id + '">' + users[i].name + '</option>'); // .id and .name here are directly from the DB and must therefore match case exactly
            $userSelector.append($userOption);
        }
    }, function (err) {
        console.log(err);
    });
}
showUsers();