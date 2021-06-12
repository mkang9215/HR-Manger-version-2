const express = require("express");
const path = require("path");
const dataService = require("./data-service.js");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

const multer = require("multer");
const bodyParser = require('body-parser');
const fs = require("fs");
const exphbs = require('express-handlebars');

const dataServiceAuth = require("./data-service-auth.js");
const clientSessions = require("client-sessions");

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
});  
const upload = multer({ storage: storage });

app.engine('.hbs', exphbs({ 
    extname: '.hbs',
    defaultLayout: 'main'
}));

app.set('view engine', '.hbs');

app.engine('.hbs', exphbs({ 
    extname: '.hbs',
    helpers: { 
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));


app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "web322_session", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}


app.use((req,res,next) => {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});


app.get("/", function (req, res) {
    res.render("home");
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.get("/employees", ensureLogin, (req, res) => { 
    if (req.query.status) {
        dataService.getEmployeesByStatus(req.query.status).then((data) => {    
            if (data.length > 0) { 
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results" });
            }
        }).catch(() => { 
            res.render({message: "no results"});
        });
    } else if (req.query.department) {
        dataService.getEmployeesByDepartment(req.query.department).then((data) => {        
            if (data.length > 0) { 
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results" });
            }
        }).catch(() => { 
            res.render({message: "no results"});
        });
    } else if (req.query.manager) {
        dataService.getEmployeesByManager(req.query.manager).then((data) => {        
            if (data.length > 0) { 
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results" });
            }
        }).catch(() => { 
            res.render({message: "no results"});
        });
    } else {
        dataService.getAllEmployees().then((data) => {        
            if (data.length > 0) { 
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results" });
            }
        }).catch(() => { 
            res.render({message: "no results"});
        });
    }
});

app.get("/employee/:empNum", ensureLogin, (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};

    dataService.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error 
    }).then(dataService.getDepartments)
    .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"

        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching 
        // viewData.departments object

        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
            }
        }

    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
        } else {
            res.render("employee", { viewData: viewData }); // render the "employee" view
        }
    });
});


app.get("/employees/add", ensureLogin, (req, res) => { 
    dataService.getDepartments().then((data) => {
        res.render('addEmployee', {departments: data});
    }).catch(() => {
        res.render('addEmployee', {departments: []});
    });
});

app.post("/employees/add", ensureLogin, (req, res) => { 
    dataService.addEmployee(req.body).then(() => {     
        res.redirect("/employees");
    }).catch(() => {
        res.status(500).send("Unable to add Employee");
    });  
});

app.post("/employee/update", ensureLogin, (req, res) => {
    dataService.updateEmployee(req.body).then(() => {     
        res.redirect("/employees");
    }).catch(() => {
        res.status(500).send("Unable to Update Employee");
    });  
});

app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
    dataService.deleteEmployeeByNum(req.params.empNum).then((data) => {  
        res.redirect("/employees");
    }).catch(() => { 
        res.status(500).send("Unable to Remove Employee / Employee not found"); 
    });
});





app.get("/departments", ensureLogin, (req, res) => {
    dataService.getDepartments().then((data) => {
        if (data.length > 0) { 
            res.render("departments", { departments: data });
        } else {
            res.render("departments", { message: "no results" });
        }
    }).catch(() => { 
        res.render({message: "no results"});
    });
});

app.get("/departments/add", ensureLogin, (req, res) => { 
    res.render("addDepartment");
});

app.post("/departments/add", ensureLogin, (req, res) => { 
    dataService.addDepartment(req.body).then(() => {     
        res.redirect("/departments");
    }).catch(() => {
        res.status(500).send("Unable to add Department");
    });  
});

app.post("/department/update", ensureLogin, (req, res) => {
    dataService.updateDepartment(req.body).then(() => {     
        res.redirect("/departments");
    }).catch(() => {
        res.status(500).send("Unable to Update Department");
    });  
});

app.get("/department/:departmentId", ensureLogin, (req, res) => {
    dataService.getDepartmentById(req.params.departmentId).then((data) => { 
        res.render("department", { department: data });
    }).catch(() => { 
        res.status(404).send("Department Not Found"); 
    });
});

app.get("/departments/delete/:departmentId", ensureLogin, (req, res) => {
    dataService.deleteDepartmentById(req.params.departmentId).then(() => {  
        res.redirect("/departments");
    }).catch(() => { 
        res.status(500).send("Unable to Remove Department / Department not found"); 
    });
});




app.get("/images/add", ensureLogin, (req, res) => { 
    res.render("addImages");
});

app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.get("/images", ensureLogin, (req, res) => { 
    fs.readdir("./public/images/uploaded", (err, items) => {  
        res.render("images", {images: items});
    });     
});




app.get("/login", (req, res) => { 
    res.render("login");
});

app.get("/register", (req, res) => { 
    res.render("register");
});

app.post("/register", (req, res) => {
    dataServiceAuth.registerUser(req.body).then(() => {     
        res.render("register", { successMessage: "User created" });
    }).catch((err) => {
        res.render("register", { errorMessage: err, userName: req.body.userName });
    });  
});


app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
    
        res.redirect('/employees');
    }).catch((err) => {
        res.render("login", { errorMessage: err, userName: req.body.userName });
    });  
});

app.get("/logout", (req, res) => { 
    req.session.reset();
    res.redirect('/');
});

app.get("/userHistory", ensureLogin, (req, res) => { 
    res.render("userHistory");
});



app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

dataService.initialize()
.then(dataServiceAuth.initialize())
.then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch((err) => {
    console.log("unable to start server: " + err);
});
