# Forge AI Agent Transition 

Your idea of transitioning from a single API to specialized agents for distinct functionalities is a strategic approach, especially in complex systems where modularity, scalability, and feature-specific optimization are essential. Each agent can be tailored to excel in its assigned task, leveraging models that are optimized for specific domains or functionalities. Here’s how I would architect this transition and suggest breaking it down into specialized agents and their corresponding models:

I am transitioning Forge from its current AI architecture (where one model handles all AI tasks) to a system utilizing six agents, each focused on a particular feature or function. 
1. Content Generation Agent
2. AI Writer Model and Training Agent
3. SEO Optimization Agent
4. Content Quality Assurance/Editing Agent
5. Persona and Tone Customization Agent
6. Creative Feature Agents (Optional, Modular Add-ons)

Please use the following doc to build a Plan for executing this change. 
As this is a major change, I think we need to make a new branch for developing it. Once we are done building, you will turn the new branch into the main live production branch. 
- Do not push to Vercel or GitHub unless instructed to. 
- if to have questions for me, ask them one at a time. 
---

### Suggested Architecture:
#### **1. Content Generation Agent**
   - **Role:**
     - Generate high-quality content, adapting to different tones and styles.
     - Process structured data (from Visual Data Extraction Agent) to build formatted articles with tables, headers, and organized sections.
     - Work with RAG-based writer models to maintain consistent voice across all content types.
   - **Model:**
     - **Claude Sonnet 4:** Known for its nuanced creative writing, adaptability, and excellent structured content formatting.
     - **Optional Additional Model:** Fine-tune an LLM like GPT-4o if the need arises for specific voice or tone settings.

#### **2. AI Writer Model and Training Agent**
   - **Role:**
     - Analyze writing samples to extract style characteristics (tone, voice, vocabulary, sentence structure).
     - Generate vector embeddings for RAG-based style matching.
     - Manage and refine AI writing models for consistent output.
   - **Model:**
     - **Claude Sonnet 4:** Style analysis, pattern extraction, consistent JSON output.
     - **OpenAI text-embedding-3-small:** Vector embeddings for RAG similarity search (best-in-class embeddings model).

#### **3. SEO Optimization Agent**
   - **Role:**
     - Analyze content for SEO metrics (keyword density, heading structure, readability).
     - Generate keyword suggestions and LSI terms.
     - Provide optimization recommendations and internal linking suggestions.
   - **Model:**
     - **Claude Sonnet 4:** Content analysis, keyword understanding, optimization suggestions.
     - **Optional Enhancement:** Clearscope or Surfer SEO integration ($500+/month) for advanced competitive analysis.

#### **4. Content Quality Assurance/Editing Agent**
   - **Role:**
     - Review content for grammar, spelling, tone, readability, and coherence.
     - Suggest corrections while maintaining writer voice.
     - Flag inconsistencies and fact structure issues.
   - **Model:**
     - **Claude Sonnet 4:** Substantive editing, style consistency, voice preservation.
     - **LanguageTool API (FREE):** Technical grammar and spelling verification as secondary check.

#### **5. Persona and Tone Customization Agent**
   - **Role:**
     - Adapt content to specific voices, tones, and personas.
     - Ensure style consistency with writer model profiles.
     - Refine language choices to match brand guidelines.
   - **Model:**
     - **Claude Sonnet 4:** Industry-leading tone control, nuanced persona adaptation, style matching.

#### **6. Creative Feature Agents (Optional, Modular Add-ons)**
   - **Role:**
     - Specialized content creation features including blog post ideas, visual content alignment, multimedia integrations.
     - Visual Extraction can coordinate with Content Generation for image-to-article workflows when needed.
   - **Model:**
     - For Blog Ideas: Claude Sonnet 4 or GPT-4o.
     - For Visual Content Alignments: OpenAI Whisper or Adobe tools for media.
     - For orchestration: Claude Sonnet 4 (coordinates data extraction → content generation when needed).

#### **7. Visual Data Extraction Agent**
   - **Role:**
     - Process uploaded screenshots to automatically extract structured data (dates, times, locations, odds, matchups, spreads, moneylines, over/unders).
     - Parse ESPN NFL schedules and RotoWire Weekly Odds matrices from DraftKings Sportsbook.
     - Output structured JSON data for automated content generation and table building.
   - **Model:**
     - **Claude Sonnet 4 with Vision API (Primary):** Excellent at understanding complex layouts, reading tables, and extracting structured data from images.
     - **GPT-4o Vision (Fallback):** Superior OCR accuracy for dense text extraction. Used as secondary verification or when Claude extraction confidence is low. 

---

### Key Benefits of this System
1. **Specialization:** Each agent can run independently, focusing on its optimized task and reducing conflicts or bottlenecks from competing functionalities.
2. **Scalability:** Ability to add or remove agents depending on functionality needs (modularity).
3. **Combining Strengths:** Using the “right tool for the job” approach ensures that each agent is powered by the best-fit model for its domain.
4. **Efficiency:** Models are not overextended beyond their strengths, saving computation overhead and reducing running costs.

---

### Recommendations
1. **Start with Minimum Viable Agents:** Build out core agents (content generation, SEO, and training agents) and expand as needed.
2. **Integration Layer:** Develop or refactor a message-oriented middleware (like RabbitMQ or Kafka) to enable smooth communication among agents while maintaining their independence.
3. **Evaluate the Data Pipeline:** Ensure a strong data pipeline for agents that interact and overlap (e.g., content generation -\> quality assurance). This could be queue-based processing workflow or even storing outputs for additional refinement.

---

### Tools for Implementation
- **Agent Coordination:** Use frameworks like LangChain or Rasa for orchestrating agents and managing model requests in real time.
- **Monitoring and Analytics:** Add a layer for fine-grained usage metrics, evaluating model performances, and reporting (Prometheus/Grafana or a real-time dashboard).
- **Continuous Deployment:** If training models frequently, employ tools like MLflow for lifecycle management.
