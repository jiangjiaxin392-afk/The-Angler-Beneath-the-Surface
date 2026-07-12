# The Angler: Beneath the Surface?

**Final Project / Computational Arts**

This repository contains the development files for *The Angler: Beneath the Surface?*, a screen-based interactive artwork that uses the process of lure fishing to explore how people ask questions through AI, receive uncertain responses, and decide what those responses mean.

## Project Summary

The work is planned as an interactive screen-based installation. A participant enters a fishing-like digital interface, chooses conditions such as location, weather, target fish, lure type, and retrieve style, and enters a question or intention. These choices shape a prompt sent to an AI system.

The AI response is translated into a visual "catch". The catch may be useful, partial, misleading, unrelated, non-target, or empty. The participant then decides whether to accept the result, reject it, adjust the conditions, or try again.

## Core Question

How do people make judgements when they can influence a response, but cannot fully know or control how that response is produced?

## Main Idea

The project does not claim that fish and AI systems are the same. Instead, it compares the interaction process:

1. Prepare
2. Cast
3. Wait
4. Receive a response
5. Judge the result
6. Adjust and try again

This structure is used to slow down the ordinary experience of asking AI for an answer. The work asks the audience to consider that an AI response is not automatically an answer. It still requires human interpretation, judgement, and responsibility.

## Planned Interaction Loop

```text
participant choices
  -> prompt construction
  -> OpenAI API response
  -> response category
  -> visual catch
  -> participant judgement
  -> next attempt
```

## Current Technical Direction

- Screen-based interface
- Mouse and keyboard interaction
- p5.js / JavaScript prototype
- OpenAI API for generated responses
- Visual feedback system that turns responses into catch types
- Fallback option using saved or pre-generated responses

## Repository Structure

```text
The-Angler-Beneath-the-Surface/
  README.md
  README_CN.md
  docs/
    concept-notes.md
    technical-plan.md
  src/
    README.md
  assets/
    README.md
  sketches/
    README.md
  prototypes/
    README.md
```

## Status

Early development stage. The first goal is to build a minimal prototype that connects:

```text
condition selection -> prompt -> AI response -> visual catch -> retry loop
```

