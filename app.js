//importing express and creating instance
const express = require("express");
const app = express();

//importing sqlite and sqlite3
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

//importing path and creating dataPath
const path = require("path");
const dataPath = path.join(__dirname, "todoApplication.db");

//use of json in the script
app.use(express.json());

//initialize and database
let dataBase = null;

//initializing database and server at port number 3000
const initializeDatabaseAndServer = async () => {
  try {
    dataBase = await open({
      filename: dataPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at localhost port number 3000");
    });
  } catch (error) {
    console.log("error");
    process.exit(1);
  }
};
initializeDatabaseAndServer();

//creating API 1
app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let getQuery = null;
  if (priority !== undefined && status !== undefined) {
    getQuery = `
      select * from todo where
      todo like '${search_q}' and 
      priority='${priority}' and status='${status}'
      `;
  } else if (priority !== undefined && status === undefined) {
    getQuery = `
      select * from todo where
      todo like '${search_q}' and priority='${priority}'
      `;
  } else if (priority === undefined && status !== undefined) {
    getQuery = `
      select * from todo where
      todo like '${search_q}' and status='${status}'
      `;
  } else {
    getQuery = `select * from todo where
      todo like '${search_q}'`;
  }

  const getResponse = await dataBase.all(getQuery);
  response.send(getResponse);
});

//creating API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `
  select * from todo where
  id=${todoId}
  `;
  const getResponse = await dataBase.get(getQuery);
  response.send(getResponse);
});

//creating API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postQuery = `
  insert into todo(id,todo,priority,status)
  values(
      ${id},
      '${todo}',
      '${priority}',
      '${status}'
  )
  `;
  const postResponse = await dataBase.run(postQuery);
  response.send("Todo Successfully Added");
});

//creating API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { search_q = "", priority, status } = request.body;
  let putQuery = null;
  let updatedTerm = null;
  if (status !== undefined) {
    putQuery = `
      update todo set
      status ='${status}'
      where
      id=${todoId}
      `;
    updatedTerm = "Status";
  } else if (priority !== undefined) {
    putQuery = `
      update todo set
      priority ='${priority}'
      where
      id=${todoId}
      
      `;
    updatedTerm = "Priority";
  } else {
    putQuery = `
      update todo set
      todo ='${search_q}'
      where
      id=${todoId}
      `;
    updatedTerm = "Todo";
  }
  await dataBase.run(putQuery);
  response.send(`${updatedTerm} Updated`);
});

//creating API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
  delete from todo where id=${todoId}
  `;
  await dataBase.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
