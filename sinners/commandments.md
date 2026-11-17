# The Ten UmbraCommandments

*The doctrine behind the talk. The Sinners package enforces these — as a bit.
Take the rules seriously; take the package nowhere near anything you love.*

## 1. Content is not composable

Compositions in Umbraco, while they are a very handy feature, come with caveats that are unacceptable for the preservation of content. Removing a composition from a document-type will result in ALL content contained within the scope of that composition to be deleted. Permanently without being recoverable through content revisions.

Today, most content will take the form of block lists or block grids, and while it is perfectly fine to re-use their data-types across multiple pages, adding them through compositions should always be avoided due to aforementioned reason.

Meta-content, settings and the like are good composition candidates. CTAs, buttons and references can also be good candidates. The main criteria should always be: Will there still be viable relevant content if we remove the composition again? A news page with a block grid added through a composition will not be a news page worth anything if all the content ends up being deleted across all the many pages because someone regretted a composition.

---

## 2. There are 4 document types. Data, Block, Composition and Page.

While strictly speaking there are only 2 document types in Umbraco (document and element), we think about them as 4.

A **Page** is a document. It wants to be rendered. It can have compositions.

A **Block** is an element that wants to be rendered. It can have compositions but is not allowed to be used as a composition. Its only use is to be in a block list or a block grid. While you can put data in a block list, a block's express purpose in life is to render.

**Data** is an element that won't be rendered. It will contain things like settings, events, people — anything that is pickable but isn't tied to a partial view or a component in a headless architecture. It can have compositions, but should itself not be composed onto anything. Because it is an element type, it cannot exist as a standalone node in the content tree.

A **Composition** is an element which only exists to be composed onto either a page, a block or some data. It should never render or have a view — it should never be pickable.

There used to be six. **Repositories** and **Repository Items** — never-rendered container documents holding shared, pickable content — served us faithfully, but with Umbraco 18 the Library has taken up their burden: shared content now lives as elements in the Library, pickable across the installation without ceremony. The Repositories have ascended. We do not mourn them; we count to four.

When building our solutions, we should strive to sort our document types into 4 folders: Data, Blocks, Compositions, Pages. What you do from there can be project specific.

---

## 3. A custom data-type can never be at the root of the data-type folder

Clutter is the enemy of clarity, and a messy data-type folder is a messy solution. A good starting point is to make a "Kraftvaerk" or "Custom" folder, and inside that one make a folder for every data type you create.

---

## 4. Compose in your IComposer, not in Program.cs

Program.cs is for bootstrapping your application. If it can be done with IUmbracoBuilder, it belongs in an IComposer.

Umbraco gives you a structured, discoverable way to register and configure your dependencies, replace services, and extend the pipeline. Use it. A Program.cs bloated with builder extensions is a sign that nobody agreed on where things belong, and now everything is everywhere.

IComposers are also where Umbraco itself expects to find your customisations — they load in the right order, they can depend on each other, and a new developer on the project knows exactly where to look.

Non-Umbraco concerns like Application Insights or CORS belong in extension methods on WebApplicationBuilder — not inline in Program.cs.

---

## 5. A production site runs in production mode

That means Umbraco Application Url is set, the site is built with --configuration release, uses https only and cannot create models or edit templates.

---

## 6. An Alias can ONLY be in English and camelCase

No more `@Artikel.Where(x => x.NogetPaaDansk == "this is silly")`

---

## 7. A translation item can only be in PascalCase with dot (.) as separators and a translation folder always has no translations unto itself

- My.Dictionary (is empty)
  - My.Dictionary.Item (has values)

---

## 8. Media cannot exist outside of a folder

---

## 9. A root node is not a rendering node

The content tree root is not a free-for-all. Every root node must be a template-less shell that contains your actual site. 
Pages live beneath a root node, never at the root themselves. This keeps the content tree intentional — editors know that what they see at the top level is structure, not content.

---

## 10. It is a sin not to uSync when not in Umbraco Cloud

When in Umbraco Cloud, use Umbraco Deploy.
