# Forge - User Flows & Journeys

**Repository:** https://github.com/verygooddesigners/forge  
**Date:** February 17, 2026

---

## 👥 User Personas

### 1. Content Strategist (Primary User)
**Role:** Creates sports betting content  
**Goals:** Produce high-quality, SEO-optimized articles quickly  
**Pain Points:** Time-consuming research, maintaining consistent voice, SEO optimization  
**Tech Savvy:** Medium to High

### 2. Administrator
**Role:** Manages system, users, and configuration  
**Goals:** Maintain system health, manage users, configure AI  
**Pain Points:** Complex configuration, monitoring usage  
**Tech Savvy:** High

### 3. Writer/Editor
**Role:** Edits and refines AI-generated content  
**Goals:** Polish content, ensure accuracy, meet deadlines  
**Pain Points:** Editing workflow, fact-checking  
**Tech Savvy:** Medium

---

## 🎯 Primary User Flow: Content Creation

**User:** Content Strategist  
**Goal:** Create a new sports betting article  
**Frequency:** Daily (multiple times)  
**Duration:** 15-30 minutes

### Flow Diagram

```
[Dashboard] → [Create Project] → [Select Writer Model] → [Choose SmartBrief] → 
[Set Keywords] → [Generate Content] → [Edit in Editor] → [SEO Optimization] → 
[Export] → [Publish to CMS]
```

### Detailed Steps

#### Step 1: Dashboard Entry
**Screen:** `/dashboard`  
**Components:** DashboardLayout, DashboardHome  
**Actions:**
- User logs in
- Sees dashboard home
- Views recent projects
- Clicks "Create New Project"

**Design Considerations:**
- Quick access to "Create Project" button
- Recent projects visible immediately
- Clear call-to-action
- Minimal friction to start

---

#### Step 2: Project Creation
**Screen:** ProjectCreationModal  
**Components:** ProjectCreationModal  
**Actions:**
- Modal opens
- User enters project name
- Selects writer model from dropdown
- Chooses SmartBrief template
- Enters target keywords
- Clicks "Create Project"

**Current Pain Points:**
- Modal can feel disconnected
- Multi-step form in single view
- Unclear what each choice means
- No preview of selections

**Design Opportunities:**
- Multi-step wizard?
- Preview of writer model style
- Preview of SmartBrief structure
- Inline help/tooltips
- Progress indicator

---

#### Step 3: Writer Model Selection
**Screen:** Within ProjectCreationModal  
**Components:** Select dropdown  
**Actions:**
- User opens writer model dropdown
- Sees list of trained models
- Reads model descriptions
- Selects preferred model

**Current Pain Points:**
- Simple dropdown doesn't show enough info
- No preview of writing style
- Can't see training data
- Hard to compare models

**Design Opportunities:**
- Card-based selection
- Style preview/sample
- Training data stats
- Model comparison view

---

#### Step 4: SmartBrief Selection
**Screen:** Within ProjectCreationModal  
**Components:** Select dropdown  
**Actions:**
- User opens SmartBrief dropdown
- Sees list of templates
- Reads template descriptions
- Selects template

**Current Pain Points:**
- Dropdown doesn't show structure
- No template preview
- Can't see example output
- Limited filtering

**Design Opportunities:**
- Visual template cards
- Structure preview
- Example output
- Category filtering
- Search functionality

---

#### Step 5: Keyword Entry
**Screen:** Within ProjectCreationModal  
**Components:** Input field  
**Actions:**
- User enters target keywords
- Comma-separated list
- Sets SEO targets

**Current Pain Points:**
- Simple text input
- No keyword suggestions
- No validation
- Unclear format

**Design Opportunities:**
- Tag input component
- Keyword suggestions
- SEO difficulty indicator
- Format validation

---

#### Step 6: Content Generation
**Screen:** EditorPanel  
**Components:** EditorPanel, TipTapEditor  
**Actions:**
- Project created
- Dashboard switches to EditorPanel
- AI generates content (streaming)
- User sees content appear in real-time

**Current Pain Points:**
- No clear loading state
- Streaming can be slow
- No progress indicator
- Can't cancel generation

**Design Opportunities:**
- Better loading animation
- Progress indicator
- Streaming visualization
- Cancel button
- Estimated time

---

#### Step 7: Content Editing
**Screen:** EditorPanel  
**Components:** EditorPanel, TipTapEditor, EditorToolbar  
**Actions:**
- User reads generated content
- Makes edits and refinements
- Uses toolbar for formatting
- Adds/removes sections
- Auto-save triggers

**Current Pain Points:**
- Editor can feel cramped
- Toolbar takes up space
- Distracting elements
- No distraction-free mode

**Design Opportunities:**
- More spacious editor
- Collapsible toolbar
- Distraction-free mode
- Better typography
- Focus mode

---

#### Step 8: SEO Optimization
**Screen:** EditorPanel + SEOOptimizationSidebar  
**Components:** SEOOptimizationSidebar  
**Actions:**
- User checks SEO score (right sidebar)
- Reviews keyword usage
- Sees optimization suggestions
- Makes adjustments
- Watches score update in real-time

**Current Pain Points:**
- Sidebar can be overlooked
- Dense information
- Unclear priorities
- No guided optimization

**Design Opportunities:**
- More prominent SEO feedback
- Visual score indicator
- Priority-based suggestions
- Inline keyword highlighting
- Optimization wizard

---

#### Step 9: Export
**Screen:** ExportModal  
**Components:** ExportModal  
**Actions:**
- User clicks "Export" button
- Modal opens with safety warning
- User acknowledges warning
- Chooses export format
- Copies or downloads content

**Current Pain Points:**
- Modal interrupts flow
- Warning can be ignored
- Limited export options

**Design Opportunities:**
- Less intrusive export
- Better warning design
- More export formats
- Export history
- Direct CMS integration

---

#### Step 10: Publish
**Screen:** External (CMS)  
**Actions:**
- User pastes into CMS
- Final review
- Publishes article

**Future Opportunities:**
- Direct CMS integration
- One-click publish
- Preview in CMS format

---

### Success Metrics

- **Time to First Draft:** < 5 minutes
- **Total Time:** 15-30 minutes (vs. 2-3 hours manual)
- **User Satisfaction:** High
- **SEO Score:** > 80/100
- **Completion Rate:** > 90%

---

## 🏭 Secondary Flow: Writer Model Training

**User:** Content Strategist  
**Goal:** Train a new AI writer model  
**Frequency:** Weekly or as needed  
**Duration:** 10-20 minutes (plus training time)

### Flow Diagram

```
[Dashboard] → [Writer Factory] → [Upload Articles] → [Configure Settings] → 
[Start Training] → [Monitor Progress] → [Test Generation] → [Save Model]
```

### Detailed Steps

#### Step 1: Access Writer Factory
**Screen:** `/dashboard` or `/writer-factory`  
**Components:** WriterFactoryPanel  
**Actions:**
- User clicks "Writer Factory" in sidebar
- Dashboard switches to WriterFactoryPanel
- Or navigates to dedicated page

**Design Considerations:**
- Clear entry point
- Prominent in navigation
- Quick access from dashboard

---

#### Step 2: Create New Model
**Screen:** WriterFactoryPanel  
**Components:** WriterFactoryPanel  
**Actions:**
- User clicks "Create New Model"
- Form appears
- Enters model name
- Enters description

**Current Pain Points:**
- Form appears inline
- No clear workflow
- Unclear requirements

**Design Opportunities:**
- Wizard-style flow
- Clear requirements
- Progress indicator
- Help text

---

#### Step 3: Upload Training Articles
**Screen:** WriterFactoryPanel  
**Components:** File upload area  
**Actions:**
- User uploads articles (txt, md, or docx)
- Multiple file upload
- Sees file list
- Can remove files

**Current Pain Points:**
- Basic file upload
- No preview
- No validation
- Unclear file requirements

**Design Opportunities:**
- Drag-and-drop upload
- File preview
- Content validation
- Suggested file count
- Quality indicators

---

#### Step 4: Configure Training
**Screen:** WriterFactoryPanel  
**Components:** Settings form  
**Actions:**
- User sets training parameters
- Selects AI model
- Sets tone/style preferences
- Reviews settings

**Current Pain Points:**
- Technical parameters
- No guidance
- Unclear impact

**Design Opportunities:**
- Simplified settings
- Preset configurations
- Visual examples
- Impact preview

---

#### Step 5: Start Training
**Screen:** WriterFactoryPanel  
**Components:** Training progress  
**Actions:**
- User clicks "Start Training"
- Training begins
- Progress bar shows status
- Estimated time displayed

**Current Pain Points:**
- Long wait time
- No background training
- Can't leave page

**Design Opportunities:**
- Background training
- Email notification
- Progress notifications
- Cancel/pause option

---

#### Step 6: Test Generation
**Screen:** WriterFactoryPanel  
**Components:** Test generation area  
**Actions:**
- Training completes
- User enters test prompt
- Generates sample content
- Reviews output quality

**Current Pain Points:**
- Limited testing
- No comparison
- Hard to evaluate

**Design Opportunities:**
- Multiple test prompts
- Side-by-side comparison
- Quality metrics
- A/B testing

---

#### Step 7: Save Model
**Screen:** WriterFactoryPanel  
**Components:** Save confirmation  
**Actions:**
- User satisfied with results
- Clicks "Save Model"
- Model added to library
- Available for projects

**Design Considerations:**
- Clear success state
- Next steps
- Quick access to use model

---

### Success Metrics

- **Training Success Rate:** > 95%
- **Time to Train:** < 10 minutes setup
- **Model Quality:** User satisfaction > 85%
- **Reuse Rate:** Models used in multiple projects

---

## 📝 Tertiary Flow: SmartBrief Creation

**User:** Content Strategist  
**Goal:** Create a reusable content template  
**Frequency:** Weekly or as needed  
**Duration:** 15-30 minutes

### Flow Diagram

```
[Dashboard] → [SmartBriefs] → [Create New] → [Define Structure (Tab 1)] → 
[Configure AI (Tab 2)] → [Add Examples] → [Test Template] → [Save]
```

### Detailed Steps

#### Step 1: Access SmartBriefs
**Screen:** `/dashboard` or `/smartbriefs`  
**Components:** SmartBriefPanel  
**Actions:**
- User clicks "SmartBriefs" in sidebar
- Sees list of existing briefs
- Clicks "Create New Brief"

---

#### Step 2: Tab 1 - Content Structure
**Screen:** BriefBuilderModal (Tab 1)  
**Components:** BriefBuilderModal  
**Actions:**
- User defines content structure
- Adds sections with placeholders
- Uses markdown-style syntax
- Sees live preview

**Current Pain Points:**
- 2-tab interface can be confusing
- Markdown syntax not intuitive
- No visual editor
- Limited preview

**Design Opportunities:**
- Visual template builder
- Drag-and-drop sections
- WYSIWYG editor
- Better preview
- Template library

---

#### Step 3: Tab 2 - AI Configuration
**Screen:** BriefBuilderModal (Tab 2)  
**Components:** BriefBuilderModal  
**Actions:**
- User switches to Tab 2
- Writes AI instructions
- Adds example URLs
- Sets generation parameters

**Current Pain Points:**
- Separate tab disconnects from structure
- Unclear how instructions affect output
- No validation

**Design Opportunities:**
- Inline AI configuration
- Contextual help
- Example templates
- Instruction validation
- Preview with AI

---

#### Step 4: Add Example URLs
**Screen:** BriefBuilderModal (Tab 2)  
**Components:** URL input list  
**Actions:**
- User adds example URLs
- AI analyzes URLs
- Extracts patterns
- Improves generation

**Current Pain Points:**
- Simple text inputs
- No URL validation
- No preview of extracted data
- Unclear benefit

**Design Opportunities:**
- URL validation
- Content preview
- Pattern extraction display
- Quality indicators

---

#### Step 5: Test Template
**Screen:** BriefBuilderModal  
**Components:** Test generation  
**Actions:**
- User tests template
- Generates sample content
- Reviews output
- Iterates on template

**Current Pain Points:**
- Limited testing
- No comparison
- Hard to iterate

**Design Opportunities:**
- Quick test button
- Multiple test runs
- Version comparison
- Iteration history

---

#### Step 6: Save Template
**Screen:** BriefBuilderModal  
**Components:** Save form  
**Actions:**
- User satisfied with template
- Enters name and description
- Selects category
- Saves template

**Design Considerations:**
- Clear success state
- Template library updated
- Quick access to use

---

### Success Metrics

- **Template Creation Time:** < 30 minutes
- **Template Reuse:** > 5 uses per template
- **Template Quality:** Consistent output
- **User Satisfaction:** > 85%

---

## 👨‍💼 Admin Flow: User Management

**User:** Administrator  
**Goal:** Manage user accounts  
**Frequency:** As needed  
**Duration:** 5-10 minutes per task

### Flow Diagram

```
[Admin Dashboard] → [User Management] → [View Users] → 
[Create/Edit/Deactivate] → [Assign Roles] → [Save]
```

### Detailed Steps

#### Step 1: Access Admin
**Screen:** `/admin`  
**Components:** AdminDashboard  
**Actions:**
- Admin logs in
- Navigates to /admin
- Sees admin dashboard
- Clicks "User Management"

---

#### Step 2: View Users
**Screen:** UserManagement  
**Components:** UserManagement table  
**Actions:**
- Sees table of all users
- Can search/filter
- Views user details
- Checks user status

**Current Pain Points:**
- Dense table
- Limited filtering
- No bulk actions
- Mobile unfriendly

**Design Opportunities:**
- Better table design
- Advanced filtering
- Bulk operations
- User cards view
- Mobile-responsive

---

#### Step 3: Create User
**Screen:** UserManagement  
**Components:** Create user form  
**Actions:**
- Clicks "Create User"
- Enters user details
- Assigns role
- Sets permissions
- Sends invite

**Design Considerations:**
- Clear form
- Role descriptions
- Permission preview
- Email validation

---

#### Step 4: Edit User
**Screen:** UserManagement  
**Components:** Edit user form  
**Actions:**
- Clicks edit on user row
- Modifies details
- Changes role
- Updates permissions
- Saves changes

**Design Considerations:**
- Inline editing?
- Change history
- Confirmation
- Audit log

---

#### Step 5: Deactivate User
**Screen:** UserManagement  
**Components:** Confirmation dialog  
**Actions:**
- Clicks deactivate
- Confirms action
- User deactivated
- Access revoked

**Design Considerations:**
- Clear warning
- Reversible action
- Notification sent
- Audit trail

---

### Success Metrics

- **Task Completion Time:** < 5 minutes
- **Error Rate:** < 5%
- **Admin Satisfaction:** High

---

## 🤖 Admin Flow: AI Agent Configuration

**User:** Administrator  
**Goal:** Configure AI agent behavior  
**Frequency:** Weekly or as needed  
**Duration:** 10-20 minutes

### Flow Diagram

```
[Admin Dashboard] → [Agent Tuner] → [Select Agent] → [Edit Prompt] → 
[Adjust Parameters] → [Test] → [Save]
```

### Detailed Steps

#### Step 1: Access Agent Tuner
**Screen:** `/admin`  
**Components:** AgentTuner  
**Actions:**
- Admin navigates to Agent Tuner
- Sees list of 8 agents
- Views current configuration

---

#### Step 2: Select Agent
**Screen:** AgentTuner  
**Components:** Agent list  
**Actions:**
- Clicks on agent to configure
- Sees agent details
- Views current prompt
- Checks parameters

**Current Pain Points:**
- 8 agents to manage
- Complex interface
- No visual organization

**Design Opportunities:**
- Agent cards
- Visual grouping
- Quick stats
- Status indicators

---

#### Step 3: Edit System Prompt
**Screen:** AgentTuner  
**Components:** Prompt editor  
**Actions:**
- Edits system prompt
- Uses markdown
- Adds instructions
- Sets behavior

**Current Pain Points:**
- Large text area
- No syntax help
- Hard to organize
- No templates

**Design Opportunities:**
- Code editor
- Syntax highlighting
- Prompt templates
- Version control
- Prompt library

---

#### Step 4: Adjust Parameters
**Screen:** AgentTuner  
**Components:** Parameter sliders  
**Actions:**
- Adjusts temperature
- Sets max tokens
- Configures guardrails
- Sets special configs

**Current Pain Points:**
- Technical parameters
- Unclear impact
- No guidance

**Design Opportunities:**
- Visual parameter controls
- Impact preview
- Presets
- Explanatory tooltips

---

#### Step 5: Test Agent
**Screen:** AgentTuner  
**Components:** Test panel  
**Actions:**
- Enters test prompt
- Generates test output
- Reviews response
- Iterates configuration

**Current Pain Points:**
- Limited testing
- No comparison
- Hard to evaluate

**Design Opportunities:**
- Side-by-side testing
- Before/after comparison
- Test suite
- Quality metrics

---

#### Step 6: Save Configuration
**Screen:** AgentTuner  
**Components:** Save confirmation  
**Actions:**
- Saves changes
- Configuration applied
- All users affected
- Audit log updated

**Design Considerations:**
- Clear impact warning
- Rollback option
- Change history
- Notification

---

### Success Metrics

- **Configuration Time:** < 20 minutes
- **Agent Performance:** Improved output quality
- **Error Rate:** < 5%

---

## 🔄 Common User Patterns

### Pattern 1: Quick Content Creation
**Frequency:** Daily  
**Duration:** 15 minutes

```
Login → Dashboard → Create Project → Generate → Quick Edit → Export
```

**Optimization Opportunities:**
- One-click project creation with defaults
- Quick templates
- Keyboard shortcuts
- Streamlined export

---

### Pattern 2: Content Iteration
**Frequency:** Daily  
**Duration:** 30-60 minutes

```
Dashboard → Open Project → Edit → Regenerate Section → Edit → SEO Check → Export
```

**Optimization Opportunities:**
- Better version control
- Section regeneration
- Undo/redo
- Auto-save improvements

---

### Pattern 3: Batch Content Creation
**Frequency:** Weekly  
**Duration:** 2-4 hours

```
Create Multiple Projects → Generate All → Batch Edit → Batch Export
```

**Optimization Opportunities:**
- Batch project creation
- Queue system
- Bulk operations
- Progress tracking

---

### Pattern 4: Model Training & Testing
**Frequency:** Weekly  
**Duration:** 1-2 hours

```
Writer Factory → Upload → Train → Test → Iterate → Save → Use in Project
```

**Optimization Opportunities:**
- Background training
- Better testing tools
- Quick iteration
- Model comparison

---

## 📊 User Journey Map

### New User Journey

**Day 1: Onboarding**
1. Receives invite email
2. Creates account
3. Sees welcome modal
4. Takes guided tour
5. Creates first project
6. Generates first content

**Week 1: Learning**
1. Creates multiple projects
2. Explores features
3. Trains first writer model
4. Creates first SmartBrief
5. Learns SEO tools

**Month 1: Proficiency**
1. Daily content creation
2. Custom workflows
3. Advanced features
4. Efficient patterns
5. High productivity

**Month 3+: Expert**
1. Optimized workflows
2. Custom models
3. Template library
4. Batch operations
5. Maximum efficiency

---

## 🎯 Key Takeaways for Design

### High-Priority Improvements

1. **Simplify Project Creation**
   - Reduce steps
   - Better previews
   - Clearer choices

2. **Enhance Editor Experience**
   - More space
   - Better tools
   - Focus mode

3. **Improve SEO Integration**
   - More prominent
   - Better guidance
   - Real-time feedback

4. **Streamline Modals**
   - Less intrusive
   - Better flow
   - Clearer purpose

5. **Better Admin Tools**
   - Cleaner tables
   - Better forms
   - Bulk operations

### Design Principles

1. **Reduce Friction** - Fewer clicks, clearer paths
2. **Provide Context** - Help users understand choices
3. **Show Progress** - Clear feedback on actions
4. **Enable Speed** - Keyboard shortcuts, quick actions
5. **Support Learning** - Inline help, examples, tooltips

---

**Last Updated:** February 17, 2026  
**Repository:** https://github.com/verygooddesigners/forge
