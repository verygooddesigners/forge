# Feature Spec: Forge Systems AI Agent

**Version:** 0.2 (Draft)
**Date:** 2026-03-02
**Status:** For Review

---

## 1. Problem Statement

Jeremy runs Forge — a live AI-powered writing platform — largely solo. As the platform grows, keeping an eye on system health, catching failures early, and handling routine ops tasks has become a manual burden that pulls attention away from building features and supporting writers.

Today, when something goes wrong (an API outage, a slow DB query, a failed background job), Jeremy finds out the hard way — a user reports it, or he happens to notice while poking around the Admin panel. There is no proactive monitoring, no automated remediation, and no consistent picture of how the system is actually performing day-to-day.

The cost of this gap is real: degraded user experience during incidents that could have been caught earlier, time lost to manual spot-checks, and a constant low-level anxiety about whether the system is healthy right now.

---

## 2. Goals

**User Goals (Jeremy)**

1. **Peace of mind**: Stop manually checking system health. Trust that if something breaks, he'll be told immediately — not discover it through a user complaint.
2. **Faster incident response**: Problems are caught and diagnosed automatically, ideally before any writer notices degraded performance.
3. **Reduced ops toil**: Routine, repetitive tasks (health checks, log reviews, usage summaries) happen automatically on a schedule.

**Business Goals (Forge)**

4. **Platform reliability**: Fewer user-visible incidents, faster mean time to resolution (MTTR) when they do occur.
5. **Operational leverage**: Jeremy can manage a growing platform without proportionally growing ops overhead.

---

## 3. Non-Goals

- **This is not a general-purpose chatbot.** The agent is purpose-built for system operations, not writing assistance or user-facing features.
- **Not a replacement for Vercel/Supabase dashboards.** We surface the most important signals in-context, not replicate every metric those platforms provide.
- **No autonomous code deploys in v1.** The agent can diagnose and suggest fixes, but will not write and push code changes on its own without a separate approval workflow.
- **Not a user-facing feature.** Writers on Forge will never interact with this agent directly. It is purely an internal ops tool for the admin.
- **Not a full APM (Application Performance Monitoring) product.** v1 focuses on correctness/availability, not deep performance profiling.
- **No Slack integration in v1.** Slack requires a corporate app approval process. Notifications are delivered via email and the Admin dashboard panel. Slack is explicitly designed for in a future phase once setup is unblocked.

---

## 4. User Stories

All stories are from Jeremy's perspective as the solo admin of Forge.

**Monitoring & Alerting**

- As the Forge admin, I want to receive an instant email alert when any critical system check fails (AI API, database, storage) so that I can respond before users are affected.
- As the Forge admin, I want each alert to include a plain-English diagnosis of what went wrong and what the agent recommends doing about it, so I don't have to investigate from scratch.
- As the Forge admin, I want a follow-up notification when a degraded check recovers, so I'm not left wondering if the system is still down.

**Daily & Weekly Summaries**

- As the Forge admin, I want a daily email digest every morning that shows: current system status, key usage numbers from the past 24 hours, and anything unusual the agent noticed, so I start each day informed without logging into the Admin panel.
- As the Forge admin, I want a weekly email summary every Monday with trends over the past 7 days (usage growth, error rates, AI API latency changes) so I can track whether the platform is getting healthier or degrading over time.

**Autonomous Remediation (Low-Risk)**

- As the Forge admin, I want the agent to automatically handle minor, safe issues (retrying a failed transient operation, clearing an in-memory cache) without asking me, and simply log what it did, so minor blips are resolved without my attention.
- As the Forge admin, I want the agent to ask for my explicit approval — via the Admin panel — before taking any action that touches user data, the database schema, or deployed configuration, so I stay in control of consequential changes.

**Admin Dashboard**

- As the Forge admin, I want a dedicated "Systems Agent" section in the Admin panel that shows: current system status, recent agent actions and decisions, active alerts, and upcoming scheduled tasks, so I have a single place to see what the agent is doing.
- As the Forge admin, I want to be able to configure alert thresholds and notification preferences (email address, check frequency, digest timing) from the Admin panel, so I can tune the agent without touching code.
- As the Forge admin, I want a prominent "Approve / Dismiss" UI in the Admin panel for any pending high-risk agent actions, so I can make decisions quickly without hunting through logs.

**Edge Cases**

- As the Forge admin, I want the agent to correctly distinguish between a real outage and a transient blip (one failed request vs. sustained failure) so I'm not spammed with false-alarm alerts.
- As the Forge admin, I want to be able to snooze a specific alert from the Admin panel for a set time (e.g., "I know the DB is slow — don't alert for 2 hours") so I'm not re-notified about something I'm actively handling.

---

## 5. Requirements

### P0 — Must Have (v1 cannot ship without these)

**Health Monitoring Engine**

- [ ] Checks run on a configurable schedule (default: every 5 minutes) against four domains:
  - **AI API**: Ping Claude API, measure latency, detect errors
  - **Database**: Supabase availability and query response time
  - **Storage**: Supabase Storage bucket accessibility
  - **App error rate**: Track 5xx/4xx error rates from app logs or Vercel
- [ ] Each check produces a structured result: `status` (healthy / degraded / error), `latency_ms`, `message` (human-readable), `detail` (raw diagnostic), `timestamp`
- [ ] Check history is persisted to a `system_health_checks` table in Supabase
- [ ] Checks distinguish transient failures (single failed ping) from sustained incidents (3+ consecutive failures) before triggering an alert

**Email Alerting**

- [ ] Instant email to the configured admin address when any check transitions healthy → degraded or error, containing: which check failed, plain-English diagnosis, recommended action
- [ ] Recovery email when a degraded/error check returns to healthy
- [ ] Daily digest email every morning (time configurable, default 8:00 AM local) with: overall system status, 24-hour usage summary, any notable events from the past 24 hours
- [ ] Weekly digest email every Monday morning with: 7-day trend summary, top errors, usage metrics

**Admin Dashboard Panel**

- [ ] New "Systems Agent" section in Admin nav
- [ ] Real-time status board: current status of all four health check domains with color coding (green / yellow / red)
- [ ] Agent activity log: chronological list of checks run, alerts sent, and any actions taken (with outcome)
- [ ] Pending approvals panel: any high-risk actions awaiting approval, with Approve / Dismiss buttons
- [ ] Manual "Run all checks now" button
- [ ] Alert snooze controls: snooze any check domain for a configurable duration directly from the dashboard

**Notification Configuration (in Admin panel)**

- [ ] Configurable: admin email address for alerts, alert thresholds (consecutive failures before alerting), daily digest time, weekly digest day/time
- [ ] Toggle to enable/disable each check domain independently
- [ ] Settings stored in the database; no code changes required to update

---

### P1 — Nice to Have (high-priority fast follows)

**Autonomous Low-Risk Remediation**

- [ ] For known safe actions (e.g., retrying a failed health check, clearing an in-memory cache), the agent acts automatically and logs what it did
- [ ] For higher-risk actions, creates a pending approval card in the Admin panel with a plain-English description of the proposed action and its expected outcome
- [ ] All agent actions (automatic and approved) are recorded in the activity log with outcome

**Latency Trending**

- [ ] Admin panel shows 24-hour and 7-day latency sparklines for each check domain, drawn from stored check history

**Usage Metrics in Digest**

- [ ] Daily digest includes: active users in last 24h, number of AI requests made, total words generated, any new sign-ups

**Slack Integration (when unblocked)**

- [ ] Notification layer is abstracted so Slack can be added as a second delivery channel without rearchitecting
- [ ] When Slack is configured, alerts and digests are mirrored to a `#forge-updates` channel alongside email

---

### P2 — Future Considerations (out of scope for v1, but design for them)

- **Natural language interface**: Ask the agent "What happened last Tuesday around 3pm?" and get a summary pulled from logs and check history
- **Anomaly detection**: ML-based detection of unusual patterns rather than only threshold-based alerting
- **Auto-scaling recommendations**: Agent notices sustained high latency and recommends compute scaling
- **Self-healing code**: Agent writes a fix for a known class of errors and submits a PR for human review before deploying
- **Multi-environment support**: Separate monitoring for staging vs. production

---

## 6. Success Metrics

| Metric | Target | Measurement Method | Evaluated At |
|--------|--------|-------------------|--------------|
| Mean time to first alert after an incident | < 5 minutes | Timestamp of first email vs. incident start (from logs) | Per incident |
| False positive rate (alert sent, no real issue) | < 5% of alerts | Manual review of alert log | 30 days post-launch |
| Daily digest engagement | Jeremy opens or acts on >80% of digests | Email open tracking or self-report | 30 days post-launch |
| Admin hours saved per week on manual health checks | At least 2 hours/week | Jeremy's self-report at 30-day check-in | 30 days post-launch |
| Incidents caught by agent before user report | >75% of all incidents | Compare alert timestamp to first user complaint timestamp | 60 days post-launch |

**The headline success test:** If Jeremy goes a full week without manually opening the System Health panel because he trusts the agent is watching, v1 succeeded.

---

## 7. Open Questions

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| 1 | What email address should alerts go to? And should we use Resend (already in the stack) for delivery? | Jeremy | Yes — needed before building email alerting |
| 2 | What counts as "low-risk" vs. "high-risk" action? We need a concrete list before building the remediation layer. Informal rule: safe = no user data, no DB schema, no deploy. | Jeremy + Engineering | Yes, before building P1 remediation |
| 3 | Check frequency: 5 minutes is the default — does that feel too frequent (noisy) or not frequent enough? | Jeremy | No — easy to tune after launch |
| 4 | Should the agent have a name / persona in the Admin UI (e.g., "Forge Ops" or "Scout") or just be labelled "Systems Agent"? | Jeremy | No — cosmetic |
| 5 | Slack: what's the timeline for getting a Slack app approved? Worth tracking so we can plan Phase 2 accordingly. | Jeremy | No — deferred to future phase |

---

## 8. Timeline Considerations

**Suggested Phasing**

**Phase 1 — Foundation (2–3 weeks)**
Build the monitoring engine and Admin dashboard panel. The four health checks run on schedule, results are stored in Supabase, and the status board is live in Admin with the activity log and pending approvals panel. No notifications yet — this phase is about getting the data right.

**Phase 2 — Email Notifications (1 week)**
Wire up instant alerts, recovery notifications, and daily/weekly digests via email (using Resend, which is already in the Forge stack). This is what unlocks the "peace of mind" goal — Jeremy no longer has to remember to check.

**Phase 3 — Remediation & Snooze (2–3 weeks)**
Add the approval-gated remediation flow, the snooze controls, and the Approve/Dismiss UI. Requires the P0 foundation to be solid first.

**Phase 4 — Slack (when unblocked)**
Plug Slack in as a second notification channel. No rearchitecting required if Phase 2 is built with an abstracted notification layer.

**No hard deadlines identified.** Shipping Phase 1 quickly and learning from real usage is more valuable than waiting for all phases to be complete.

---

*Document compiled from founder interview, 2026-03-02. Updated v0.2: removed Slack from v1 scope; replaced with email notifications via Resend. Slack deferred to Phase 4.*
