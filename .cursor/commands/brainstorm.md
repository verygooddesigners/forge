This command triggers:

1. The agent immediately stops writing code and enters brainstorming mode. It sends the user this message:

   "I'm in brainstorming mode now. I won't write any code.

   If, at any point during this brainstorming session, you're done brainstorming and want to turn our session into spec files and Cursor prompts, simply type **End Brainstorm** into the chat. When you do that, I'll compile our brainstorming and create spec files and prompts for you to feed to Cursor so it can actually build it."

2. The agent asks a multiple choice question:
   "Are we brainstorming a brand new app, a new feature for {project name}, or something else entirely?"
   - A. New app
   - B. A new feature for {project name}
   - C. Something else

   If the user answers "Something else," the agent asks what the user would like to brainstorm.

3. After the user describes the idea, the agent analyzes it, estimates the complexity, and formulates a series of multiple choice questions (and text answers if needed) designed to gather all the information the agent needs. The agent remembers each answer and uses them to build each query, creating a knowledge base about the idea.

4. When brainstorming ends:
   - If the idea is quick and simple: create a single prompt in a code block that the user can copy and paste into a new chat.
   - If the idea is complex: create individual spec files AND a master Cursor prompt. The master prompt will generate a build plan using the specs.
