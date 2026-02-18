# Changelog

All notable changes to Forge are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.03.00] - 2026-02-18

- **Content Analytics Dashboard**: interactive analytics page with stat cards, area/bar/line/pie charts, date range picker with presets, and daily breakdowns.
- Team leader+ can view cumulative and per-member team stats with user selector and sortable member table.
- Analytics export in CSV, Excel, PDF, and interactive HTML formats.
- Save/share named filter configs with unique shareable URL tokens.
- Event tracking for project creation, export, brief creation/edit/share with backfill API for existing data.
- Supabase migration: analytics_events, teams, team_members, saved_filters tables with RLS policies.

## [1.02.00] - 2026-02-18

- Admin Dashboard revamp: full-screen layout, collapsible Admin menu, section-based navigation with `?section=` query param.
- Updated admin permissions: Manage All Users and Teams (manager+), API Keys and Tools (super_admin only), AI Tuner (manager+), AI Agents and Trusted Sources (team_leader+).
- New Team Management placeholder (manager+) and Ship It workflow (GitHub push, Spark update, CHANGELOG, version bump).
