var express = require('express')
var cors = require('cors')
var app = express()

app.use(cors())


//Testing the api and its handling using express js
const dhandlecreateAdmin = () => {
    const data = {
  "username": "22",
        "admin": "22"
};
    console.log("--=============")
    console.log(data)

    fetch('http://localhost:8000/api/create-operator/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then((response) => {
                console.log("--============= 1 then" + response.json())
            return response.json()
        })
        .then((data) => {
                            console.log("--============= 2 then" + data)
            console.log(data);
            // setResponseMessage(data.message);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
};


app.listen(80, function () {
    console.log('CORS-enabled web server listening on port 80')
})

dhandlecreateAdmin();