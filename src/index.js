let express=require("express");
let app=express();
let path=require("path");
let mongoose=require("mongoose");
let hbs=require("hbs");
const bodyParser= require("body-parser");
let bcrypt=require("bcryptjs");
const { read } = require("fs");
let session=require("express-session");
let mongosession=require("connect-mongodb-session")(session);
let {mongoURI}=require("./Schema");
let {signup}=require("./Schema");
let {Dish}=require("./Schema");
let {Biller}=require("./Schema");
let {Bill}=require("./Schema");

app.set("view engine","hbs");
app.set("views",path.join(__dirname,"../views"));
app.use(express.static(path.join(__dirname,"../public")));
hbs.registerPartials(path.join(__dirname,"../partials"));
app.use(bodyParser.urlencoded({
    extended:true
}));

// store the session in mongodb
let store=new  mongosession({
    uri:mongoURI,
    collection:"my session"
})

// create a session
app.use(session({
    secret:"This is the secret",
    resave:false,
    saveUninitialized:false,
    store:store
}))

// middleware for the admin login
let adminAuth=(req,res,next)=>{
    if(req.session.adminAuth){
        next();
    }
    else{
        res.redirect("/login");
    }
}

// middleware for the employee login
let employeeAuth=(req,res,next)=>{
    if(req.session.employeeAuth){
        next();
    }
    else{
        res.redirect("/login");
    }
}

// variables for if condition in hbs
let exist,login=false;
let show=false;
let counter=true;
let showCounter=false;
let updation=false;
let deletion=false;
let employeer=false;
let dishe=false;
let updateDish=false;
let showEmployee=false;
let billing=false;
let showBill=false;

//logout url
app.get("/logout",(req,res)=>{
    req.session.destroy((err)=>{
        if(err) throw err;
        show=false;
        counter=true;
        showEmployee=true;
        updation=false;
        deletion=false;
        employeer=false;
        dishe=false;
        updateDish=false;
        showEmployee=false;
        billing=false;
        showBill=false;
        return res.redirect("/login");
    }); 
});

// dummy home page
app.get("/home",(req,res)=>{
    show=true;
    counter=false;
    deletion=false;
    dishe=false;
    employeer=false;
    updateDish=false;
    showEmployee=true;
    showBill=true;
    res.redirect("/?=home");
});


// Signup only for the Admin
app.get("/sign",(req,res)=>{
    res.render("sign",{updation,exist});
});
app.post("/signin",async(req,res)=>{
    const {name,email,password,mobile,secret}=req.body;
    if(name=="" || email=="" || mobile=="" || password=="" || secret==""){
        updation=true;
        res.redirect("/sign?=Failed");
    }
    else{
        updation=false;
        let pass= await bcrypt.hash(password,12);
        let AdminData=({
            Name:name,
            Email_id:email,
            Mobile_no:mobile,
            Secret_key:secret,
            Password:pass
        });
        let data={
            Email_id:email,
            Mobile_no:mobile,
            Secret_key:secret
        }
        signup.find(data, async(err,result)=>{
            if(err) throw err;
            if(result==""){
            await signup.insertMany([AdminData],(err,res)=>{
                if(err) throw err;
                console.log("Data is inserted successfully");
            });
                exist=false;
                res.redirect("/login?=success");
            }
            else{
                console.log("Data is found successfully");
                exist=true;
                res.redirect("/sign?=Failed");
            }
        });
    }
});

// Login Admin and Employee
app.get("/login",(req,res)=>{
    res.render("login",{login,updation});
});
app.post("/loging",(req,res)=>{
    let {admin,email,password}=req.body;
    if(admin=="" || email=="" || password==""){
        updation=true;
        res.redirect("/login?=failed");
    }
    else{
        updation=false;
        if(admin=="Admin"){
            let data={
                Email_id:email,
            }
            signup.find(data,(err,result)=>{
                if(err) throw err;
                if(result==""){
                    login=true;
                    console.log("Data is not found");
                    counter=true;
                    show=false;
                    res.redirect("/login?=fail");
                }
                else{
                    if(bcrypt.compareSync(password,result[0].Password)){
                        login=false;
                        counter=false;
                        show=true;
                        showEmployee=true;
                        showBill=true;
                        console.log("login successfully. Data is found.");
                        req.session.adminAuth=true;
                        res.redirect("/?=adminsuccess");
                    }
                    else{
                        login=true;
                        counter=true;
                        show=false;
                        console.log("Login Failed password is not matched.");
                        res.redirect("/login?=failed");
                    }
                }
            });
        } 
        else{
            let Data={
                Biller_id:email,
            }
            Biller.find(Data,(err,result)=>{
                if(err) throw err;
                if(result==""){
                    console.log("Data is not found");
                    login=true;
                    counter=true;
                    showCounter=false;
                    res.redirect("/login?=fail");
                }
                else{
                    if(bcrypt.compareSync(password,result[0].Password)){
                        console.log("Data is found successfully");
                        login=false;
                        counter=false;
                        showCounter=true;
                        req.session.employeeAuth=true;
                        res.redirect("/counter?=success");
                    }
                    else{
                        console.log("Employee data is not found in database.");
                        res.redirect("/login?=fail");
                    }
                }
            });
        } 
    };
});

// Adding Dish
app.get("/dishes",adminAuth,(req,res)=>{
    dishe=true;
    employeer=false;
    deletion=false;
    show=true;
    counter=false;
    showEmployee=true;
    showBill=true;
    res.redirect("/?=dishes");
});
app.post("/adding",async(req,res)=>{
    dishe=true;
    const {dish, price, date,quantity} = req.body;
    if(dish=="" ||  price=="" || date=="" || quantity==""){
        updation=true;
        res.redirect("/?=dishesFail");
    }
    else{
        updation=false;
        dishe=false;
            let dishes=({
                Dish_Name:dish,
                Price:price,
                Date:date,
                Quantity:quantity
            });
            await Dish.insertMany([dishes],(err,res)=>{
                if(err) throw err;
                console.log("dish is successfully added");
            });
            res.redirect("/?=dishAddSuccess");
    }
});
 
// Add Employee
app.get("/biller",adminAuth,(req,res)=>{
    employeer=true;
    deletion=false;
    dishe=false;
    show=true;
    counter=false;
    showEmployee=true;
    showBill=true;
    res.redirect("/?=employeeAdd");
});
app.post("/billed",async(req,res)=>{
    employeer=true;
    const {name, email, password,date}= req.body;
    if(name=="" || email=="" || password=="" || date==""){
        updation=true;
        res.redirect("/?=employeeAddFail");
    }
    else{
        updation=false;
        employeer=false;
        let pass=await bcrypt.hash(password,12);
        let billerData=({
            Biller_Name:name,
            Biller_id:email,
            Password:pass,
            Date:date
        });
        await Biller.insertMany([billerData],(err,res)=>{
            if(err) throw err;
            console.log("Biller is successfully registered");
            employeer=false;
        });
        res.redirect("/?=employeeAddSuccess");
    }
});

// For update in the menu
app.get("/edit",adminAuth,(req,res)=>{
    updateDish=true;
    show=true;
    counter=false;
    employeer=false;
    deletion=false;
    dishe=false;
    showEmployee=true;
    showBill=true;
    res.redirect("/?=editDishes");
});
app.post("/editing",async(req,res)=>{
    updateDish=true;
    let {quantity,dish,price,date}=req.body;
    let query={
        Dish_Name:dish
    }
    let data={
        $set:{
            Dish_Name:dish,
            Quantity:quantity,
            Price:price,
            Date:date
        }
    }
    if(quantity=="" || dish=="" || price=="" || date==""){
        updation=true;
        res.redirect("/?=dishFail");
    }
    else{
        updation=false;
        updateDish=false;
        Dish.update(query,data,(err,result)=>{
            if (err) throw err;
            console.log("Updation in the dish successfully executed.");
            res.redirect("/?=dishUpdatesuccess");
        });
    } 
});

// Delete the dish from the menu
app.get("/delete",(req,res)=>{
    deletion=true;
    employeer=false;
    dishe=false;
    counter=false;
    show=true;
    showEmployee=true;
    updateDish=false;
    showBill=true;
    res.redirect("/?=deletion");
})
app.post("/deleted",async(req,res)=>{
    deletion=true;
    let {quantity,dish}=req.body;
    let data={
            Quantity:{$gte:quantity},
            Dish_Name:{$gte:dish}
        }
    if(quantity=="" || dish==""){
        updation=true;
        res.redirect("/delete?=unsuccesful");
    }
    else{
        updation=false;
        Dish.deleteOne(data,(err,result)=>{
            try{
                deletion=false;
                console.log("data is successfully deleted");
                res.redirect("/?=success")
            }
            catch{
                deletion=true;
                if (err) throw err;
                res.redirect("/delete?=unsuccessful");
            }
        });
    }
});

// Show Bill for the Admin
app.get("/showBill",adminAuth,(req,res)=>{
    showCounter=true;
    counter=false;
    req.session.employeeAuth=true;
    res.redirect("/counter?=Admin");
});
// Admin View 
app.get("/",adminAuth,(req,res)=>{
    Dish.find({},(err,result)=>{
        if(err) throw err;
        let sr=1;
        for(let data of result){
            data.__v=sr;
            sr=sr+1;
        }
            res.render("adminView",{counter,show,result,deletion,updation,employeer,dishe,updateDish,showEmployee,showBill});
    })
});


// Dummy home  page
app.get("/homing",(req,res)=>{
    billing=false;
    editor=false;
    showCounter=true;
    counter=false;
    res.redirect("/counter?=home");
})
//  Bill counter and Employee View
app.get("/counter",employeeAuth,(req,res)=>{
    Bill.find({},(err,result)=>{
        if (err) throw err;
        let sr=1;
        for(let data of result){
            data.__v=sr;
            sr=sr+1;
        }
        Dish.find({},(err,result1)=>{
            if (err) throw err;
            res.render("billcounter",{counter,showCounter,result,updation,editor,result1,billing});
        })
    });
});

// Billing for customer
app.get("/bill",employeeAuth,(req,res)=>{
    billing=true;
    editor=false;
    showCounter=true;
    counter=false;
    res.redirect("/counter?=billAdder");
});
app.post("/billing",async(req,res)=>{
    billing=true;
    const {customer,quantity,order,amount,date}=req.body;
    if(customer=="" || quantity=="" || order=="" || amount=="" || date==""){
        updation=true;
        res.redirect("/counter?=failBill");
    } 
    else{
        billing=false;
        updation=false;
        let billData=({
            Customer_Name:customer,
            Quantity:quantity,
            Order:order,
            Total_bill:amount,
            Date:date
        });
        await Bill.insertMany([billData],(err,res)=>{
            if(err) throw err;
            console.log("Billing Data is successfully iserted");
        })
        res.redirect("/counter?=bilSuccess");
    } 
});


// update the bill of customer
let editor=false;
app.get("/editor",(req,res)=>{
    editor=true;
    showCounter=true;
    counter=false;
    billing=false;
    res.redirect("/counter?=editor");
});
app.post("/edited",(req,res)=>{
    updation=false;
    counter=false;
    editor=true;
    let {customer,dish,bill,quantity,update}=req.body;
    let query={
        Customer_Name:customer
    }
    let data={
        $set:{
            Customer_Name:update,
            Order:dish,
            Quantity:quantity,
            Total_bill:bill
        }
    }
    if(customer=="" || update=="" || dish=="" || quantity=="" || bill==""){
        updation=true;
        res.redirect("/counter?=editFailed");
    }
    else{
        updation=false;
        Bill.update(query,data,(err,result)=>{
            try{
                console.log("Update bill successfully.");
                if(result==""){
                    editor=true;
                    res.redirect("/counter?=updateFailedResult");
                }
                else{
                    editor=false;
                    res.redirect("/counter?=successUpdate");
                }
            }
            catch(err){
                console.log(err);
                res.redirect("/counter?=failedError");
            }
        });
    }
});

//view of admin for the details of the employee
app.get("/employee",(req,res)=>{
    show=true;
    counter=false;
    showEmployee=false;
    showBill=true;
    Biller.find({},(err,result)=>{
        if (err) throw err;
        let sr=1;
        for(let data of result){
            data.__v=sr;
            sr=sr+1;
        }
        res.render("viewEmployee",{result,show,counter,showEmployee});
    })
});
app.listen(5080);
console.log("Server is started at the port 5080...");