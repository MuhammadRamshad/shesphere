
# SheSphere

This is a comprehensive web application designed for women's wellness, safety, and health tracking.

## Project Structure

The project is divided into two main parts:

- **Frontend**: React application with TypeScript
- **Backend**: Express server with MongoDB database

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/shesphere
   ```
   Replace the MONGODB_URI with your actual MongoDB connection string if needed.

4. Build the TypeScript code:
   ```
   npm run build
   ```

5. Start the server:
   ```
   npm start
   ```

The backend server should now be running on http://localhost:3000.

### Frontend Setup

1. Navigate to the frontend directory (from the project root):
   ```
   cd .
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The frontend application should now be running on http://localhost:3000.

## Features

- Period Tracking
- Safety Alert System
- Resource Library
- Product Shop
- Health Information

## Database Collections

- Users
- Products
- Reviews
- Resources
- PeriodData
- SafetyAlerts
- SafetyContacts
- Symptoms

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Reviews
- `GET /api/reviews` - Get reviews for a product
- `POST /api/reviews` - Create a new review
- `PATCH /api/reviews/:id/helpful` - Update review helpful count

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get resource by ID
- `POST /api/resources` - Create a new resource

### Period Data
- `GET /api/period-data` - Get period data for a user
- `POST /api/period-data` - Save period data

### Safety
- `GET /api/safety/contacts` - Get safety contacts for a user
- `POST /api/safety/contacts` - Create a new safety contact
- `DELETE /api/safety/contacts/:id` - Delete a safety contact
- `GET /api/safety/alerts` - Get safety alerts for a user
- `POST /api/safety/alerts` - Create a new safety alert
