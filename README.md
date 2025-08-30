```text
                                                                                                                                   
      # ###                        ###         ##       #####    ##                                  ##### /    ##      # ###      
    /  /###  /                 #    ###         ##   ######  /  #### / #                          ######  /  #####    /  /###  /   
   /  /  ###/                 ###    ##         ##  /#   /  /   ####/ ###                        /#   /  /     ##### /  /  ###/    
  /  ##   ##                   #     ##         ## /    /  /    # #    #                        /    /  ##     # ## /  ##   ##     
 /  ###                              ##         ##     /  /     #                                   /  ###     #   /  ###          
##   ##         ##   ####    ###     ##     ### ##    ## ##     #    ###   ###  /###     /##       ##   ##     #  ##   ##          
##   ##   ###    ##    ###  / ###    ##    #########  ## ##     #     ###   ###/ #### / / ###      ##   ##     #  ##   ##   ###    
##   ##  /###  / ##     ###/   ##    ##   ##   ####   ## ########      ##    ##   ###/ /   ###     ##   ##     #  ##   ##  /###  / 
##   ## /  ###/  ##      ##    ##    ##   ##    ##    ## ##     #      ##    ##       ##    ###    ##   ##     #  ##   ## /  ###/  
##   ##/    ##   ##      ##    ##    ##   ##    ##    ## ##     ##     ##    ##       ########     ##   ##     #  ##   ##/    ##   
 ##  ##     #    ##      ##    ##    ##   ##    ##    #  ##     ##     ##    ##       #######       ##  ##     #   ##  ##     #    
  ## #      /    ##      ##    ##    ##   ##    ##       /       ##    ##    ##       ##             ## #      #    ## #      /    
   ###     /     ##      /#    ##    ##   ##    /#   /##/        ##    ##    ##       ####    /       ###      #     ###     /     
    ######/       ######/ ##   ### / ### / ####/    /  #####      ##   ### / ###       ######/         #########      ######/      
      ###          #####   ##   ##/   ##/   ###    /     ##             ##/   ###       ##### m          #### ###       ###        
                                                   #                                          i                ###                 
                                                    ##                                        n    ########     ###                
                                                                                              u  /############  /#                 
                                                                                              s /           ###/                   
```





<div align="center">
  <h1>GuildHire-YG</h1>
  <p>AI-powered job portal enabling real-time candidate–recruiter collaboration and AI-assisted screening.</p>
  <p>
    <a href="backend/README.md">Backend Docs</a>
  </p>
</div>

## Overview

GuildHire-YG is a production-ready, full-stack job platform connecting job seekers and recruiters. It features secure role-based authentication, AI-powered resume scoring, real-time chat, and comprehensive job and application management. The system is optimized for scalability, reliability, and developer productivity.

## Key Features

- **Dual-role access**: Separate, secured experiences for job seekers and recruiters
- **Secure auth**: JWT auth, password hashing, email verification, password reset
- **Job lifecycle**: Post, edit, filter, search, and apply with one-click flows
- **AI resume scoring**: Resume analysis and actionable suggestions via Hugging Face
- **Real-time chat**: Socket.IO messaging with presence and history
- **Dashboards**: Recruiter and candidate activity insights
- **Robust APIs**: REST endpoints for users, recruiters, jobs, applications, chats, and resume scores

## Architecture

- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, Socket.IO Client
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT, Multer, Nodemailer
- **Infrastructure**: Frontend on Vercel, Backend on Render, MongoDB Atlas

```
GuildHire-YG/
├── backend/               # REST API, auth, chat, resume scoring
└── frontend/              # React SPA
```

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- Git

### 1) Clone

```bash
git clone https://github.com/yg10008/GuildHire-YG.git
cd GuildHire-YG
```

### 2) Backend setup

```bash
cd backend
npm install
```

Create `.env` in `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/Guild-Hire
JWT_SECRET=<your-secret>
EMAIL_USER=<gmail-address>
EMAIL_PASS=<gmail-app-password>
HUGGINGFACE_API_KEY=<hf-api-key>
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

Run backend (dev):

```bash
npm run dev
```

### 3) Frontend setup

```bash
cd ../frontend
npm install
```

Create `.env` in `frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

Run frontend (dev):

```bash
npm run dev
```

### Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Scripts

- Backend: `npm run dev` (nodemon), `npm start` (prod), `npm test` (if configured)
- Frontend: `npm run dev`, `npm run build`, `npm run preview`

## Security

- JWT-based auth with token blacklisting
- Password hashing with bcrypt
- Input validation on all endpoints
- CORS configured for frontend ↔ backend communication
- Safe file uploads (Multer + type validation)

## API

Refer to `backend/README.md` for detailed route docs: users, recruiters, jobs, applications, chats, resume scores.

## Deployment

- **Frontend (Vercel)**: Connect repo → set `VITE_API_URL` env → deploy
- **Backend (Render/Node)**: Create web service → set env vars from backend `.env` → deploy
- **Database (MongoDB Atlas)**: Provision cluster and update `MONGODB_URI`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing`
3. Commit: `git commit -m "feat: add amazing"`
4. Push: `git push origin feature/amazing`
5. Open a Pull Request





#



