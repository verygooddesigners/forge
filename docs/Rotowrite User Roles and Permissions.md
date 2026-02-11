# ROTOWRITE USER ROLES

## SYNOPSIS

This document outlines the user roles that are assignable in the public release of RotoWrite

## ADMIN ROLES

### Super Administrator

#### PERMISSIONS & FEATURES

- This role is only assigned to one person - <jeremy.botter@gdcgroup.com>
- Can access everything, including the Master AI tuning control - this control manages how the individual AI engines operate with each other.
- Can install and deploy plugins (RotoWrite Tools) when Teams request them. RotoWrite has a plugin system that allows others to develop and extend the main RotoWrite application. Anyone may create and upload Tools, but each Tool must be tested before activation is allowed. Because this feature is so closely intertwined with the codebase, only the Super Admin should have access.

### ADMINISTRATOR

- Can create and edit new departments and then Teams inside those departments.
Example:
- Local (department)
 	- Automation (team)
 	-

#### PERMISSIONS & FEATURES

- Can access the Admin Panel and the following sub-panels inside Admin. *NOTE* Any changes made by the admin to the AI Agents using the Admin panel should be for THEIR DEPARTMENT ONLY. Each department is siloed and essentially has their own version of RotoWrite that does not affect any other versions used by other departments.

    - User Management (For their department only)
    - AI Tuner
    - AI Helper Bot Configuration
        - This allows them to create new Q&A entries for their teams
    - AI Agents
        - Allows them to create roles and instructions for each AI agent. *NOTE* There needs to be documentatio0n on how to adjust each AI Agent available in the Documentation/User Guide. At the top of each AI Agent, there should be a link that goes directly to a page in the guide with detailed instructions and examples on how to adjust that agent. 
    - Trusted Sources

### MANAGER

The top permission level available in each Department. Managers are the department leaders.

- Can access the Admin

### EDITOR

The Editors are the leaders of each team inside a department.

- Can access the Admin Panel and the following sub-panels inside Admin.

*NOTE* Any changes made by the admin to the AI Agents using the Admin panel should be for THEIR DEPARTMENT ONLY. Each department is siloed and essentially has their own version of RotoWrite that does not affect any other versions used by other departments.

  - User Management (For their department only)
  - AI Tuner
  - AI Helper Bot Configuration
    - This allows them to create new Q&A entries for their teams
  - AI Agents
    - Allows them to create roles and instructions for each AI agent. 

    *NOTE* There needs to be documentatio0n on how to adjust each AI Agent available in the Documentation/User Guide. At the top of each AI Agent, there should be a link that goes directly to a page in the guide with detailed instructions and examples on how to adjust that agent.

  - Trusted Sources

### CONTENT CREATOR

This role is assigned to a user who will primarily be using RotoWrite to create content. 

- Create, edit and delete Projects
- Train their own writer model
- Use Tools that have been authorized by their 

## ADD-ONS

### DEVELOPER

- Developer exists as an add-on to all other roles. It’s turned off by default. To turn on, a Super Admin or Admin can check a box on any user account profile in the Admin screen. Once that box is checked, the user will have the ability to upload new Tools (plugins)in the Tools market and access the Developer documentation. 
