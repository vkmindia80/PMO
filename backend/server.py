from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import motor.motor_asyncio
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
import aiofiles
from pathlib import Path
from passlib.context import CryptContext
from jose import JWTError, jwt

load_dotenv()

app = FastAPI(title="Advanced Portfolio & Project Management System", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.portfolio_db

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Create uploads directory
upload_dir = Path("uploads")
upload_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Pydantic models
from pydantic import BaseModel, Field
from typing import Any, Dict

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    title: Optional[str] = None
    bio: Optional[str] = None
    skills: List[str] = []
    social_links: Dict[str, str] = {}

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserCreate(BaseModel):
    name: str
    email: str
    title: Optional[str] = None
    bio: Optional[str] = None
    skills: List[str] = []
    social_links: Dict[str, str] = {}

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    title: Optional[str] = None
    bio: Optional[str] = None
    skills: List[str] = []
    social_links: Dict[str, str] = {}
    created_at: datetime
    updated_at: datetime

class ProjectCreate(BaseModel):
    title: str
    description: str
    technologies: List[str] = []
    status: str = "planning"  # planning, in-progress, completed, on-hold
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    project_type: str = "software"  # software, design, business, other
    priority: str = "medium"  # low, medium, high, critical
    tags: List[str] = []

class ProjectResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    technologies: List[str] = []
    status: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    project_type: str
    priority: str
    tags: List[str] = []
    files: List[str] = []
    created_at: datetime
    updated_at: datetime

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"  # todo, in-progress, review, completed
    priority: str = "medium"
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None

class TaskResponse(BaseModel):
    id: str
    project_id: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

# Utility functions
def generate_id():
    return str(uuid.uuid4())

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return user

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None

async def get_user_by_email(email: str):
    return await db.users.find_one({"email": email})

async def create_demo_user(user_data):
    # Check if user already exists
    existing = await get_user_by_email(user_data["email"])
    if existing:
        return None
        
    user_id = generate_id()
    now = datetime.utcnow()
    hashed_password = get_password_hash(user_data["password"])
    
    user_doc = {
        "id": user_id,
        "name": user_data["name"],
        "email": user_data["email"],
        "password": hashed_password,
        "title": user_data["title"],
        "bio": user_data["bio"],
        "skills": user_data["skills"],
        "social_links": user_data["social_links"],
        "created_at": now,
        "updated_at": now
    }
    
    await db.users.insert_one(user_doc)
    return {k: v for k, v in user_doc.items() if k != "password"}

async def get_user_by_id(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def get_project_by_id(project_id: str):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

# API Routes

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Advanced Portfolio & Project Management System API"}

# Authentication Endpoints
@app.post("/api/auth/register", response_model=Token)
async def register(user: UserRegister):
    # Check if user already exists
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = generate_id()
    now = datetime.utcnow()
    hashed_password = get_password_hash(user.password)
    
    user_doc = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "title": user.title,
        "bio": user.bio,
        "skills": user.skills,
        "social_links": user.social_links,
        "created_at": now,
        "updated_at": now
    }
    
    await db.users.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    # Remove password from response
    user_response = {k: v for k, v in user_doc.items() if k != "password"}
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@app.post("/api/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = await get_user_by_email(user_credentials.email)
    if not user or not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    # Remove password from response
    user_response = {k: v for k, v in user.items() if k != "password"}
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@app.get("/api/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "password"}

# User Management Endpoints
@app.post("/api/users", response_model=UserResponse)
async def create_user(user: UserCreate, current_user: dict = Depends(get_current_user)):
    user_id = generate_id()
    now = datetime.utcnow()
    
    user_doc = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": None,  # No password for admin-created users
        "title": user.title,
        "bio": user.bio,
        "skills": user.skills,
        "social_links": user.social_links,
        "created_at": now,
        "updated_at": now
    }
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    await db.users.insert_one(user_doc)
    return UserResponse(**{k: v for k, v in user_doc.items() if k != "password"})

@app.get("/api/users", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 50, current_user: dict = Depends(get_current_user)):
    cursor = db.users.find().skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    return [UserResponse(**{k: v for k, v in user.items() if k != "password"}) for user in users]

@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    user = await get_user_by_id(user_id)
    return UserResponse(**{k: v for k, v in user.items() if k != "password"})

@app.put("/api/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user_update: UserCreate, current_user: dict = Depends(get_current_user)):
    # Only allow users to update their own profile or admin access
    if current_user["id"] != user_id:
        # For now, allow any authenticated user to update any profile
        # In production, you'd implement proper authorization
        pass
    
    await get_user_by_id(user_id)  # Check if user exists
    
    update_doc = {
        "name": user_update.name,
        "email": user_update.email,
        "title": user_update.title,
        "bio": user_update.bio,
        "skills": user_update.skills,
        "social_links": user_update.social_links,
        "updated_at": datetime.utcnow()
    }
    
    await db.users.update_one({"id": user_id}, {"$set": update_doc})
    updated_user = await get_user_by_id(user_id)
    return UserResponse(**{k: v for k, v in updated_user.items() if k != "password"})

# Project Management Endpoints
@app.post("/api/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, current_user: dict = Depends(get_current_user)):
    # Use current authenticated user
    user_id = current_user["id"]
    
    project_id = generate_id()
    now = datetime.utcnow()
    
    project_doc = {
        "id": project_id,
        "user_id": user_id,
        "title": project.title,
        "description": project.description,
        "technologies": project.technologies,
        "status": project.status,
        "start_date": project.start_date,
        "end_date": project.end_date,
        "project_type": project.project_type,
        "priority": project.priority,
        "tags": project.tags,
        "files": [],
        "created_at": now,
        "updated_at": now
    }
    
    await db.projects.insert_one(project_doc)
    return ProjectResponse(**project_doc)

@app.get("/api/projects", response_model=List[ProjectResponse])
async def get_projects(
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    project_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    # If no user_id specified, use current user's projects
    if not user_id:
        user_id = current_user["id"]
    
    query = {"user_id": user_id}
    if status:
        query["status"] = status
    if project_type:
        query["project_type"] = project_type
    
    cursor = db.projects.find(query).skip(skip).limit(limit).sort("created_at", -1)
    projects = await cursor.to_list(length=limit)
    return [ProjectResponse(**project) for project in projects]

@app.get("/api/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    project = await get_project_by_id(project_id)
    # Ensure user can only access their own projects
    if project["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return ProjectResponse(**project)

@app.put("/api/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, project_update: ProjectCreate, current_user: dict = Depends(get_current_user)):
    project = await get_project_by_id(project_id)
    # Ensure user can only update their own projects
    if project["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_doc = {
        "title": project_update.title,
        "description": project_update.description,
        "technologies": project_update.technologies,
        "status": project_update.status,
        "start_date": project_update.start_date,
        "end_date": project_update.end_date,
        "project_type": project_update.project_type,
        "priority": project_update.priority,
        "tags": project_update.tags,
        "updated_at": datetime.utcnow()
    }
    
    await db.projects.update_one({"id": project_id}, {"$set": update_doc})
    updated_project = await get_project_by_id(project_id)
    return ProjectResponse(**updated_project)

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    project = await get_project_by_id(project_id)
    # Ensure user can only delete their own projects
    if project["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete associated tasks
    await db.tasks.delete_many({"project_id": project_id})
    
    # Delete the project
    await db.projects.delete_one({"id": project_id})
    
    return {"message": "Project and associated tasks deleted successfully"}

# Task Management Endpoints
@app.post("/api/projects/{project_id}/tasks", response_model=TaskResponse)
async def create_task(project_id: str, task: TaskCreate):
    await get_project_by_id(project_id)  # Validate project exists
    
    task_id = generate_id()
    now = datetime.utcnow()
    
    task_doc = {
        "id": task_id,
        "project_id": project_id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "due_date": task.due_date,
        "estimated_hours": task.estimated_hours,
        "completed_at": None,
        "created_at": now,
        "updated_at": now
    }
    
    await db.tasks.insert_one(task_doc)
    return TaskResponse(**task_doc)

@app.get("/api/projects/{project_id}/tasks", response_model=List[TaskResponse])
async def get_project_tasks(project_id: str, status: Optional[str] = None):
    await get_project_by_id(project_id)  # Validate project exists
    
    query = {"project_id": project_id}
    if status:
        query["status"] = status
    
    cursor = db.tasks.find(query).sort("created_at", -1)
    tasks = await cursor.to_list(length=None)
    return [TaskResponse(**task) for task in tasks]

@app.put("/api/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_update: TaskCreate):
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_doc = {
        "title": task_update.title,
        "description": task_update.description,
        "status": task_update.status,
        "priority": task_update.priority,
        "due_date": task_update.due_date,
        "estimated_hours": task_update.estimated_hours,
        "updated_at": datetime.utcnow()
    }
    
    # Set completed_at if status is completed
    if task_update.status == "completed" and task["status"] != "completed":
        update_doc["completed_at"] = datetime.utcnow()
    elif task_update.status != "completed":
        update_doc["completed_at"] = None
    
    await db.tasks.update_one({"id": task_id}, {"$set": update_doc})
    updated_task = await db.tasks.find_one({"id": task_id})
    return TaskResponse(**updated_task)

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.tasks.delete_one({"id": task_id})
    return {"message": "Task deleted successfully"}

# File Upload Endpoints
@app.post("/api/projects/{project_id}/upload")
async def upload_file(project_id: str, file: UploadFile = File(...)):
    await get_project_by_id(project_id)  # Validate project exists
    
    # Validate file size
    max_size = int(os.getenv("MAX_FILE_SIZE", 10485760))  # 10MB default
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > max_size:
        raise HTTPException(status_code=413, detail="File too large")
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{project_id}_{generate_id()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    # Update project with file reference
    await db.projects.update_one(
        {"id": project_id},
        {"$push": {"files": unique_filename}}
    )
    
    return {"filename": unique_filename, "message": "File uploaded successfully"}

# Analytics Endpoints
@app.get("/api/analytics/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    query = {"user_id": user_id}
    
    # Project statistics
    total_projects = await db.projects.count_documents(query)
    completed_projects = await db.projects.count_documents({**query, "status": "completed"})
    in_progress_projects = await db.projects.count_documents({**query, "status": "in-progress"})
    
    # Task statistics
    user_projects = await db.projects.find({"user_id": user_id}, {"id": 1}).to_list(length=None)
    project_ids = [p["id"] for p in user_projects]
    
    task_query = {}
    if project_ids:
        task_query["project_id"] = {"$in": project_ids}
    
    total_tasks = await db.tasks.count_documents(task_query)
    completed_tasks = await db.tasks.count_documents({**task_query, "status": "completed"})
    
    # Project types distribution
    pipeline = [
        {"$match": query},
        {"$group": {"_id": "$project_type", "count": {"$sum": 1}}}
    ]
    project_types = await db.projects.aggregate(pipeline).to_list(length=None)
    
    return {
        "projects": {
            "total": total_projects,
            "completed": completed_projects,
            "in_progress": in_progress_projects,
            "completion_rate": round((completed_projects / total_projects * 100) if total_projects > 0 else 0, 1)
        },
        "tasks": {
            "total": total_tasks,
            "completed": completed_tasks,
            "completion_rate": round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1)
        },
        "project_types": {pt["_id"]: pt["count"] for pt in project_types}
    }

# Demo data creation endpoint
@app.post("/api/demo/create-users")
async def create_demo_users():
    """Create demo users for testing - remove in production"""
    demo_users = [
        {
            "name": "John Doe",
            "email": "john.doe@demo.com",
            "password": "demo123",
            "title": "Full Stack Developer",
            "bio": "Passionate developer with 5+ years of experience in web development",
            "skills": ["JavaScript", "Python", "React", "FastAPI", "MongoDB"],
            "social_links": {
                "github": "https://github.com/johndoe",
                "linkedin": "https://linkedin.com/in/johndoe"
            }
        },
        {
            "name": "Sarah Smith", 
            "email": "sarah.smith@demo.com",
            "password": "demo123",
            "title": "UX/UI Designer",
            "bio": "Creative designer focused on user-centered design and digital experiences",
            "skills": ["Figma", "Adobe Creative Suite", "Prototyping", "User Research"],
            "social_links": {
                "behance": "https://behance.net/sarahsmith",
                "linkedin": "https://linkedin.com/in/sarahsmith"
            }
        },
        {
            "name": "Mike Johnson",
            "email": "mike.johnson@demo.com", 
            "password": "demo123",
            "title": "Project Manager",
            "bio": "Experienced project manager specializing in agile methodologies and team leadership",
            "skills": ["Scrum", "Agile", "Jira", "Team Leadership", "Risk Management"],
            "social_links": {
                "linkedin": "https://linkedin.com/in/mikejohnson"
            }
        }
    ]
    
    created_users = []
    for user_data in demo_users:
        user = await create_demo_user(user_data)
        if user:
            created_users.append(user)
    
    return {"message": f"Created {len(created_users)} demo users", "count": len(created_users)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)