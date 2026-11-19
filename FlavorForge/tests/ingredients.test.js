const test=require("node:test");
const assert=require("node:assert/strict");
const {normalizeIngredient,scoreRecipe}=require("../shared/ingredients");
test("normalizes case, punctuation, plurals, and aliases",()=>{assert.equal(normalizeIngredient(" TOMATOES! "),"tomato");assert.equal(normalizeIngredient("Bell Pepper"),"capsicum");assert.equal(normalizeIngredient("eggs"),"egg");});
test("excludes assumed staples from match scoring",()=>{const result=scoreRecipe({ingredients:["egg","bread","salt","oil"]},["egg","bread"]);assert.equal(result.match,100);assert.deepEqual(result.missing,[]);});
test("reports missing ingredients and calculates percentage",()=>{const result=scoreRecipe({ingredients:["egg","bread","onion"]},["egg"]);assert.equal(result.match,33);assert.deepEqual(result.missing,["bread","onion"]);});
test("handles recipes containing only staples without division by zero",()=>{const result=scoreRecipe({ingredients:["salt","oil"]},["salt"]);assert.equal(result.match,0);assert.deepEqual(result.missing,[]);});
