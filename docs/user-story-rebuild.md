# USER STORY FOR REBUILD

## SYNOPSIS

The following user story will be analyzed in order to create a Build plan that will, once completed, make the app behave and look exactly as described in the story.

## USER STORY

- User arrives at the login screen. He either logs in with his existing account, or clicks Register, which brings up the registration form.

    - The typeface for the entire app should be Inter. Body type should be 400 weight. H1's should be 800. H2-H3 should be 600.

    - All elements on the screen should have a nice amount of padding to produce a clean look.

    - Any dividing lines should be 1px and use a soft version of the primary purple color. There should be a small amount of padding above and below each dividing line.

    - Register form asks for name, email address and a password.

    - User hits register button. He receives an email with a verification link. Once he clicks that link, the account is created. The account status is set to pending until an admin goes in the User Management Dashboard and changes the account status to Strategist, Editor, or Admin. Upon that account status change, the registered user recieves another email telling them their account has been verified. This email includes the login link.

- The now registered user visits the login link and logs in with his credentials.

- The first screen that pops up is the Main Dashboard, but with a pop up modal in the middle with the dashboard in the background grayed out.

    - The modal should have curved corners and a nice amount of padding inside. All modal windows should have the same style.

    - All form fields in every modal should be styled as just a line on the bottom with a 1px purple stroke

    - This pop up modal has the following items:

        - New Project: opens the new project modal

        - Open Project: opens the saved projects modal, allowing the user to click on one to load it.

        - Writer Model Factory: Loads the writer model factory modal.

        - Brief Builder: Loads the Brief Builder modal

        - User Guide: Loads a modal with an AI-updated User Guide. Should have a table of contents and search box on the left side, and the guide content on the right.

- If user chooses New Project:

    - The new project modal opens. It guides the user through setting up a new project, with one single step/question displaying in the modal at a time. When the user answers each question and presses the Next button, the existing question slides off the left and the next question slides in to take its place.

    - Rule: Only display the text after the "Question x:" text and the form field for it.

        - Question 1: What is the name of your new project?

        - Question 2: What is the H1 for your content?

        - Question 3: What is the primary keyword?

        - Question 4: What are the secondary keywords? (Separate each with a comma)

        - Question 5: Write any more details about the content you want the Writing Engine to take into consideration

    - After the user presses next on question 5 modal, the Writer Model selector modal slides in. The user can choose from any of the existing writer models created in the Writer Model Factory. Next to each model name should be the % trained number. The user chooses their model and hits Next.

        - If the logged in user has a model based on them, it is auto selected for them. They can still choose a different model, though.

    - Next is the Brief Chooser dropdown, with all created briefs listed. There should also be a Plus icon that when clicked opens the brief builder modal on top of the current modal, allowing them to build and save a new brief. Upon saving, the brief builder window disappears, revealing the Brief Chooser dropdown modal again. The new brief that they just created is in the drop down selector and is auto selected.

    - The user clicks next, and a new screen slides in that asks how many words the story should be.

    - The user clicks Next, and the brief chooser slides to the left. A new box slides in from the right containing all of the answers to the questions the user has just answered. It asks the user to confirm that everything looks correct. They can press Go Back to return through each screen to correct any incorrect information, or they can click Start Project to close the setup modal and reveal the dashboard.

- When the Start Project button is pressed, the AI packages up all the project information the user filled out and imports it into the dashboard, where it is displayed on the left sidebar, at the top. The user can inline edit any of that information. The user also sees the tiptap Editor in the center of the screen.

- On the right hand sidebar, the user sees:

    - Writer Model: <chosen writer model from setup>

    - Brief Name: <chosen brief type from setup>

    - A dividing line

    - Under the dividing line is the SEO Wizard section. 

        - Before content has been generated for the first time, the only item in the SEO Wizard section is a button that says Analyze SEO Package. When pressed, the button sends the SEO Package (read docs/SEO-package.md for more information), the selected Writer Model and the Brief to Claude via API. Claude conducts an analysis on the information in the package and then uses the Writer Model and Brief to populate the SEO Wizard, which is located directly under the Analyze SEO Package button on the right sidebar.
    
        You will use the following two files to build the SEO Wizard:
                    - docs/seo-sidebar-build-instructions.md
                    - docs/claude-instructions-seo-sidebar.md
        
        When the AI populates the SEO Wizard for the first time, the Analyze SEO Package button disappears. The full SEO Wizard replaces it. Since there's no content on the Editor yet, the SEO Meter will be greyed out, but the other elements in the Wizard will be populated (such as suggested keywords, suggested word count, suggested number of headings, suggested paragraphs and suggested image count. Because the Editor has no text on it yet, only the suggestions will be showing and not the content data that will show once there's text in the Editor

        - The user can now select keywords from the suggested keywords area. These selected keywords are added to the SEO Package the moment they are clicked. If they are de-selected, they are removed from the SEO Package.

    - When the user is happy with their selected keywords, they click the Create Content button underneath the SEO Meter. At this point, the SEO package, the writer model and the brief are analyzed by the AI via API. The model uses all of that data and produces written SEO-optimized content using the voice, style and tone of the writer the Writer Model is trained on, and using the Brief as the template. This generated content fills the Editor canvas.

            The Generated content MUST follow the brief. If the brief has 4 H2's and 6 H3's, the generated content must have the same

    - When the content is added to the Editor, the SEO Meter is activated and a number assigned showing how optimized the content is on a scale of 0-100. The meter changes in real-time as the user makes edits in the Editor.

    - The SEO Meter score, headline and keyword suggestions tools should be constantly optimized to reflect the latest changes in google's SEO best practices and algorithm changes.

- When the user is happy with the content, they can click an export icon in the bottom left of the right toolbar and choose to export the content in the editor as rich text, Microsoft word, plain text or markdown.

- If the user wants to return to continue working on the project, they should be able to click a save project button. This saves everything on the screen in its exact current state. The user should be able to name this save file. These saved files appear in the Open Project function in the modal that appears when the app is launched or visited.
