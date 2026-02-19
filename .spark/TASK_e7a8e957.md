# CLAUDE CODE: START TASK IMMEDIATELY

You are now working on this task. Begin implementation immediately without waiting for user input.

---

# Task: Major UI/Admin/Permissions/Roles overhaul

**Status:** to_do
**Priority:** critical
**Feature Area:** General
**Task ID:** e7a8e957-6c4b-4498-999b-3e25490a9d9b
**Project:** Forge

## Description

## UI Revamp
We need to revamp and refine the user UI. 
First, let’s assign names to the various elements of the UI so I can stop saying things like “the menu that’s on the far left sidebar.
We may have already named these in the past, but the names I’m about to give you will replace any existing ones. 

## UI ELEMENT NAMES

- **Container**: The main container that contains the left sidebar, middle container (where the Editor, SmartBrief Editor and Project/SmartBrief file editor exist) and right hand sidebar. 
- **MenuBar**: The Far left column that contains the app logo at the top, NavMenu right underneath the logo, and aligned to the bottom and separated by a light thin line, a box (ProfileMenuBox).
- **ProfileMenuBox**: Aligned to the left is the user’s profile photo in a square shape with soft rounded corners. Next to the photo is their full name, or if they didn’t fill out their full name, it displays their email address. Underneath their name/email is their currently assigned role. On tbe right side of the box, aligned vertically, is an up arrow icon. When pressed, it opens the UserProfileMenu by expanding up. 
- **UserProfileMenu**: Visually, it should look like the ProfileMenuBox moved upwards, with the UserProfileMenu opening underneath it. The UserProfileMenu has the following links:
	- **Profile**: Leads to the user’s Profile Screen, which can be edited by clicking the Edit Profile buttton in the top right corner. The profile shows their profile photo, email address, Full name (optional), current role (cannot be edited by the user).
	- **Writer Model:** This links the user directly to their assigned Writer Model screen, where they can train their model. Users with assigned writer models cannot access any other user writer models, but they can access Community Writer Models, which are available to everyone. You will need to enhance the Writer Model system so that Administrators and Super Administrators can assign specific writer models to user accounts. This will be handled in the new admin Dashboard which you will build in the next task I give you. 
	- **Settings**: this takes the user to their settings screen, which should be filled with settings like: Perhaps we allow the user to set their default view mode, like dark mode or light mode.At some point, maybe we have a theme picker where they can pick from different color schemes. _I'd like you to suggest some more settings, taking into account the entirety of the app. Suggest some more user settings that can be on the screen. _

## MENUBAR

### LINKS

- **Projects**: This links to the project file browsing screen. The top section is called "My Projects", and it displays the projects that the user has created. The bottom section is called "Shared Projects", and it displays projects that other users have chosen to share. 
- **SmartBriefs**: this links to the Smart Briefs screen, which should feature, on the top left, a link to the user guide "How to Create Smart Briefs", which we already have built. On the top right, it should have a button that says "Create New SmartBrief". Underneath that, should be a file listing of all created SmartBriefs. It should show the user’s SmartBriefs  in a section called "My SmartBriefs", and then underneath that, should be a section called "Shared SmartBriefs", where SmartBriefs that are shared by other users are listed. All of these project listings or SmartBrief listings are listed as cards with a title and description. By default, they should be displayed with the last modified SmartBrief displaying first, then going down in order of modification. But we also need icons for sorting by last modified, date created, etc. We will also need a minimalistic search box next to the sort icon that allows the user to search for a specific SmartBrief. 
	- All of the above should apply to the Projects screen, too. It needs the same sort icon and search bar. 
	- We’ll need to revamp the SmartBrief.  creation system so that the user can write in a title and a description for it so that it displays on the file browser part. 
- **User Guide:** this links to the stand-alone user guide, which is updated every time a change to the code is made.
- **Tools:** Coming Soon; link displayed but inactive. 
- **Admin**: this link only appears if the user that’s logged in has team leader, manager, admin, or super admin roles. When clicked, it expands another menu column out from the right of the MenuBar. This is called the AdminMenu.

## ADMIN MENU

The AdminMenu only displays the Admin links that are available to the logged in user’s role. But here is a complete listing of all Admin links/screens - all of these will be viewable by the super admin which is me. 

1. User account management. This leads to the user account management screen where admins can see all users, all teams, edit all users, and create and edit teams. They create and edit teams by dragging and dropping user accounts onto teams.
2. AI tuning. This leads to the AI tuning screen where administrators can tune the master AI and then each individual AI agent that works in concert. These screens already exist; we just need to overhaul the UI so they fit with this new format. 
3. API key management: this is a screen where the super administrator puts in all API keys that are needed by the app. 
4. User role wizard. This screen is a new one, and it should give the super administrator the ability to assign permissions and rights to every role. This includes creating new roles.   
	  
	While building this, get rid of any permission system or roles that are already in the app. Eliminate all code referring to roles and permissions - we’re starting from scratch, and I will create the roles using this admin system.   
	  
	To assign permissions and rights to a role, I would click on the role name, like Manager, and it would open up a dashboard that has toggles for every conceivable thing, permission, right that I would want to assign to them. I could easily assign and take away rights for that role simply by clicking the toggle. 
Like:
- Can they create new teams?
- Can they mess with the AI tuners?
- Can they edit user accounts?
- Which AdminMenu tools can they access? 

I need you to go through the code base and come up with a list of all of these different permissions that can be assigned to each user role.   
  
I should also be able to assign user roles on a per-user level and not just on a team or division level, so make it so, in the User Management admin screen, when I click on a user to edit then, there’s a section at the bottom where I can assign them roles and then also have all of the permissions toggles from the Role Wizard so I can edit each user’s permissions individually if I want. 

5. **Tools management.** This is for the future when we integrate the ability for people to develop tools/plug-ins to extend the capabilities of Forge. This screen would be where I’m able to see submitted tools, test them out, and approve them. 
6. Odds API Management. We haven’t built this yet, but I am going to integrate our own internal sports odd APIs so that content is generated and can pull the latest odds and data. This screen would be where I manage that odds API. 
7. SSO Management. We haven’t integrated this yet, but at some point I’m going to integrate Microsoft Azure Single Sign-On into Forge. This would be where I manage that. This screen should allow me to map user roles to existing roles and permissions inside of our Single Sign-On structure. 

And then I need you to think of any possible thing I would need in the admin menu and add them yourself. If I don’t like them, I will have you delete them.

## Tech Stack
{
  "ai": "Grok API (Claude-ready)",
  "ui": "Shadcn UI",
  "auth": "Supabase Auth",
  "editor": "TipTap",
  "styling": "Tailwind CSS",
  "database": "Supabase PostgreSQL + pgvector",
  "language": "TypeScript",
  "framework": "Next.js 16",
  "workspace": "GDC",
  "deployment": "Vercel"
}

---

## Your Instructions

**START WORKING NOW.** Complete this task by:

1. Reading relevant files from this codebase
2. Understanding the current implementation
3. Writing/updating code to complete the task
4. Testing your changes logically
5. **CRITICAL**: When done, mark the task complete (see below)

**Important:**
- This is a critical priority task
- Write production-quality code
- Follow the project's existing patterns
- Be thorough and test your logic

### Mark Task Complete (REQUIRED)

When you finish this task, you **MUST** call the Spark MCP tool so the task card moves to Done in Spark.

The MCP tool is named **mcp__spark__spark_update_task**. Call it with these parameters:
- task_id: "e7a8e957-6c4b-4498-999b-3e25490a9d9b"
- updates: {"status": "done"}

This is an MCP tool call — invoke the tool directly, do NOT just write it in a comment or code block.
The Spark UI polls every few seconds and the task card will move to Done automatically.

**BEGIN IMPLEMENTATION NOW.**
