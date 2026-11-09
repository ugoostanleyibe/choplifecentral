import { createComponent, html, css } from "udodi";
import { foodStore } from "../store/foodStore.js";
import { router } from "../router.js";

/**
 * RecipeCreatePage Component
 * Uses Udodi form validation directives (@form, @validate).
 */
export const RecipeCreatePage = createComponent({
  name: "RecipeCreatePage",

  methods: {
      required(value) {
        if (value && String(value).trim().length > 0) {
          return true;
        }
        return "This field is required. Don't leave our pot empty!";
      },

      between(value, min, max) {
        const len = String(value || "").trim().length;
        if (len >= Number(min) && len <= Number(max)) {
          return true;
        }
        return `Must be between ${min} and ${max} characters long.`;
      },

      numeric(value) {
        if (!isNaN(value) && Number(value) > 0) {
          return true;
        }
        return "Must be a valid positive number in minutes.";
      },

      handleFormSubmit(submitContext) {
        const data = Object.fromEntries(submitContext.formData);

        // Parse ingredients text into array
        const rawIngredients = (data.ingredients || "").split("\n").filter((l) => l.trim().length > 0);
        const parsedIngredients = rawIngredients.map((line) => {
          const parts = line.split("-");
          if (parts.length > 1) {
            return { item: parts[0].trim(), amount: parts[1].trim(), unit: "" };
          }
          return { item: line.trim(), amount: "", unit: "" };
        });

        // Parse instructions text into array
        const rawInstructions = (data.instructions || "").split("\n").filter((l) => l.trim().length > 0);

        const newRecipe = foodStore.addRecipe({
          title: data.title || "Custom Naija Dish",
          category: data.category || "Jollof & Rice",
          prepTime: Number(data.prepTime) || 15,
          cookTime: Number(data.cookTime) || 30,
          spiceLevel: Number(data.spiceLevel) || 2,
          servings: Number(data.servings) || 4,
          emoji: data.emoji || "🍲",
          heroImage: data.heroImage || "/images/jollof.jpg",
          description: data.description || "A delicious homemade recipe passed down through generations.",
          chefNote: data.chefNote || "Cook with patience and plenty of joy!",
          ingredients: parsedIngredients.length > 0 ? parsedIngredients : [
            { item: "Fresh ingredients", amount: "Generous", unit: "portion" }
          ],
          instructions: rawInstructions.length > 0 ? rawInstructions : [
            "Wash and prep all ingredients thoroughly.",
            "Simmer on low-medium heat until done to perfection."
          ],
          tags: ["Home Cooked", data.category || "Naija"],
        });

        submitContext.controller?.reset?.({ clearForm: true });
        router.push(`/recipes/${newRecipe.id}`);
      },

      cancel() {
        router.push("/");
      },
    },

    style: css`
      :scope {
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .create-card {
        background: var(--card-bg, #1e293b);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        border-radius: 24px;
        padding: 2.5rem;
        box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.35);
      }

      .header-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(16, 185, 129, 0.12);
        color: #10b981;
        font-weight: 800;
        font-size: 0.8rem;
        padding: 4px 12px;
        border-radius: 999px;
        margin-bottom: 0.75rem;
      }

      .form-title {
        font-size: 1.85rem;
        font-weight: 900;
        margin: 0 0 0.5rem;
        color: var(--text-heading, #f8fafc);
      }

      .form-subtitle {
        font-size: 0.95rem;
        color: var(--text-muted, #94a3b8);
        margin: 0 0 2rem;
        line-height: 1.5;
      }

      .udodi-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .form-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
      }

      @media (max-width: 650px) {
        .form-grid-2 {
          grid-template-columns: 1fr;
        }
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .form-label {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--text-heading, #e2e8f0);
      }

      .form-hint {
        font-size: 0.78rem;
        color: var(--text-muted, #94a3b8);
      }

      .form-input, .form-select, .form-textarea {
        width: 100%;
        box-sizing: border-box;
        padding: 0.75rem 1rem;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
        border-radius: 12px;
        color: var(--text-heading, #f8fafc);
        font-size: 0.95rem;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .form-input:focus, .form-select:focus, .form-textarea:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
      }

      .form-textarea {
        min-height: 110px;
        resize: vertical;
      }

      .field-error-msg {
        color: #ef4444;
        font-size: 0.8rem;
        font-weight: 600;
        min-height: 1.1rem;
      }

      .form-actions-bar {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .btn-cancel {
        background: transparent;
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
        color: var(--text-muted, #94a3b8);
        padding: 0.75rem 1.5rem;
        border-radius: 999px;
        font-weight: 700;
        cursor: pointer;
      }

      .btn-cancel:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-heading, #f8fafc);
      }

      .btn-submit-recipe {
        background: linear-gradient(135deg, #10b981, #059669);
        color: #ffffff;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 999px;
        font-size: 1rem;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
        transition: transform 0.15s, box-shadow 0.2s;
      }

      .btn-submit-recipe:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 22px rgba(16, 185, 129, 0.45);
      }

      .form-status-box {
        background: rgba(15, 23, 42, 0.4);
        padding: 0.8rem 1.2rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        font-size: 0.85rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    `,

    template: () => html`
      <div class="recipe-create-root">
        <section class="create-card">
          <span class="header-badge">✨ Udodi Form & Validation Engine</span>
          <h1 class="form-title">Register Your Kitchen Secret</h1>
          <p class="form-subtitle">
            Enter your signature recipe details. Udodi's live validation engine checks your input in real time before saving to reactive storage.
          </p>

          <form @form="recipeForm" @submit="handleFormSubmit" class="udodi-form">
            <div class="form-group">
              <label class="form-label" for="title">Dish Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                class="form-input"
                placeholder="e.g. Grandma's Native Oha Soup with Cocoyam"
                @validate="required between:3:60"
                @trigger="live submit"
              />
              <div class="field-error-msg" @text="ud.forms.recipeForm.errors.title"></div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="category">Category *</label>
                <select id="category" name="category" class="form-select" @validate="required" @trigger="live submit">
                  <option value="Jollof & Rice">Jollof & Rice</option>
                  <option value="Soups & Swallows">Soups & Swallows</option>
                  <option value="Street Food & Grills">Street Food & Grills</option>
                  <option value="Comfort Bowls">Comfort Bowls</option>
                  <option value="Quick Bites">Quick Bites</option>
                </select>
                <div class="field-error-msg" @text="ud.forms.recipeForm.errors.category"></div>
              </div>

              <div class="form-group">
                <label class="form-label" for="spiceLevel">Spice Level</label>
                <select id="spiceLevel" name="spiceLevel" class="form-select">
                  <option value="1">Level 1 - Mild Chill 🧊</option>
                  <option value="2" selected>Level 2 - Standard Owambe Heat 🌶️</option>
                  <option value="3">Level 3 - Hot Pepper Restless 🔥</option>
                  <option value="4">Level 4 - Volcanic Flame 🌋</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="prepTime">Prep Time (minutes) *</label>
                <input
                  id="prepTime"
                  name="prepTime"
                  type="number"
                  class="form-input"
                  value="20"
                  @validate="required numeric"
                  @trigger="live submit"
                />
                <div class="field-error-msg" @text="ud.forms.recipeForm.errors.prepTime"></div>
              </div>

              <div class="form-group">
                <label class="form-label" for="cookTime">Cook Time (minutes) *</label>
                <input
                  id="cookTime"
                  name="cookTime"
                  type="number"
                  class="form-input"
                  value="40"
                  @validate="required numeric"
                  @trigger="live submit"
                />
                <div class="field-error-msg" @text="ud.forms.recipeForm.errors.cookTime"></div>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="servings">Base Servings *</label>
                <input
                  id="servings"
                  name="servings"
                  type="number"
                  class="form-input"
                  value="4"
                  @validate="required numeric"
                  @trigger="live submit"
                />
                <div class="field-error-msg" @text="ud.forms.recipeForm.errors.servings"></div>
              </div>

              <div class="form-group">
                <label class="form-label" for="emoji">Icon / Emoji</label>
                <input
                  id="emoji"
                  name="emoji"
                  type="text"
                  class="form-input"
                  value="🍲"
                  placeholder="e.g. 🍛, 🍲, 🍢, 🥣"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="description">Short Story / Description *</label>
              <textarea
                id="description"
                name="description"
                class="form-textarea"
                placeholder="What makes this dish special? Describe the flavors and memories..."
                @validate="required between:10:300"
                @trigger="live submit"
              ></textarea>
              <div class="field-error-msg" @text="ud.forms.recipeForm.errors.description"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="ingredients">Ingredients (One per line) *</label>
              <span class="form-hint">Tip: write format as "Item - amount unit" (e.g. Fresh Uha Leaves - 2 bunches)</span>
              <textarea
                id="ingredients"
                name="ingredients"
                class="form-textarea"
                placeholder="Yam or Cocoyam paste - 4 tbsp&#10;Smoked fish - 2 pieces&#10;Palm oil - 1 cup&#10;Crayfish - 0.5 cup"
                @validate="required"
                @trigger="live submit"
              ></textarea>
              <div class="field-error-msg" @text="ud.forms.recipeForm.errors.ingredients"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="instructions">Cooking Steps (One step per line) *</label>
              <textarea
                id="instructions"
                name="instructions"
                class="form-textarea"
                placeholder="Boil the meat and stockfish until tender.&#10;Add palm oil, crayfish, and grounded pepper.&#10;Stir in cocoyam paste to thicken soup.&#10;Fold in freshly shredded Oha leaves and turn off flame."
                @validate="required"
                @trigger="live submit"
              ></textarea>
              <div class="field-error-msg" @text="ud.forms.recipeForm.errors.instructions"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="chefNote">Chef's Golden Secret (Optional)</label>
              <input
                id="chefNote"
                name="chefNote"
                type="text"
                class="form-input"
                placeholder="e.g. Never cut Oha leaves with a steel knife; tear with hands to avoid blackening!"
              />
            </div>

            <div class="form-status-box">
              <span>Form Validity Status:</span>
              <span>
                Valid: <strong @text="ud.forms.recipeForm.valid"></strong>
              </span>
            </div>

            <div class="form-actions-bar">
              <button type="button" class="btn-cancel" @on="click=cancel">
                Cancel
              </button>
              <button type="submit" class="btn-submit-recipe">
                🚀 Publish Secret Recipe
              </button>
            </div>
          </form>
        </section>
      </div>
    `,
});

/**
 * Backward compatibility helper
 */
export function createRecipeCreatePage() {
  return RecipeCreatePage();
}
