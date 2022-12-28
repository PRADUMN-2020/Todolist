// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
const dotenv=require("dotenv");
dotenv.config({path:'./config.env'});
const app = express();

const DB=process.env.DATABASE;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(DB, function()
{
  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 3000;
  }

  app.listen(port, function() {
    console.log("Server started successfully.");
  });
});

const itemsSchema= {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1= new Item({
  name:"Brush & Toilet"
});


const item2= new Item({
  name:"Cycling"
});


const item3= new Item({
  name:"Bath and have Breakfast"
});

const defaultItems = [item1, item2, item3];

const listSchema={
  name:String,
  items:[itemsSchema]
}

const List= mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({}, function (err, docs) {
    if(docs.length===0)
    {
      Item.insertMany(defaultItems, function(err)
      {
        if(err)
        {
          console.log(err);
        }
        else
        {
          console.log("Items successfully add to the collection.");
        }

      });
 res.redirect("/");
    }
    else
    {
    res.render("list", {listTitle: "Today", newListItems: docs});
    }
  });

});

app.get("/:paramName",function(req,res)
{
  const newListName=_.capitalize(req.params.paramName);

  List.findOne({name:newListName},function(err,doc)
{
  if(!err)
  {
  if(!doc)
  {
    const newList=new List({
      name:newListName,
      items:defaultItems
    });
    newList.save(function(err)
  {
    if(!err)
    {
      res.redirect("/"+newListName);
    }
  });

  }
  else
  {
    res.render("list",{listTitle: doc.name, newListItems: doc.items});
  }
}
});
});

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const listName= req.body.list;
  const item= new Item({
    name:newItem
  });
  if(listName==="Today")
  {
    item.save(function(err)
  {
    if(!err)
    {
        res.redirect("/");
    }
  });

  }
  else
  {
    List.findOne({name:listName},function(err,doc)
  {
    if(!err)
    {
    doc.items.push(item);
    doc.save(function(err)
  {
    if(!err)
    {
      res.redirect("/"+listName);
    }
  });

  }
  });
  }

});

app.post("/delete",function(req,res){
 const deletedId=req.body.checkbox;
 const listName=req.body.listName;
 if(listName==="Today")
 {
 Item.findByIdAndRemove(deletedId,function(err)
{
  if(!err)
  {
      console.log("Element successfully deleted from collection.");
      res.redirect("/");
  }
});
}
else
{
  List.findOneAndUpdate({name:listName},{$pull: {items: {_id: deletedId}}},function(err,doc)
{
  if(!err)
  {
    res.redirect("/"+listName);
  }
});
}
});



app.get("/about", function(req, res){
  res.render("about");
});
