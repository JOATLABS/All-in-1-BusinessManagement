# African Social Club Branding and Product Design Specification

Status: Draft v1
Owner: Emmanuel Akinwale / JOATLabs
Related architecture: `docs/social-club-platform-architecture.md`

## 1. Purpose

This document defines the brand, design system, UI/UX principles, and product experience requirements for rebranding the current nightclub platform into an invitation-based African community social club platform for Oklahoma City, Tulsa, and future markets.

The visual direction should preserve the strongest part of the current repo: the cinematic, immersive homepage. The functional direction changes from public nightlife reservations to a premium invitation funnel and private member experience.

## 2. Brand strategy

## 2.1 Brand position

The platform should feel like an elevated cultural and professional community, not a generic event app and not only a nightclub brand.

Positioning statement:

> A private African and diaspora social club for curated professional, cultural, and social experiences in Oklahoma.

The platform should communicate:

- Invitation-based access.
- Intentional community.
- African and diaspora cultural grounding.
- Professional and creative ambition.
- Curated events, not random listings.
- Quality over volume.
- Real-world connection supported by technology.

## 2.2 Working brand placeholder

Use a placeholder until the final brand name is selected.

Recommended placeholder in code and docs:

```text
OJA+ Social Club
```

Alternative product names to evaluate later:

- OJA+ Social
- OJA+ Collective
- The OJA Collective
- Root Social Club
- Root & Circle
- Diaspora Social Club Oklahoma
- The Village Social Club

Do not hard-code a final brand name in business logic. Use configurable brand fields from `site_content` or future `brand_settings`.

## 2.3 Brand promise

Members join because the platform creates rooms they cannot easily create themselves.

Brand promise:

> We curate the room, the people, and the experience so African and diaspora professionals in Oklahoma can build meaningful social, cultural, and professional connection.

## 2.4 Voice and tone

The brand should sound warm, selective, cultured, and clear.

Use:

- “Request Invite”
- “Curated experiences”
- “Members”
- “Community”
- “Circles”
- “Gatherings”
- “Private dinners”
- “Professional mixers”
- “Cultural nights”
- “Oklahoma City” and “Tulsa”

Avoid:

- Overly exclusive or elitist language.
- Copy that sounds like a dating app.
- Copy that sounds like a club promoter flyer only.
- Copy that promises business outcomes.
- Copy that implies ethnic gatekeeping.

Preferred phrase:

> Built for African and diaspora professionals, creatives, entrepreneurs, and friends of the culture.

## 3. Visual identity

## 3.1 Design direction

The design should blend:

- Premium editorial social club.
- African-inspired warmth and texture.
- Modern technology product clarity.
- Cinematic nightlife energy only where appropriate.

The web homepage may remain immersive and dramatic. The mobile app should be calmer, clearer, and more utility-focused.

## 3.2 Color system

Use design tokens rather than hard-coded values.

### Primary palette

| Token | Purpose | Suggested value |
|---|---:|---:|
| `color.brand.ink` | Primary text and premium contrast | `#0E0B08` |
| `color.brand.ivory` | Warm background | `#F7F1E8` |
| `color.brand.gold` | Premium accent | `#C99A3E` |
| `color.brand.clay` | African earth accent | `#A94E2F` |
| `color.brand.forest` | Cultural depth accent | `#1F3A2D` |
| `color.brand.palm` | Fresh action accent | `#1DBF8F` |
| `color.brand.midnight` | Event/night mode background | `#080A12` |
| `color.brand.wine` | Evening/social accent | `#641E2E` |

### Semantic tokens

| Token | Purpose | Suggested value |
|---|---:|---:|
| `color.success` | Approved, confirmed, active | `#1F8A5B` |
| `color.warning` | Waitlist, pending, needs info | `#C9841D` |
| `color.danger` | Rejected, cancelled, suspended | `#B42318` |
| `color.info` | Announcement, neutral state | `#2563EB` |
| `color.surface` | Cards | `#FFFFFF` |
| `color.surface.dark` | Dark cards | `#121212` |
| `color.border` | Light divider | `#E6DED3` |
| `color.muted` | Secondary text | `#6F665C` |

## 3.3 Typography

The current homepage can keep dramatic display typography, but product UI must be highly readable.

Recommended typography system:

- Display serif: editorial headings, hero words, event titles.
- Sans-serif: body, buttons, forms, app UI, admin UI.
- Mono optional: codes, QR pass IDs, admin logs.

Font behavior:

- Use large expressive hero words on public web.
- Use concise titles and clear hierarchy in mobile.
- Avoid thin type over busy images unless contrast overlays are strong.
- Minimum body text size: 16px web, 15–16 mobile.
- Buttons must remain legible at mobile sizes.

## 3.4 Imagery

Imagery should feel like:

- Curated dinners.
- Well-dressed professionals.
- Cultural gatherings.
- Art, music, food, conversation.
- Oklahoma city texture.
- African patterns, fabrics, food, and interior warmth without becoming cliché.

Image rules:

- Avoid using only party/nightclub imagery.
- Use people-in-room images only with consent.
- Use alt text in every admin-uploaded image workflow.
- Event images should have a safe crop area for card overlays.
- Web hero images should support focal-point settings already present in the repo.

## 4. Product surfaces

## 4.1 Public web homepage

The public homepage should preserve the current immersive hero architecture. The current repo already supports dynamic hero backgrounds, animated words, event flyer overlays, countdown, CTAs, footer links, and overlay panels.

### Homepage goals

- Explain the community in under 10 seconds.
- Create desire without exposing all private details.
- Drive the visitor to request an invite.
- Communicate that this is curated and intentional.
- Provide credibility and partner contact paths.

### Recommended homepage sections

1. Hero
2. About / mission overlay
3. How membership works
4. Experience categories
5. Upcoming experience teaser
6. Community standards teaser
7. Partner/vendor CTA
8. Footer/legal/social

### Hero content model

Hero should include:

```typescript
interface SocialClubHeroContent {
  brandName: string;
  words: string[]; // e.g. ['Belonging', 'Culture', 'Connection', 'Ambition']
  tagline: string;
  primaryCtaLabel: 'Request Invite';
  primaryCtaHref: '/apply';
  secondaryCtaLabel: 'Explore Experiences';
  secondaryCtaHref: '/events';
  backgroundMedia: HeroBackground[];
  logo?: BrandLogoAsset;
}
```

Recommended hero words:

- Culture
- Connection
- Belonging
- Ambition
- Community
- Gather
- Roots
- New Rooms

Recommended tagline options:

- “Curated social, cultural, and professional experiences for the African diaspora in Oklahoma.”
- “An invitation-based community for African professionals, creatives, entrepreneurs, and friends of the culture.”
- “Intentional rooms for culture, connection, and opportunity.”

### CTA conversion

Current nightlife CTAs should change:

| Current CTA | New CTA |
|---|---|
| Upcoming Event | Upcoming Experiences |
| Table Reservation | Request Invite |
| Ticket Pre-Sale | Membership |
| Contact Us | Partner With Us / Contact |

## 4.2 Request invite web flow

The application flow should be polished, not long and bureaucratic.

### Flow steps

1. Email and password or magic link start.
2. Basic identity.
3. City and availability.
4. Professional/creative background.
5. Interests.
6. Social goals.
7. Referral/source.
8. Community agreement.
9. Submit.
10. Confirmation and status page.

### Application form fields

Required:

- First name
- Last name
- Email
- City: OKC, Tulsa, Other
- Profession or primary work
- Interest categories
- Why do you want to join?
- Agreement to community standards

Optional:

- Preferred name
- Phone
- LinkedIn
- Instagram
- Industry
- Company
- Heritage/country connection
- Referral member
- Event ideas

### Application UX requirements

- Show progress indicator.
- Save draft if user is authenticated.
- Mobile-first form layout.
- Clear privacy note for personal/cultural data.
- Friendly submitted state.
- No promise of acceptance.

## 4.3 Application status page

Statuses should have clear language:

| Status | User-facing language |
|---|---|
| submitted | “Your invite request was received.” |
| under_review | “Your application is being reviewed.” |
| needs_more_info | “We need a little more information.” |
| waitlisted | “You are on the waitlist for this city.” |
| invited | “Your invite is ready.” |
| approved | “Welcome to the community.” |
| rejected | “We are not able to offer membership at this time.” |

Do not expose internal scoring or private admin notes.

## 4.4 Member mobile app

The mobile app should not feel like a copy of the public website. It should feel like a member portal: clean, calm, fast, and personal.

### App navigation

MVP tab bar:

```text
Home | Events | Community | Profile
```

Future tab bar:

```text
Home | Events | Circles | Inbox | Profile
```

### App home screen

Purpose:

- Tell the member what matters next.
- Surface recommended experiences.
- Nudge incomplete onboarding.
- Request feedback after events.

Content blocks:

- Greeting: “Good evening, Emmanuel.”
- Membership badge/status.
- Next RSVP card.
- Recommended event card.
- New circle suggestion.
- Announcement card.
- Feedback request if applicable.

### Events screen

Filters:

- All
- Dinners
- Mixers
- Professional
- Culture
- Social Nights
- Wellness
- My RSVPs

Event card fields:

- Event image
- Event type badge
- Date/time
- Title
- City
- Member price or included
- RSVP status
- Capacity status: open, almost full, waitlist

### Event detail screen

Sections:

- Hero image
- Event type
- Date/time
- Title
- Host/curator
- Description
- Who it is for
- Location visibility
- Guest policy
- Dress/vibe notes
- RSVP button
- Waitlist button
- Share guest request if allowed

Event location visibility states:

- Public teaser only
- Members only
- Confirmed RSVPs only
- Hidden until 24 hours before event

### RSVP UX

Button states:

- Request RSVP
- RSVP Now
- Join Waitlist
- Confirmed
- Waitlisted
- Cancel RSVP
- Show QR Pass

### QR pass screen

Requirements:

- Event title/date.
- Member name.
- QR code.
- Guest passes if any.
- Terms: pass is non-transferable unless guest policy allows.
- Offline-ready cached view.

### Community screen

MVP content:

- Circles list.
- Suggested circles.
- Member connection prompts after shared events.
- Community standards.

Do not launch a public browseable member directory in MVP. Start with event-context connection suggestions.

### Profile screen

Sections:

- Profile photo and display name.
- Profession and city.
- Bio.
- Interests.
- Social goals.
- Membership tier/status.
- RSVP history.
- Notification settings.
- Privacy settings.
- Support/report issue.

## 4.5 Admin design

The admin console should shift from venue operations to community curation.

### Admin dashboard cards

- Pending applications.
- Waitlisted by city.
- Upcoming events.
- RSVP conversion.
- Check-ins today.
- Feedback needing review.
- Reported members.
- Vendor tasks.

### Application review UI

Application review should show:

- Applicant summary.
- City and professional background.
- Interests.
- Social goals.
- Referral source.
- Application answers.
- Risk flags or duplicate identity alerts.
- Admin notes.
- Status transition controls.

Actions:

- Approve
- Invite
- Waitlist
- Request more info
- Reject
- Add internal tag
- Assign reviewer

### Event curation UI

Event creation fields:

- Title
- City
- Event type
- Event status
- RSVP policy
- Capacity
- Member price
- Guest policy
- Date/time/timezone
- Venue
- Location visibility
- Description
- Who should attend
- Target interests
- Target tiers
- Target circles
- Event image/flyer
- Vendor assignments

### Member admin UI

Member list fields:

- Name
- City
- Tier
- Status
- Interests
- Last active
- RSVPs
- Attendance rate
- No-show count
- Tags

Actions:

- View profile
- Add note
- Change status
- Add/remove tags
- Invite to event
- Review RSVP history
- Suspend/reactivate

### Vendor admin UI

Vendor list fields:

- Business name
- Category
- Contact
- City
- Status
- Assigned events
- Notes

Actions:

- Create vendor
- Approve vendor
- Add offering
- Assign to event
- Upload agreement
- Mark paid/completed

## 5. Component system

## 5.1 Shared components

Web and mobile should share design concepts even if component implementations differ.

Core components:

- Button
- Link button
- Input
- Select
- Checkbox
- Toggle
- Stepper
- Card
- Event card
- Member card
- Circle card
- Badge
- Status pill
- Modal / bottom sheet
- Empty state
- Error state
- Loading skeleton
- Toast
- Avatar
- Image upload
- QR pass

## 5.2 Status badge language

Application:

- Submitted
- Under Review
- Needs Info
- Waitlisted
- Invited
- Approved
- Not Selected

Membership:

- Active
- Founding
- Premium
- Past Due
- Paused
- Suspended

Event:

- Draft
- Private
- Invite Only
- RSVP Open
- Waitlist
- Closed
- Completed
- Cancelled

RSVP:

- Requested
- Confirmed
- Waitlisted
- Checked In
- Cancelled
- No Show

Vendor:

- Prospect
- Approved
- Assigned
- Completed
- Inactive

## 6. Accessibility and usability requirements

Minimum standards:

- WCAG 2.1 AA target.
- Keyboard navigation for web admin and public forms.
- Minimum 44px touch targets.
- Reduced motion support for homepage animations.
- Alt text required for uploaded event and hero images.
- Sufficient contrast over images.
- Error messages tied to form fields.
- Screen-reader friendly modal focus trapping.
- Mobile app must support Dynamic Type where practical.

The current repo already has accessibility-focused work in media management and footer/modal areas; do not regress that standard.

## 7. Content model changes

## 7.1 site_content update

The existing `site_content` JSON should be extended from nightclub content to social club content.

Suggested model:

```typescript
interface SocialClubSiteContent {
  brand: BrandContent;
  hero: SocialClubHeroContent;
  about: AboutContent;
  membership: MembershipContent;
  experiences: ExperiencesContent;
  application: ApplicationContent;
  partner: PartnerContent;
  footer: FooterContent;
  legal: LegalContent;
}
```

### Brand content

```typescript
interface BrandContent {
  name: string;
  shortName: string;
  tagline: string;
  cityFocus: string[];
  logoUrl?: string;
  markUrl?: string;
  socialLinks: SocialLink[];
}
```

### Membership content

```typescript
interface MembershipContent {
  headline: string;
  body: string;
  benefits: string[];
  tiers: MembershipTierContent[];
  faq: FaqItem[];
}
```

### Experiences content

```typescript
interface ExperiencesContent {
  headline: string;
  categories: ExperienceCategoryContent[];
}
```

## 8. Design QA checklist

Before launch, each screen must pass:

- Does the screen make the next action obvious?
- Does the copy sound like a private community, not a nightclub-only flyer?
- Is sensitive member/event information hidden from public users?
- Does the mobile version work one-handed?
- Are loading, empty, error, and success states designed?
- Is there an accessibility label for icon-only buttons?
- Does the page work with reduced motion?
- Does the page still look premium with missing images?
- Can admin users recover from accidental changes?

## 9. Brand implementation tasks

1. Add `brand` and `membership` sections to site content.
2. Rename public navigation labels.
3. Change CTAs from reservations/tickets to invite/membership/experiences.
4. Add application design components.
5. Add event category badges.
6. Add member status badges.
7. Add city selector component.
8. Add mobile design tokens shared with React Native.
9. Add legal/community standards pages.
10. Add vendor/partner inquiry page.

## 10. Non-negotiable design principles

- The public site creates desire.
- The mobile app creates belonging.
- The admin console enables curation.
- Member privacy is always more important than public event marketing.
- The brand is African-centered but welcoming to friends of the culture.
- The platform should feel premium but not arrogant.
- The first release should feel focused, not feature-bloated.
