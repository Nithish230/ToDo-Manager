const express = require("express");
var csrf = require("tiny-csrf");

const app = express();
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("This is a secret string!!!"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

//configuring models
const { Todo } = require("./models");


app.set("view engine", "ejs");
//getting all the data from the database
app.get("/", async (request, response) => {
  const allTodosAre = await Todo.getAllTodos();  
  const completedItemsIs = await Todo.completedItemsAre();
  const overdue = await Todo.overdue();
  const dueLater = await Todo.dueLater();
  const dueToday = await Todo.dueToday();
  if (request.accepts("html")) {
    response.render("index", {
      title: "Todo's Manager",
      allTodosAre,
      overdue,
      dueLater,
      dueToday,
      completedItemsIs,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({overdue, dueLater, dueToday, completedItemsIs});
  }
});
//finding all the todos and converting into json
app.get("/todos", async (request, response) => {

  console.log("Todo list");
  try {
    const todoslist = await Todo.findAll();
    return response.json(todoslist);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
//a function to get each todo
app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
//function for adding a todo
app.post("/todos", async (request, response) => {
  try {
 
      await Todo.addaTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false,
    });
   
    return response.redirect("/");
  } catch (err1) {
    console.log(err1);
    return response.status(422).json(err1);
  }
});
//setting completion status for the todo
app.put("/todos/:id", async (request, response) => {
  console.log("Todo is completed : ", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedtodoIs = await todo.setCompletionStatusAs(request.body.completed);
    return response.json(updatedtodoIs);
  } catch (err2) {
    console.log(err2);
    return response.status(422).json(err2);
  }
});

// a function to delete the todos
app.delete("/todos/:id", async (request, response) => {
  console.log("Todo being deleted with a particular id..", request.params.id);
  try {
    await Todo.remove(request.params.id);
    return response.json(true );
  } catch (err3) {
    return response.status(422).json(err3);
  }
});
module.exports = app;
