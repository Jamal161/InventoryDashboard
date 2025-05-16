# Product Management Dashboard
Image folder image include , SQL script file include 
## Prerequisites

* .NET 8 SDK
* React.js and npm
* SQL Server 
* Visual Studio 

## Getting Started

### Backend Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd InventoryDashboard --- backend file 
   ```

2. Install dependencies:

   ```bash
   dotnet restore
   ```

3. Apply migrations and update the database:

   ```bash
   dotnet ef database update
   ```

4. Run the application:

   ```bash
   dotnet run
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd inventory-dashboard --- frontend file 
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

### API Endpoints

* `GET /api/products` - List all products
* `POST /api/products` - Add a new product
* `PUT /api/products/{id}` - Update a product
* `DELETE /api/products/{id}` - Delete a product

### Environment Variables

* Update the `appsettings.json` file with your database connection string.

