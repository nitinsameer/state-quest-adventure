# State Quest Adventure — Learning Content Audit

**Branch:** `feature/age-adaptive-learning`

## Coverage inspected

- All 36 state/UT records: 28 states and 8 union territories.
- Six active Learning Hub card categories per destination: capital, language, food, places, animal and fun fact — 216 English card entries.
- The content JSON contains 483 category/language-variant records across seven categories; the extra `monument` category is not part of the six-card `StateEnrichedContent` type.
- Ten candidate quiz questions are generated per destination (360 total candidate questions across 36 destinations).

## Corrections and improvements committed

- Added normalized state-name lookup so display names using ampersands (for example, `Jammu & Kashmir` and `Andaman & Nicobar Islands`) resolve their matching content JSON keys.
- Updated the Andaman and Nicobar Islands capital to **Sri Vijaya Puram** (formerly Port Blair).
- Corrected canonical animal facts for Delhi (nilgai), Chandigarh (Indian grey mongoose), West Bengal (fishing cat), and the merged Dadra and Nagar Haveli and Daman and Diu territory (do not label the peacock as its state animal).
- Replaced unsupported/incorrect canonical claims that the Thar is India's only desert, Nalanda was definitively the world's oldest university, Assam grows most of India's tea, and Jharkhand supplies most of India's coal.
- Replaced the misleading food labels `Assam Laksa` and `Baguette Curry`.
- Rewrote high-risk English card copy for Assam, Gujarat and Uttar Pradesh capital cards to distinguish Dispur from Guwahati, Gandhinagar from Ahmedabad, and Lucknow from Agra.
- Rewrote or clarified English card copy for 20 high-risk card entries and updated 11 corresponding Hindi, Assamese, Punjabi, Tamil and Gujarati variants, including Nalanda, Telangana's Koh-i-Noor/Golconda association, Meghalaya rainfall, Tamil Nadu temple history, and the merged DNHDD territory.
- Updated quiz prompts to avoid implying that one language or dish is exclusive to a state, soften informal nicknames, and clarify that the emoji question tests the app's map symbol.
- Fixed the shared-capital quiz questions for Haryana, Punjab and Chandigarh; clarified Delhi's capital question.
- Added age-aware narration delivery: children in the 3–5, 6–7 and 8–9 bands receive the concise card summary as narration; ages 10–12 can receive a longer narration capped at 180 words.
- Added regression tests covering all 36 destinations, all six active cards, all ten candidate questions, state-name resolution, and shared-capital ambiguity. Added `docs/CONTENT_AUDIT_MATRIX.md` with 483 content-variant rows and 360 generated quiz-candidate rows, including risk markers and outstanding review status.

## Findings that still require source-backed editorial verification

This report deliberately does **not** claim every sentence in every language has been independently verified. The following material remains to be checked before claiming complete factual certification:

1. Population figures in `src/lib/states.ts` are approximate but are not consistently tagged with a reference year and source.
2. Other long-form narrations still contain specific counts, historical stories, superlatives and absolute claims that need individual citations or cautious rewriting.
3. Only the listed 11 regional-language variants were updated in this pass. Other regional-language variants have not all been semantically compared with the corrected English versions; some may retain outdated or inaccurate facts.
4. Difficulty tiers are assigned by question type, not validated reading-level or learning-science assessment. Ages 3–5 still receive text-based multiple-choice questions; a genuine pre-reader experience needs picture/audio-first UI.
5. The `monument` records are extra JSON data outside the six active typed card categories. Confirm whether these are intentionally unused or should be integrated into the model.

## Sources consulted

- National Portal of India — official list of 36 States/UTs: https://www.india.gov.in/directory/web-directory/state-uts
- Andaman and Nicobar Administration — Port Blair is now officially Sri Vijaya Puram: https://dss.andaman.gov.in/ShipAndamanWebSite/services/passenger-services/online_enquiry.html
- Delhi Forest Department — nilgai is Delhi's state animal: https://forest.delhi.gov.in/sites/default/files/generic_multiple_files/delhi_s_forest_at_a_glance.pdf
- Chandigarh Administration / ENVIS — Indian grey mongoose is Chandigarh's state animal and Indian grey hornbill its state bird: https://chandigarhenvis.gov.in/information/do-you-know
- NCERT, National Curriculum Framework for Foundational Stage — developmental learning outcomes are indicative trajectories, not fixed age-wise expectations: https://www.ncert.nic.in/pdf/NCF_for_Foundational_Stage_20_October_2022.pdf

## Validation status

Regression tests have been added but have not yet been run in this environment. The branch must pass CI and the remaining source-backed editorial checks before it is merged into `develop`.
