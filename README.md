# Nex.RentalHub — Backend API

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- bcryptjs for password hashing

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env
# Fill in your MONGO_URI

# 3. Seed the database with sample cars
npm run seed

# 4. Start development server
npm run dev

# 5. Start production server
npm start
```

---

## Folder Structure

```
nex-rentalhub-backend/
├── models/
│   ├── Car.js
│   ├── Booking.js
│   └── User.js
├── routes/
│   ├── cars.js
│   ├── bookings.js
│   └── users.js
├── scripts/
│   └── seed.js
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

---

## API Reference

### Health
| Method | Endpoint        | Description          |
|--------|-----------------|----------------------|
| GET    | /api/health     | Server health check  |

---

### Cars

| Method | Endpoint        | Description          |
|--------|-----------------|----------------------|
| GET    | /api/cars       | Get all cars         |
| GET    | /api/cars/:id   | Get single car       |
| POST   | /api/cars       | Create a car (admin) |
| PATCH  | /api/cars/:id   | Update a car (admin) |
| DELETE | /api/cars/:id   | Delete a car (admin) |

**GET /api/cars — Query Filters:**
- `carType` — sedan | SUV | luxury | compact | minivan
- `fuelType` — petrol | diesel | electric
- `minPrice` — number
- `maxPrice` — number
- `available` — true | false

**Example:**
```
GET /api/cars?carType=SUV&minPrice=50&maxPrice=120&available=true
```

---

### Bookings

| Method | Endpoint                      | Description               |
|--------|-------------------------------|---------------------------|
| POST   | /api/bookings                 | Create a booking          |
| GET    | /api/bookings?userEmail=xxx   | Get bookings for a user   |
| GET    | /api/bookings/:id             | Get single booking        |
| PATCH  | /api/bookings/:id/status      | Update booking status     |

**POST /api/bookings — Body:**
```json
{
  "carId": "64f...",
  "userEmail": "jane@example.com",
  "startDate": "2024-08-01",
  "endDate": "2024-08-05"
}
```
> `totalPrice` is auto-calculated: `pricePerDay × rentalDays`

**PATCH /api/bookings/:id/status — Body:**
```json
{ "status": "confirmed" }
```
Valid values: `pending` | `confirmed` | `cancelled`

---

### Users

| Method | Endpoint               | Description          |
|--------|------------------------|----------------------|
| POST   | /api/users/register    | Register a user      |
| POST   | /api/users/login       | Login                |
| GET    | /api/users/:email      | Get user by email    |

**POST /api/users/register — Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

---

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "count": 8
}
```

Errors:
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```
