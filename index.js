import express from "express";
import sql from "./db.js";

const app = express();

app.use(express.json());

app.get("/food", async (req, res) => {
  try {
    const allFood = await sql`SELECT name, type FROM recipes`;
    res.json(allFood);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/food/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const allFood = await sql`SELECT r.name AS recipe_name, 
      r.instructions as instructions,
      i.quantity AS quantity, 
      i.condition AS condition, 
      i.name AS ingredients  
      FROM ingredients AS i
      JOIN recipes AS r ON r.recipe_id = i.recipe_id WHERE r.recipe_id = ${id};`;

    if (allFood.length == 0) {
      return res.status(404).send("id doesn't exists");
    }
    return res.json(allFood);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/food/:type", async (req, res) => {
  try {
    const { type } = req.query;
    const allFood = await sql`SELECT r.type AS type, 
        r.name AS recipe_name, 
        r.instructions as instructions,
        i.quantity AS quantity, 
        i.condition AS condition, 
        i.name AS ingredients  
        FROM ingredients AS i
        WHERE r.recipe_id = ${type};`;

    if (allFood.length == 0) {
      return res.status(404).send("id doesn't exists");
    }
    return res.json(allFood);
  } catch (err) {
    console.error(err.message);
  }
});

app.post("/recipe", async (req, res) => {
  try {
    const { name, type, instructions } = req.body;
    const newRecipe =
      await sql`INSERT INTO recipes (name, type, instructions) VALUES(${name}, ${type}, ${instructions}) RETURNING *;`;
    res.status(201).json(newRecipe);
  } catch (err) {
    console.error(err);
  }
});

app.post("/ingredients/:recipe_id", async (req, res) => {
  try {
    const { recipe_id } = req.params;
    const dataIngredients = req.body.ingredients;
    const insertedIngredients = [];
    for (const ingredients of dataIngredients) {
      const newIngredients =
        await sql`INSERT INTO ingredients (name, quantity, condition, recipe_id) 
        VALUES(${ingredients.name},${ingredients.quantity},${ingredients.condition}, ${recipe_id}) RETURNING * ;`;
      insertedIngredients.push(newIngredients[0]);
    }

    res.status(201).json({ ingredients: insertedIngredients });
  } catch (err) {
    console.error(err);
  }
});

app.patch('/food/:id',async(req, res) => {
    try{
        const { id } = req.params;
        const {name, type, instructions}=req.body;
        const updateRecipe = await sql `UPDATE recipes SET "name" = ${name}, "type"=${type}, "instructions"=${instructions} WHERE recipe_id = ${id} RETURNING *`;
       
        if (updateRecipe.length == 0) {
            return res.status(404).send("id doesn't exists");
          }
          return res.json(updateRecipe);
    } catch(err){
        console.error(err);
    }
})

app.patch('/ingredients/:recipe_id',async(req, res) => {
    try{
        const { recipe_id } = req.params;
        const {name, quantity, condition}=req.body;
        const ingredientRecipe = await sql `UPDATE ingredients SET "name" = ${name}, "quantity"=${quantity}, "condition"=${condition} WHERE ingredient_id = ${recipe_id} RETURNING *`;
       
        if (ingredientRecipe.length == 0) {
            return res.status(404).send("recipe_id doesn't exists");
          }
          return res.json(ingredientRecipe);
    } catch(err){
        console.error(err);
    }
})

app.delete("/ingredients/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleteIngredients = await  sql`DELETE FROM ingredients WHERE ingredient_id = ${id} RETURNING *`;
      if (deleteIngredients.length == 0) {
        return res.status(404).send("id doesn't exists");
      }
      return res.json(deleteIngredients);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });

  app.delete("/food/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleteFood = await  sql`DELETE FROM recipes WHERE recipe_id = ${id} RETURNING *`;
      if (deleteFood.length == 0) {
        return res.status(404).send("id doesn't exists");
      }
      return res.json(deleteFood);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
