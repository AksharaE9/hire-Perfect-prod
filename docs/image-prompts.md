# HirePerfect — Nano Banana Image Pack (Gemini / Imagen 3)

Generate each image in Gemini with Nano Banana / Imagen, download it, rename it to the exact filename shown, and place it in `public/images/` (category photos go in `public/images/categories/`).

---

## Instructions for Generating

1. **Start every prompt with the Style Block below** to maintain color harmony (`#F5F7F6` paper, `#14203A` navy ink, soft grey, and exactly one small marigold-yellow accent).
2. **State the aspect ratio** at the end of each prompt.
3. **Sequential Character Consistency**: Generate Image 02 (`hero-webcam.jpg`) first. Then, in the *same Gemini chat session*, use the edit prompts for 06, 07, 08, 03, and 04 to preserve Ananya's face, clothing, and room environment.
4. **Clean Editorial Rule**: Reject images with visible text, logos, distorted hands, or unreadable screens.
5. Save as JPG or WebP in `public/images/` or `public/images/categories/`. Run `npm run images:optimize` to process and create optimized WebP/AVIF variants.

---

### Shared Style Block (Paste at start of every prompt)

```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable.
```

### Main Character Reference: Ananya

```text
Ananya — Indian woman, about 23, shoulder-length dark hair tied back loosely, small silver stud earrings, wearing a plain navy blue crew-neck sweater over a white collar, sitting at a light wooden desk in a bright room with a white wall and a green plant in soft focus behind her.
```

---

## 1. Home Page Photos (`public/images/`)

### 01 · `hero-bg.jpg` · 16:9 · min 2400×1350
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. Wide shot of Ananya (Indian woman, about 23, dark hair tied back, navy sweater over a white collar) sitting at a light wooden desk in a bright modern room, working on an open laptop with calm concentration. She is placed in the right half of the frame, facing slightly left toward the laptop. The left 45% of the image is quiet, uncluttered wall and window light with no objects, leaving clear space for a headline. A marigold-yellow pencil lies beside a notebook on the desk. Morning light from a window on the left. Aspect ratio 16:9.
```

### 02 · `hero-webcam.jpg` · 4:3 · min 1200×900
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. Frontal webcam-style view of Ananya (Indian woman, about 23, dark hair tied back, small silver earrings, navy sweater over a white collar) looking straight at her laptop screen, head and shoulders centred, eyes at the upper third, neutral focused expression, plain white wall and a soft-focus plant behind her, even soft front light as if lit by the screen and a window. Slight wide-angle webcam perspective. Aspect ratio 4:3.
```

### 06 · `snap-front.jpg` · 4:3 · min 960×720 *(Edit in same chat session after 02)*
```text
Keep exactly the same woman, clothes, room and lighting as the previous image. Same webcam framing. She is looking directly at the screen, calm and focused. Aspect ratio 4:3. No text.
```

### 07 · `snap-away.jpg` · 4:3 *(Edit in same chat session)*
```text
Keep exactly the same woman, clothes, room, lighting and webcam framing. Now her head is turned about 30 degrees to her left and her eyes look away from the screen toward something off camera. Aspect ratio 4:3. No text.
```

### 08 · `snap-back.jpg` · 4:3 *(Edit in same chat session)*
```text
Keep exactly the same woman, clothes, room, lighting and webcam framing. She has turned back and is looking at the screen again, slightly leaning in, focused. Aspect ratio 4:3. No text.
```

### 03 · `step-before.jpg` · 4:5 · min 1200×1500 *(Edit in same chat session)*
```text
Keep the same woman, clothes and room. Over-the-shoulder and slightly side view: she holds a plain white ID card with no readable text up toward her laptop webcam, laptop screen softly blurred. A marigold-yellow sticky note is on the desk. Vertical composition, aspect ratio 4:5. No text or readable details on the card.
```

### 04 · `step-during.jpg` · 4:5 · min 1200×1500 *(Edit in same chat session)*
```text
Keep the same woman, clothes and room. Side profile close-up as she reads a question on her laptop with deep concentration, one hand on the trackpad, the other resting near a notebook with a marigold-yellow pencil. Screen blurred and unreadable. Vertical composition, aspect ratio 4:5.
```

### 05 · `step-after.jpg` · 4:5 · min 1200×1500
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. An Indian man in his early thirties, a recruiter in a light blue shirt, sitting in a bright modern office reviewing results on a large monitor, chin resting on his hand, thoughtful expression. The monitor shows soft blurred shapes of a dashboard with no readable text. A marigold-yellow folder lies on the desk. Navy blue office chair. Vertical composition, aspect ratio 4:5.
```

### 09 · `monitor-anatomy.jpg` · 16:10 · min 2000×1250
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. Medium-wide shot from slightly behind and to the side of an Indian man in his early twenties taking an online test at a desk in a bright home study. His face is visible in three-quarter view, the laptop screen is visible but completely blurred, a closed notebook and a marigold-yellow mug sit on the desk, and an open doorway is visible in the soft-focus background to the right. The scene is uncluttered with clear separation between the person, the laptop and the doorway. Aspect ratio 16:10.
```

### 10 · `who-hiring.jpg` · 3:2 · min 1500×1000
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. Two Indian recruiters, a woman in her thirties and a man in his forties, in a bright glass-walled meeting room in Bengaluru, looking together at a laptop and discussing candidates, one pointing at the blurred screen. Navy notebooks and a marigold-yellow pen on the table. Aspect ratio 3:2.
```

### 11 · `who-campus.jpg` · 3:2 · min 1500×1000
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A bright, orderly college computer lab in India, rows of students aged around 20 taking an online test on desktop computers, shot from the side aisle at eye level, screens blurred, quiet and focused atmosphere, white walls and navy chairs, one student has a marigold-yellow water bottle. Aspect ratio 3:2.
```

### 12 · `who-academy.jpg` · 3:2 · min 1500×1000
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A small professional training room with adult learners of mixed ages (late twenties to forties) working on laptops, an instructor in a navy blazer standing at the side watching calmly, whiteboard in the background with no readable writing. A marigold-yellow folder on one desk. Aspect ratio 3:2.
```

### 13 · `who-candidate.jpg` · 3:2 · min 1500×1000
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A young Indian man in his mid-twenties at a clean desk by a window at home, laptop open, wearing a simple white shirt, adjusting his posture before starting an online test, a plant and bookshelf in soft focus, marigold-yellow mug on the desk. Aspect ratio 3:2.
```

### 14 · `fair-signal.jpg` · 3:2 · min 1500×1000
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. Close-up of a woman reviewer's hands and partial profile as she reads a laptop screen carefully, one finger resting on the trackpad, a notepad with a marigold-yellow pen beside the laptop, screen blurred. Thoughtful, careful mood. Aspect ratio 3:2.
```

### 15 · `fair-transparent.jpg` · 3:2 · min 1500×1000
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A young Indian woman in a white kurta sitting at a desk reading instructions on her laptop before starting a test, relaxed and attentive expression, soft window light, marigold-yellow sticky note on the laptop edge with nothing written on it. Aspect ratio 3:2.
```

### 16 · `fair-same-rules.jpg` · 3:2 · min 1500×1000
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A row of four young candidates seen from the side, each at an identical laptop on a long white table, all focused on their screens in the same posture, bright room, navy chairs, one marigold-yellow pencil on the table. Symmetrical, orderly composition. Aspect ratio 3:2.
```

### 17 · `cta-hall.jpg` · 21:9 · min 2520×1080
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. Very wide shot of a large, bright university examination hall in India with long rows of desks and laptops, students taking a test, high windows letting in daylight, calm and orderly, generous empty ceiling space at the top. Aspect ratio 21:9.
```

---

## 2. Page Header & Layout Photos (`public/images/`)

### 18 · `library-header.jpg` · 16:9 · min 2400×1350
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. Overhead flat-lay of a clean white desk with a closed laptop, several neatly stacked navy notebooks, a pair of glasses and one marigold-yellow highlighter, lots of empty white space on the left half. Aspect ratio 16:9.
```

### 19 · `integrity-hero.jpg` · 16:9 · min 2400×1350
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. Close-up of a laptop's built-in webcam at the top of the screen bezel with a softly blurred young Indian woman's face reflected slightly in the dark screen edge, bright desk, marigold-yellow pencil in the foreground out of focus. Subject in the right half, clean space on the left. Aspect ratio 16:9.
```

### 40 · `about-hero.jpg` · 16:9 · min 2400×1350
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A bright modern office in Bengaluru with a small team of four Indian professionals in their twenties and thirties gathered around a table with laptops, mid-discussion, candid and natural, large windows, navy and white interior, a marigold-yellow cushion on a chair. Subject group in the right half. Aspect ratio 16:9.
```

### 41 · `about-work.jpg` · 3:2 · min 1500×1000
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. Two colleagues standing at a glass wall covered with blank white and one marigold-yellow sticky notes (no writing), planning together, one holding a marker, bright office. Aspect ratio 3:2.
```

### 42 · `contact-side.jpg` · 4:5 · min 1200×1500
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A friendly Indian woman in her late twenties wearing a navy blazer and a headset, smiling slightly while typing on a laptop at a bright support desk, marigold-yellow mug beside her. Vertical composition, aspect ratio 4:5.
```

### 43 · `auth-login.jpg` · 4:5 · min 1200×1500
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. Close-up of hands resting on a laptop keyboard next to an open notebook and a marigold-yellow pencil, soft morning light, cool white and navy tones, laptop screen blurred. Vertical composition, aspect ratio 4:5.
```

### 44 · `empty-state.jpg` · 1:1 · min 1000×1000
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. Minimal still life: a blank white answer sheet with a single empty row of circles printed faintly (no letters or numbers), a marigold-yellow pencil lying diagonally across it, on a light grey desk, lots of negative space. Aspect ratio 1:1.
```

### 45 · `auth-signup.jpg` · 4:5 · min 1200×1500
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A young Indian woman in her early twenties smiling gently while working on a laptop at a light wooden desk, navy sweater, soft window light, marigold-yellow notebook beside her. Vertical composition, aspect ratio 4:5.
```

---

## 3. Category Photos (20–39) (`public/images/categories/`)

*All aspect ratio 4:3 · min 1200×900.*

### 20 · `generative-ai-business-leaders.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A senior Indian businesswoman in a navy suit presenting to a small leadership team in a glass boardroom, a large blurred screen behind her, a marigold-yellow folder on the table. Aspect ratio 4:3.
```

### 21 · `prompt-engineering-ai-automation.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A young Indian developer at a dual-monitor desk typing thoughtfully, both screens blurred, marigold sticky note on the monitor edge. Aspect ratio 4:3.
```

### 22 · `data-engineering-cloud-pipelines.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. Two engineers in a bright server room corridor, one holding a laptop, rows of racks with soft blue status lights in the background, a marigold-yellow badge lanyard. Aspect ratio 4:3.
```

### 23 · `ui-ux-ai-products.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A designer's desk with paper wireframe sketches (no readable text), a tablet with a stylus and a phone, hands arranging the sketches, a marigold-yellow ruler. Aspect ratio 4:3.
```

### 24 · `product-management-ai-era.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A product manager at a whiteboard wall of blank sticky notes arranged in columns, one marigold note in hand, teammates watching. Aspect ratio 4:3.
```

### 25 · `blockchain-web3-applications.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. Close-up of a developer's hands on a keyboard with a hardware wallet device on the desk, soft blue light, blurred code-like screen, a marigold-yellow cable clip. Aspect ratio 4:3.
```

### 26 · `cybersecurity-ethical-ai-security.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A security analyst in a dim-but-cool-lit operations room looking at several blurred monitors, calm and alert, a marigold-yellow notebook beside keyboard. Aspect ratio 4:3.
```

### 27 · `digital-branding-creator-economy.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A young Indian creator filming herself with a phone on a small tripod in a bright home studio with a ring light, a marigold-yellow microphone foam cover. Aspect ratio 4:3.
```

### 28 · `financial-modeling-ai-tools.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A finance professional reviewing printed charts (shapes only, no numbers) beside a laptop, calculator and marigold highlighter on desk. Aspect ratio 4:3.
```

### 29 · `sustainable-business-esg-strategy.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A modern office with lots of indoor plants and solar panels visible through the window, two colleagues discussing at a standing desk, a marigold-yellow notebook on desk. Aspect ratio 4:3.
```

### 30 · `growth-marketing-performance-strategy.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A marketing team of three around a laptop in a bright co-working space, one pointing at the blurred screen, energetic but focused, a marigold-yellow notebook in hand. Aspect ratio 4:3.
```

### 31 · `no-code-low-code-app-development.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A young professional dragging blocks on a tablet with a stylus, blurred flowchart-like shapes on screen, clean desk, a marigold-yellow pencil case. Aspect ratio 4:3.
```

### 32 · `advanced-excel-business-intelligence.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. An analyst at a large monitor showing blurred grid and chart shapes, notebook with a marigold highlighter, office at golden-free daylight. Aspect ratio 4:3.
```

### 33 · `ar-vr-spatial-computing.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A young Indian man wearing a VR headset in a bright studio, hands raised mid-gesture, white walls, a marigold-yellow stool in background. Aspect ratio 4:3.
```

### 34 · `hr-analytics-people-strategy.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. An HR manager and a colleague reviewing a laptop together in a calm meeting room, printed org-chart shapes (no text) on the table, a marigold-yellow folder. Aspect ratio 4:3.
```

### 35 · `startup-incubation-venture-building.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A small startup team celebrating quietly around a laptop in a bright incubator space with exposed white brick, a marigold-yellow mug on table. Aspect ratio 4:3.
```

### 36 · `ai-healthcare-biotech.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A researcher in a white lab coat at a clean laboratory bench looking at a tablet, blurred lab equipment behind, a marigold-yellow rack box. Aspect ratio 4:3.
```

### 37 · `supply-chain-logistics-analytics.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A logistics manager with a tablet in a bright, orderly warehouse aisle with neatly stacked boxes, one marigold-yellow crate. Aspect ratio 4:3.
```

### 38 · `emotional-intelligence-leaders.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A manager in a one-on-one conversation with an employee in a quiet room, both listening warmly, soft window light, a marigold-yellow notebook on small table. Aspect ratio 4:3.
```

### 39 · `ai-content-creation-media-production.jpg`
```text
Photorealistic editorial photograph. Bright, cool natural daylight. Colour palette of clean white, soft grey and deep navy blue, with exactly one small warm marigold-yellow object somewhere in the scene (for example a pencil, a mug, a sticky note or a folder). Modern, tidy Indian setting. Realistic skin texture and natural expressions. Shallow depth of field, 35mm lens look. Calm, focused, trustworthy mood. No text, no letters, no numbers, no logos, no watermarks. Any screens are softly blurred and unreadable. A video editor at a desk with a microphone and headphones, blurred editing timeline shapes on the monitor, a marigold-yellow mug beside keyboard. Aspect ratio 4:3.
```
