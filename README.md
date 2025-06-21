# MindSnap

MindSnap is a next-generation, community-powered learning platform that gamifies education and rewards top performers. By integrating interactive quizzes, dynamic leaderboards, and blockchain-based incentives, MindSnap creates an engaging environment where users are motivated to learn, compete, and grow together.

![alt text](images/image.png)
---

## Features

- **Interactive Quizzes:**  
  MindSnap offers a diverse set of quizzes across multiple subjects and difficulty levels. Each quiz is designed to challenge users and help them expand their knowledge base in a fun, interactive way.

- **Real-Time Leaderboards:**  
  The platform features both weekly and monthly leaderboards, allowing users to track their progress and see how they stack up against others in the community. Leaderboards update instantly as users complete quizzes and earn points.

- **User Profiles & Stats:**  
  Every user has a personalized profile displaying their name, wallet address, rank, and performance statistics. This transparency fosters healthy competition and personal accountability.

- **Blockchain-Based Rewards:**  
  Top learners are rewarded with tokens sent directly to their crypto wallets. The reward system is automated and transparent, leveraging blockchain technology to ensure fairness and security.

- **Hall of Fame:**  
  The Hall of Fame section highlights the top three performers in a visually distinct podium, celebrating their achievements and inspiring others to reach the top.

- **Responsive & Modern UI:**  
  Built with React and Tailwind CSS, MindSnap provides a seamless experience across devices, with visually appealing gradients, animations, and intuitive navigation.

- **Secure Authentication:**  
  User authentication and session management are implemented to protect user data and ensure a safe learning environment.

---

## How MindSnap Works

MindSnap is designed to make learning both rewarding and competitive:

1. **User Journey:**  
   Users sign up and create a profile. Once authenticated, they can participate in quizzes, each contributing to their overall score.

2. **Quiz Mechanics:**  
   Quizzes are dynamically loaded and scored in real-time. The system tracks attempts, correct answers, and time taken, ensuring a fair assessment of each user's performance.

3. **Leaderboard Calculation:**  
   As users complete quizzes, their scores are aggregated and ranked. The leaderboards (weekly and monthly) are updated live, reflecting the most recent activity and performance.

4. **Reward Distribution:**  
   At the end of each leaderboard cycle, the top-ranked users are eligible to claim blockchain-based rewards. The platform integrates with wallet services to securely distribute tokens, with a dedicated claim interface for winners.

5. **Recognition & Motivation:**  
   The Hall of Fame and user profile stats provide ongoing motivation, while the competitive structure encourages consistent participation and improvement.

---

## Project File Structure

Below is an overview of the main project structure, highlighting key directories and files:

```
MindSnap/
├── frontend/
│   ├── components/
│   │   ├── ui/
│   │   │   └── modal.tsx           # Reusable modal component for dialogs and popups
│   │   ├── leaderboard.tsx         # Main leaderboard UI and logic
│   │   └── ...                     # Other UI and feature components (Navbar, Cards, etc.)
│   ├── pages/
│   │   └── ...                     # Application pages (e.g., Home, Profile, Quiz)
│   ├── styles/
│   │   └── ...                     # Tailwind and custom CSS files
│   └── ...                         # App entry point, configuration, utilities
├── backend/
│   ├── api/
│   │   └── ...                     # API endpoints for quizzes, users, rewards, authentication
│   ├── services/
│   │   └── ...                     # Business logic, blockchain integration, leaderboard calculations
│   └── ...                         # Database models, configuration, middleware
├── public/
│   └── ...                         # Static assets (images, icons, etc.)
├── README.md                       # Project documentation
└── ...                             # Project configs, package.json, environment files, etc.
```

---

## Suggestions & Feedback

We are dedicated to making MindSnap a leading platform for gamified learning and rewards. If you have suggestions, feature requests, or feedback on the user experience, features, or technical implementation, please open an issue or reach out to the team. Your insights are crucial to our mission of empowering learners and building a vibrant, supportive community.

---