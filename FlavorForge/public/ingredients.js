(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FlavorForgeIngredients = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const aliases = { eggs:"egg", tomatoes:"tomato", potatoes:"potato", onions:"onion", breads:"bread", capsicums:"capsicum", bellpepper:"capsicum", bellpeppers:"capsicum", chillies:"chilli", chilies:"chilli" };
  const staples = new Set(["salt", "oil", "water"]);
  function normalizeIngredient(value) {
    const key = String(value ?? "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    return aliases[key] || key;
  }
  function scoreRecipe(recipe, pantryValues) {
    const pantry = pantryValues instanceof Set ? new Set([...pantryValues].map(normalizeIngredient)) : new Set((pantryValues || []).map(normalizeIngredient));
    const required = (recipe.ingredients || []).map(normalizeIngredient).filter(item => item && !staples.has(item));
    const missing = required.filter(item => !pantry.has(item));
    const match = required.length ? Math.round(((required.length - missing.length) / required.length) * 100) : 0;
    return { ...recipe, match, missing };
  }
  return { normalizeIngredient, scoreRecipe, staples: [...staples] };
});
