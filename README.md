Here’s a suggested README structure for the Task Management API project based on the provided information:

---

# Task Management API

This API manages tasks with functionalities like creating, delegating, deleting, updating tasks, and filtering tasks by priority, status, and tags.

## Features

- **Task Creation**: Create new tasks with details like priority, status, and tags.
- **Task Delegation**: Assign tasks to users.
- **Task Update**: Modify task details.
- **Task Deletion**: Remove tasks.
- **Filtering**: Filter tasks based on priority, status, and tags.

## Installation

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

### Steps to Set Up

1. Clone the repository:

   ```bash
   git clone https://github.com/pdagboola/task_management_hng.git
   cd task_management_hng
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the following variables:

   - `DB_URL`: Your PostgreSQL database connection string.
   - `SECRET_KEY`: A secret key used for JWT authentication.

4. Run the application:
   ```bash
   node app.js
   ```

## API Endpoints

### POST `/tasks`

- **Description**: Create a new task.
- **Request Body**: `{ "title": "Task Title", "priority": "High", "status": "Pending", "tags": ["Tag1"] }`
- **Response**: Task details with a success message.

### GET `/tasks`

- **Description**: Get all tasks.
- **Query Parameters**: `priority`, `status`, `tags` for filtering.
- **Response**: List of tasks based on the filters.

### PUT `/tasks/:id`

- **Description**: Update an existing task.
- **Request Body**: `{ "title": "Updated Task", "status": "Completed" }`
- **Response**: Updated task details.

### DELETE `/tasks/:id`

- **Description**: Delete a task by ID.
- **Response**: Confirmation message.

## License

This project is licensed under the MIT License.

---

Feel free to tweak the details based on further requirements or the full code structure.
