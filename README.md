# React Native Interaction Lab

This repository is a personal lab for exploring motion in React Native. It focuses on recreating real-world UI patterns and motion effects — animations, interactions, transitions, gesture-driven movements, and any interface elements that move. Through small, focused prototypes, it's a space for technical curiosity and hands-on learning.

## Getting started

Built with [Expo](https://expo.dev) SDK 55 using [Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/) — native `android/` and `ios/` folders are generated on demand by `expo prebuild`.

Make sure your local environment is ready for native builds: see [Expo local development](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build).

### Install dependencies

```
npm install
```

### Run the app

- ios

```
npm run ios
```

- android

```
npm run android
```

Both commands run `expo prebuild` automatically on first launch and build a development binary.

## Works

### [Particle Effect](https://github.com/taewoongheo/react-native-interaction-lab/blob/main/src/interactions/ParticleEffect/ParticleEffect.tsx)

Particle system with touch and drag. Particles are distributed using Poisson disk sampling for natural spacing.

<p> 
<video src="https://github-production-user-asset-6210df.s3.amazonaws.com/127009780/462796864-2be99a5e-e5ce-400d-abd5-2a71ea9f78f8.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA/20250705/us-east-1/s3/aws4_request&X-Amz-Date=20250705T155639Z&X-Amz-Expires=300&X-Amz-Signature=e014364503cf3f804c2e3ea173b990f9e560257b7042a67f828fa098051bda8b&X-Amz-SignedHeaders=host" controls muted playsinline width="300" />
</p>

### [Tunder Slider](https://github.com/taewoongheo/react-native-interaction-lab/blob/main/src/interactions/TunerSlider/TunerSlider.tsx)

A tuner-style slider with snap-to-value functionality. Snaps to discrete values (0-100 in steps of 5) with smooth scrolling and momentum-based selection.

<p> 
<video src="https://github.com/user-attachments/assets/473bdee5-bdc4-4b9a-8488-7700fe218a7c" controls muted playsinline width="300" />
</p>

### [Inline Text Swap](https://github.com/taewoongheo/react-native-interaction-lab/blob/main/src/interactions/inline-text-swap/InlineTextSwap.tsx)

Swaps inline text on touch

<p> 
<video src="https://private-user-images.githubusercontent.com/127009780/435233366-abd7cf2f-2ff3-46dd-828c-469108452701.mp4?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDQ5ODk5NDgsIm5iZiI6MTc0NDk4OTY0OCwicGF0aCI6Ii8xMjcwMDk3ODAvNDM1MjMzMzY2LWFiZDdjZjJmLTJmZjMtNDZkZC04MjhjLTQ2OTEwODQ1MjcwMS5tcDQ_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNDE4JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDQxOFQxNTIwNDhaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0zZDVmYzMyNjJlMDc5NDM3YzA5ZGYzNjliNDFlOWY2ZDNlZjUxNjUzZWI0OWNlNTMxMGVhMTIyYmZjOTEwNjA3JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.9_8lcZ71PpEuolMOjP1BKkIWxwCTTkJqVn7aGckg0Rw" controls muted playsinline width="300" />
</p>

### [Ripple Effect](https://github.com/taewoongheo/react-native-interaction-lab/blob/main/src/interactions/ripple-effect/RippleEffect.tsx)

Circular ripple animation triggered by background touch

<p>
<video src="https://private-user-images.githubusercontent.com/127009780/435233342-608027ab-1bfe-4738-9a15-f9b7b89218fe.mp4?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDQ5ODk3NDAsIm5iZiI6MTc0NDk4OTQ0MCwicGF0aCI6Ii8xMjcwMDk3ODAvNDM1MjMzMzQyLTYwODAyN2FiLTFiZmUtNDczOC05YTE1LWY5YjdiODkyMThmZS5tcDQ_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNDE4JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDQxOFQxNTE3MjBaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT02NTA0NmE5ZmNlMDlmMjY2OWFlNTZkNDQ2MTNlNmYxMmVhYzQwZTEzMmU2ODkyZTM0YWNlZjZkM2EzMWM4NTkwJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.STvkfdZg7imswCyGfE_Fsa3VxoDWvyK-h3p0tH9Kv20" controls muted playsinline width="300" />
</p>
