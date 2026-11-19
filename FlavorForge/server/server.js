const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const { normalizeIngredient, scoreRecipe } = require("../shared/ingredients");
const app = express();
const port = Number(process.env.PORT) || 3000;
const recipesFile = path.join(__dirname, "../data/recipes.json");
const MAX_QUERY_LENGTH = 500, MAX_INGREDIENTS = 50, MAX_INGREDIENT_LENGTH = 40;
let recipes;
try {
  const parsed = JSON.parse(fs.readFileSync(recipesFile, "utf8"));
  if (!Array.isArray(parsed)) throw new Error("Recipe dataset must be a JSON array.");
  recipes = parsed;
} catch (error) {
  console.error("Unable to load recipe dataset:", error.message);
  throw new Error("FlavorForge could not start because recipes.json is unavailable or invalid.");
}
app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "../public")));
app.get("/api/health", (_req,res)=>res.json({status:"ok",recipes:recipes.length}));
app.get("/api/recipes", (_req,res)=>res.json(recipes));
app.get("/api/search", (req,res)=>{
  const raw=req.query.ingredients;
  if(typeof raw!=="string" || !raw.trim()) return res.status(400).json({error:"Provide ingredients as a comma-separated query parameter."});
  if(raw.length>MAX_QUERY_LENGTH) return res.status(400).json({error:`Ingredient query must be ${MAX_QUERY_LENGTH} characters or fewer.`});
  const values=raw.split(",").map(v=>v.trim());
  if(values.length>MAX_INGREDIENTS) return res.status(400).json({error:`Provide no more than ${MAX_INGREDIENTS} ingredients.`});
  if(values.some(v=>!v || v.length>MAX_INGREDIENT_LENGTH)) return res.status(400).json({error:`Each ingredient must contain 1–${MAX_INGREDIENT_LENGTH} characters.`});
  if(values.some(v=>! /^[\p{L}\p{N}\s'&-]+$/u.test(v))) return res.status(400).json({error:"Ingredients may contain letters, numbers, spaces, apostrophes, ampersands, and hyphens only."});
  const pantry=new Set(values.map(normalizeIngredient));
  if([...pantry].some(v=>!v)) return res.status(400).json({error:"One or more ingredients are invalid."});
  res.json(recipes.map(r=>scoreRecipe(r,pantry)).sort((a,b)=>b.match-a.match || a.time-b.time));
});
app.use("/api", (_req,res)=>res.status(404).json({error:"API endpoint not found."}));
app.get("*", (_req,res)=>res.sendFile(path.join(__dirname,"../public/index.html")));
app.use((err,_req,res,_next)=>{
  console.error("Request failed:",err.message);
  if(res.headersSent) return;
  const status=err.status || (err.type==="entity.parse.failed"?400:500);
  res.status(status).json({error:status===400?"Invalid request body.":"An unexpected server error occurred."});
});
if(require.main===module) app.listen(port,()=>console.log(`FlavorForge running at http://localhost:${port}`));
module.exports={app};
