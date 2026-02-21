const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'));


const connection = mysql.createConnection({
    // write your database credentials in form 
    // host: "host-name"
    // user: "root"
    // passwrod: "********"
    // database: "node_SQL"
});

let getRandomUser = () => {
    return [
        // faker.string.uuid(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password(),
        // birthdate: faker.date.birthdate(),
        // regiseredAt: faker.date.past(),
        // avatar: faker.image.avatar()

    ];
}

// let q = "INSERT INTO user (id,username, email, password) VALUES (?, ?, ?, ?)";
//
// let values = [123,"narsh", "harsh123@gmail.com", "harsh123@"];
// for single user insertion [ ] symbol not required

// let q = "INSERT INTO user (username, email, password) VALUES ?";

// let values = [[124, "john_doe", "john_doe@gmail.com", "john_doe@123"],
// [125, "jane_smith", "jane_smith@gmail.com", "jane_smith@123"]];
// for multiple user insertion [ ] symbol required

// let values = [];
// for (let i = 0; i < 5; i++) {
//     values.push(getRandomUser());
//     // values.push([user.userId, user.username, user.email, user.password]);
// }


// this block of code is for selecting data from database


// try {
//     connection.query(q, [values], (err, results) => {
//         if (err) throw err;

//         console.log('Tables in the database:', results);
//     });
// } catch (err) {
//     console.error('Error executing query:', err);
// }


// connection.end(); // to end the connection with database

//  & 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe' -u root -p  this is the command to login to mysql in terminal



// we will use MySQL2 or Sequelize in future to connect to database

// setting up express server i.e routing

app.get('/', (req,res) => {
    let q = 'SELECT COUNT(*) FROM user';
    try{
        connection.query(q, (err, results) =>{
            if (err) throw err
            console.log(results[0]['COUNT(*)']);
            res.render('home.ejs',{count: results[0]['COUNT(*)']})
        });
    } catch(err){
        console.log(err);
        res.send("Error occured during fetching data");
    }
});

app.get('/users', (req,res) => {
    let q = 'SELECT * FROM user';

    try{
        connection.query(q, (err,users) =>{
            if (err) throw err;
            res.render('show.ejs',{users});
        });
    }catch(err){
        console.error(err);
        res.send("Error occured during fetching data");
    }
});

// EDIT ROUTE

app.get('/users/:id/edit', (req,res) => {
    let {id} = req.params;
    let q = 'SELECT * FROM user WHERE id = ?';
    try {
        connection.query(q, [id], (err,users) => {
            if (err) throw err;
            console.log(users);
            res.render('edit.ejs',{users});
        });
    }catch(err){
        console.error(err);
        res.send("Error occured during fetching data");
    }
});

// Add user

app.get('/posts/add', (req,res) => {
    res.render('add.ejs');
});

app.post("/users", (req,res) => { 
    let { username, email, password, confirmPassword } = req.body;
    let addQ = `INSERT INTO user (username, email, password) VALUES ?`;
    if (!username || !email || !password || !confirmPassword){
        return res.send("All fields are required");
    }
    if (password !== confirmPassword){
            return  res.send("Password do not match");
        }
    let values = [[ username, email, password]];
    try {
        connection.query(addQ, [values], (err, addResults) => {
            if (err) throw err;
            console.log(addResults);
            res.redirect('/users');
        });
    }catch(err){
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).send('Email already registered');
        console.error(err); return res.status(500).send('DB error');
    }
});

// update route

app.patch('/users/:id', (req,res) => {
    let {id} = req.params;
    let { username, email, password } = req.body;
    let selectQ = `SELECT * FROM user WHERE id = "${id}"`;
    try {
        connection.query(selectQ, (err, results) => {
            if (err) throw err;
            
            if(password != results[0].password){
                console.log(password, results[0].password);
                return res.send("Password mismatch unable to update profile");
            }else{
                let updateQ = `UPDATE user SET username = "${username}", email = "${email}" WHERE id = "${id}"`;
                try {
                connection.query(updateQ, (err, updateResults) => {
                    if (err) throw err;
                    console.log(updateResults);
                    res.redirect('/users');
                });
                }catch(err){
                    console.error(err);
                    res.send("Error occured during updating data");
                }
            }
        });
    }catch(err){
        console.error(err);
        res.send("Error occured during fetching data");
    }
});

// delete route

app.delete('/users/:id', (req,res) => {
    let {id} = req.params;
    let deleteQ = `DELETE FROM user WHERE id = "${id}"`;
    try {
        connection.query(deleteQ, (err, deleteResults) => {
            if (err) throw err;
            console.log(deleteResults);
            res.redirect("/users");
        });
    }catch{
        console.log(err);
        res.send("Error occur in deleting route");
    }
});

app.listen(3000,() => {
    console.log("Server is running to port 3000");
});

