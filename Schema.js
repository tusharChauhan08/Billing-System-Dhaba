let mongoose=require("mongoose");
mongoose.set('strictQuery', true);
let mongoURI="mongodb://127.0.0.1:27017/Bill-counter";
mongoose.connect("mongodb://127.0.0.1:27017/Bill-counter")
.then(console.log("Server connected"))
.catch("Server is not connected");


mongoose.connection;
//signup schema for Admin
let AdminSchema=new mongoose.Schema({
    Name:{type:String , required:true},
    Email_id:{type:String, required:true},
    Mobile_no:{type:Number, required:true},
    Secret_key:{type:Number, required:true},
    Password:{type:String, required:true}
});
let Admin1=new mongoose.model("Admin1",AdminSchema,"Admin");

// Schema for adding dish to the database
let DishSchema=new mongoose.Schema({
    Dish_Name:{type:String, required:true},
    Quantity:{type:String, required:true},
    Price:{type:Number, required:true},
    Date:{type:String, required:true}
});
let Dish=new mongoose.model("Dish",DishSchema,"Dish");

// Schema for the Bill issue for the customer
let billSchema=new mongoose.Schema({
    Customer_Name:{type:String, require:true},
    Quantity:{type:String, require:true},
    Order:{type:String, require:true},
    Total_bill:{type:Number, require:true},
    Date:{type:String,require:true}
});
let billing=new mongoose.model("billing",billSchema,"Bill");

// Schema for the adding the employee to the database
let billerSchema=new mongoose.Schema({
    Biller_Name:{type:String, required:true},
    Biller_id:{type:String, required:true},
    Password:{type:String, required:true},
    Date:{type:String, required:true}
});
let bill=new mongoose.model("bill",billerSchema,"Biller");

module.exports={
    mongoURI:mongoURI,
    signup:Admin1,
    Dish:Dish,
    Bill:billing,
    Biller:bill
}