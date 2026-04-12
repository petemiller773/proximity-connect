

# Security Features Plan: Age Verification & Profile Photo Verification

## What We're Building

Three layers of protection to keep minors out and ensure real people are using the app:

### 1. Mandatory Date of Birth Gate (During Signup)
- Force every new user to enter their date of birth **before** they can access the app
- Server-side age calculation — if under 18, block account creation entirely
- Store DOB in the profile; make it **non-editable** after initial setup (prevents someone changing it later)
- Add a database constraint so no profile can exist without a valid DOB proving 18+

### 2. Profile Photo Upload with Storage
- Add a photo upload feature to the profile page using Lovable Cloud file storage
- Create a storage bucket for avatar images with proper security policies
- Users upload a real photo that becomes their profile picture visible to others
- This is a prerequisite for any future face verification

### 3. AI-Powered Selfie Verification (Profile Trust Badge)
- After uploading a profile photo, users can take a **live selfie** via their camera
- An edge function sends both images to Lovable AI (vision model) to check:
  - Does the selfie match the profile photo (same person)?
  - Does the person appear to be 18+?
  - Is it a real photo (not a screenshot of someone else's picture)?
- Verified users get a ✅ badge on their profile visible to others
- Unverified users can still use the app but other users see they're not verified — building social pressure to verify

### 4. Onboarding Flow
- New users see a mandatory setup screen after first login: DOB → Profile Photo → Optional Selfie Verification
- They cannot access the radar/discover page until DOB is confirmed and they're 18+

## Technical Details

**Database changes:**
- Add `is_verified` (boolean), `verified_at` (timestamp) columns to `profiles`
- Add `is_profile_complete` (boolean) to track onboarding status
- Create `avatar-photos` storage bucket with authenticated upload policies
- Update the `handle_new_user` trigger so `is_profile_complete` defaults to `false`

**New edge function: `verify-selfie`**
- Accepts two image URLs (profile photo + selfie)
- Uses Lovable AI (gemini-2.5-pro for vision) to compare faces and estimate age
- Returns verification result; updates `is_verified` on the profile

**Frontend changes:**
- New `Onboarding.tsx` page: step-by-step DOB → photo → verify flow
- Update `Profile.tsx` with photo upload and verification badge
- Add `ProtectedRoute` logic to redirect incomplete profiles to onboarding
- Camera capture component using browser `getUserMedia` API for live selfie

**Security enforcement:**
- Server-side DOB validation in the `handle_new_user` trigger
- RLS policy: users can only update their own `is_verified` via the edge function (not directly)
- Age is calculated server-side from DOB, never trusted from client

## Honest Limitations
- AI face matching is not 100% accurate — it's a deterrent, not a legal identity check
- Determined bad actors can still use fake photos; for a production app you'd eventually want a third-party ID verification service (Jumio, Onfido — ~$1-2 per verification)
- The AI age estimation is approximate — the real protection is the mandatory DOB gate

