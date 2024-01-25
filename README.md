# Scratchpad
Our vision with ScratchPad is to create an AI integrated note-taking app that focuses on organizing notes, so the user can focus on taking quality notes without having to worry about the burdens of note-taking tasks. 
A typical user of ScratchPad should be able to create notes and save them (symbolic to the idea of a literal scratch pad). The app can then show the user a compiled, coherent, and aesthetic note page based on the user’s search query. For example, if the user was part of an architectural class and wrote down notes about European Architecture and the information pertaining to it; the user can have ‘Architecture’ as their search query. ScratchPad will then return a note with all information pertaining to the ‘Architecture’. 
Our goal is to create both a web-app and an iPad app, similar to existing note taking apps, in order to thoroughly meet our project’s vision. However, given the time constraints of two quarters, we would like to focus on the honing down the core functionalities of the web-app version of ScratchPad first. We anticipate this project being spread out throughout the two quarters, amongst four people.

## Development
> Environment Config: include a .env file with values for OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY
### Python environemnt setup
1. Create a virtual python environment
```python3 -m venv .venv```

2. Activate your virtual python environment
```source .venv/bin/activate```

3. **(Optional)** Check virtual environment activation
```which python``` -> should point to *.venv/bin/python*

3. Install python dependencies from requirements.txt
```python3 -m pip install -r requirements.txt```

> Note: use `deactivate` to leave virtual environment

## Logs 
Since we would like to work on the web-app version of ScratchPad first, we were able to split up the work based on each of the team member’s passions and interests. The rough layout is outlined below (note: this is subject to change throughout the quarter to give us all a chance to work on different parts of the web-app if we’d like). 

***Frontend (sameera & noah)***

1. Web App: react web app, nextjs framework (sameera)
2. Text Editor: Tiptap headless editor (noah)

***Backend (anshuman & tarini)***

1. API: python fastapi 
2. AI API: (either separate or combined) python fastapi

***AI Considerations***

We’d start by using OpenAi apis. We think that their text generation functionality along with text indexing might be enough for what we are trying to achieve with our project. If this doesn’t work/isn’t specific enough to our project then we are more than happy to write a custom nlp text generation and summarization workflows.

## Members
Anshuman Komawar
Sameera Balijepali
Tarini Srikanth
Noah Shah
