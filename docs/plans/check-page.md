# Plan: the Check page puts the project before the answer

Status: built on branch `check-redesign`. The old layout stays in the Trial panel ("Check page") until a choice is made.

## The problem

The Check page opened with the verdict banner: "This project fits the rules as entered". It filled the first screen, above the address box and the form. The only clue to *which* project was a small grey line ("10 units in R-3, Cumberland"). The "Example values" tag sat two panels further down. A first-time visitor read a ruling on a sample project they had not seen, and might have taken it for their own. On a phone, the address box was pushed below the fold.

## The principle

An answer is only readable next to the facts it rests on. So:

1. **The project comes first, the answer second.** On a wide screen the form is on the left and the answer on the right, labelled "The project" and "The answer". On a phone they stack in that order, with a "Skip to the answer" link at the top.
2. **The answer states its own premise.** Every verdict now opens with a facts line ("10 new units · R-3, Cumberland · 56,600 sq ft lot · public water and sewer · 0.9 acres disturbed · no wetlands or state road marked"). The headline follows it and has no subject of its own ("Fits the rules on these facts", "Can proceed, with questions to settle first", "Needs relief or a different route"). This applies on the home page and the summary as well, so the verdict can't be read without its premise anywhere.
3. **The example says it is an example, where the answer is.** The kicker reads "Example project" (or "Your project", "Project from a shared link", "Imported project"). On the Check page it adds: "Sample facts, not yours. Look up an address or change any fact to check your own."
4. **The facts line is a way back to the form.** On the Check page each fact is a button that scrolls to and focuses its field.

## What moved

| Before | After |
| --- | --- |
| Verdict banner across the top of the page | Top of the right-hand "answer" column |
| Route badge and override at the top of the law check | The route override sits under the route in the verdict, so there is one route display, not two |
| Verdict repeated blockers and open questions, then the law check listed them again | On the Check page the findings follow directly, so the verdict doesn't list them again. Home and summary keep the list. |
| Headline carried the subject ("This project…") | The facts line is the subject, and the headline is the answer |
| Below the fold: Nearby alternatives, then What the zoning allows | What the zoning allows comes first, then Nearby alternatives |

## Not changed

- Who decides each step: unchanged, it lives on /steps.
- The five routes at the bottom of the page.
- Persistence: still the browser store plus share links. The redesign adds none.

## Layouts on trial

After the map was added, more layouts went into the Trial panel (branch `check-trials`). Every one keeps the facts with the answer.

| Trial option | What it does | Best at |
| --- | --- | --- |
| Check page layout: **Answer beside the facts** (default) | Form left, answer right, labelled 1 and 2 | Wide screens, first visit |
| **Project on top, folds away** | The project is a card of facts above a full-width answer. Unfolding it shows the address step and the form. Selecting a fact unfolds the card and focuses that field. | Phones, return visits, reading the answer at full width |
| **Sticky project-and-answer bar** | A bar under the header holds the facts (left) and the answer in one line (right) for the whole page. Below it are the form and the findings. | Keeping the answer in view while reading the district, map and what-if sections |
| **Answer pinned while you edit** | Side layout, with the answer column sticky and scrolling on its own. Not sticky on phones. | Editing the lower facts with the answer in view. Only useful while the form is longer than the answer. |
| Verdict above the form (old), Findings only (old) | The earlier layouts | Comparison |
| Zoning map: **Full width, above the Atlas panel** (default) | The map at 540 px tall, Atlas panel below | Making the map prominent |
| **Beside the Atlas panel** | The first map layout | Compactness |
| **In the address step** | The map sits under the address search. A found place previews on it before you apply it, and a click looks up that point. The district section keeps only the Atlas panel. | Choosing the site, vacant land without an address |

Every map placement has **Expand**, which opens the map as a modal. Escape closes it and focus returns to the button.

## To decide

- Keep the old layout or delete it from `Trial.tsx` ("Check page": answer beside the facts / verdict above the form / findings only).
- Whether the example answer should show at all before the visitor changes anything. Hiding it would remove the problem entirely, but it would also remove the demo for first-time visitors and judges.
