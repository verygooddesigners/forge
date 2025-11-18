I need you to read this document and then we will brainstorm the rest of the app. This is what I have so far. 

You will ask me any questions that help you to clarify what you're looking for. Ask these questions one at a time, waiting for my answer before moving on.

-----

# RotoWrite: New Planning Doc

## SYNOPSIS

RotoWrite is an Ai powered web app designed to help GDC team members produce written content for RotoWire that follows pre-created briefs, uses best SEO practices, attempts to rank highly in the new Google AI search results and relies on an innovative writer model engine to produce content that is exactly the same as content produced by our real writers.

## EXAMPLE PAGES

These are some of the types of pages our team will be building. 

<https://www.betmaryland.com/nfl/ravens/playoff-chances>
<https://www.betmaryland.com/mlb/baltimore-orioles>
<https://www.betmissouri.com/>
<https://www.betmissouri.com/gambling-laws>
<https://www.betgeorgia.com/online-casinos>

-----

## DEVELOPMENT

- Developed using Cursor
- Tested on localhost:5309

### GITHUB
The repo is located at <https://github.com/verygooddesigners/rotowrite>

### LIVE ENVIRONMENT (PUBLIC)
The app will be available on Vercel.

-----

## FEATURES

### WRITER ENGINE

Allows us to train and utilize AI powered writer models that precisely emulate the writing style of the strategists working on RotoWire. 

Each model is trained using dozens of pieces of real written content from the actual writers. When a new piece of content is added to a model, the AI analyzes it for style, tone and voice and then adjusts the model.

Writer Models are created and edited using the Writer Model Factory. Admins can create new models, edit all models, delete models. Logged-in strategists who have models based on them can edit (train) their own personal model. 

**EXAMPLE:** 
Max Staley is logged in. His account role is Strategist. There is a Max Staley writer model, so Max is able to train his model by pasting in content he has previously written. But Max is unable to train the Jeremy Botter writer model, because it's greyed out since only Jeremy and other Admins have access to it.

----------

## USER ROLES

For launch, users will not be able to sign up for accounts. The Admin will create their accounts and send them their credentials. 

Admins can: Access and update all settings, functions, user accounts, writer models
Strategists can: Update/train their own writer model

----------



#### BRIEF BUILDER
The RotoBrief Builder allows Strategists to create and edit briefs—SEO scaffolds—and save them for future use. These briefs are how the AI knows what format or layout to use. 

This feature is very much akin to SurferSEO, the popular SEO-focused content creation app.

Each RotoBrief can be assigned a category. Any user with the Admin, Editor or Strategist account type can add new categories inline if the one they want does not exist.

Briefs can be set for sharing with other strategists or for personal use by the creator. 

Brief creator has a bar that displays during editing. It shows the live SEO score in real time. 

Button to force ai to offer suggestions on how to improve SEO. 

## NEWS SEARCH
When creating a new project, the user will be asked for their headline, primary keyword and secondary keywords. 


## SCREENS

### DASHBOARD
The main app screen. It doesn’t extend fully to the edge of the window - there should be 10px padding around the edge of the browser window. There are three floating windows:

**Left Sidebar**
The upper portion shows the app logo, then some spacing, then the Main Navigation. Then there is a flexible section, and anchored to the bottom is an avatar/user icon that, when clicked, expands out a small menu with the following options: Settings, My Profile, Change Model

**Editor**
The main content display and editing window, which uses the TipTap editor (<https://github.com/ueberdosis/tiptap>).

**Right Sidebar**
Broken up into two boxes. The top box is short and lists the chosen writer model. The second box has two tabs at the top: 
    1. NewsEngine
    2. SEO Assistant
Clicking these tabs causes the content for that tab to appear. 

NewsEngine uses the headline and keywords provided by the user to do a smart AI search looking for news that is relevant to the topic. It prioritizes trustworthy sources and recent news - it won't show any news stories older than 3 weeks. 

When the user clicks the NewsEngine tab, they will see a News headline text. Under that is each news story, with each story in a card. Each card should contain two flexible columns:

LEFT BOX (takes up most of the card)
STORY HEADLINE
Brief description of story

RIGHT BOX
Small, cropped image from story if one is available

And on the bottom of the card, spanning both columns, in much smaller text: 
STORY SOURCE (OUTLET)   DATE PUBLISHED   RELEVANCE SCORE

-----

### WRITER FACTORY
The screen where new writer models are built, trained, edited and deleted. This screen is a modal that pops up in front of the existing dashboard and screen. 

### ADMIN DASHBOARD
Only available for admins. Contains sections for 
- user account management
    - Can create, edit, delete and view user accounts
- AI API changes (i.e. a place where I can add new AI model API keys)
    - AI API keys are hidden
- AI tuner: This should be AI master instructions that allows me to tweak the copy the AI generates


## DESIGN SYSTEM
The app uses the shadcn design framework, with rounded corners, clean and minimalistic typography, white space.

The primary color theme is Violet - it comes with shadcn ui.

The primary typeface is Inter with all of its weights and sizes.


---

## USER WORKFLOWS

### Strategists

1. User goes to the app URL
2. They log in
3. Upon login, a modal pops up asking them if they want to create a new project or open an existing project
4. Let's say they choose new project
5. The same  modal refreshes to ask for the new story headline, primary keyword and secondary keywords. They can optionally add a topic for the story. Clicking Next refreshes the modal content to ask which writer model they want to use. They choose their writer model, click Next. The content refreshes again, asking them which brief/scaffold they wish to use. They select it and click Start New Project
6. The main screen appears

---

Okay. Lets brainstorm

