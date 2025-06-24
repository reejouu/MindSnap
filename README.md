# ⚡ MindSnap — Learn Fast. Win Faster.

**MindSnap** is a community-powered **microlearning platform** built for the next generation of learners — fast-paced, short-attention, always-on.  

We bridge the widening gap between **quality educational content** and the modern-day consumption habit formed by short-form content like Reels, Shorts, and TikToks. 

Using **AI**, **gamification**, and **Web3 rewards**, MindSnap makes learning addictive, engaging, and rewarding.
<br><br>

![Hero](images/image.png)
<br><br>

## 🚀 Features

### 📥 Upload Anything  
Drop in a **YouTube link**, **PDF**, **image**, **voice**, or **raw text** — MindSnap transforms it into a deck of engaging, AI-powered flashcards within seconds.


### 🎭 Choose Your Vibe  
Customize your learning tone by selecting a flashcard style:  
- **Factual** – Straight to the point  
- **Conceptual** – Deep dive into logic  
- **Story Mode** – Learn through narratives  
- **Gen Z** – Fun, casual, and relatable  


### 📄 Smart PDF Highlighting  
Upload a PDF and let our **ML model automatically highlight key lines**, ranked by confidence score, helping you scan only what matters most.


### 🔍 Focus Mode on Flashcards  
Every flashcard comes with an **AI-powered Focus Mode** — just ask the AI to:  
- **Explain** complex terms  
- **Summarize** long definitions  
- **Elaborate** on key concepts  
- **Translate** (supports Hindi, Bengali, and more)


### 🧪 Auto-Generated Quizzes  
Once flashcards are created, quizzes are **automatically generated** for each topic.  
Your quiz score:  
- Is saved in our database  
- **Dynamically updates** your leaderboard position  


### ⚔️ 1v1 Quiz Battle Royale  
Step into real-time competition with MindSnap's signature battle mode:  
- Create or join a **private quiz room** using a unique code  
- Invite friends to compete in **fast-paced 1v1 duels**  
- **Earn points, boost your rank**, and win token rewards  


### 🏆 Leaderboards & Blockchain Rewards  
- **Live Leaderboards** track top performers (weekly & monthly)  
- **Hall of Fame** features the best learners on a visual podium  
- **Token Rewards** sent directly to your connected crypto wallet  

> 💡 **Smart Contract deployed on Base Sepolia:**  
> [`0x0275e553e47c4f11074bdFe4651164b98906c0F4`](https://sepolia.basescan.org/address/0x0275e553e47c4f11074bdFe4651164b98906c0F4)


### 👤 User Profiles  
View your rank, stats, quiz history, and wallet — all in one place.


### 🔐 Secure Authentication  
Powered by **Civic Auth**, ensuring secure logins and private, Web3-ready sessions.

---
## 🧭 How It All Works

A snapshot of the entire workflow, from upload to leaderboard:

![Workflow](images/workflow.png)

## ⚙️ Installation & Running Guide

### 🔧 Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Git
- npm or yarn

---

### 1. Clone the Repo
```bash
git clone <your-repo-url>
cd MindSnap
```
### 2. Set Up Python Backend
```bash
cd agent
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
```
### 3. Set Up Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
```
### 4. Running the App
```bash
# Start Backend
cd agent
python app.py

# Start Frontend
cd ../frontend
npm run dev
```
