# MoneyBeing Loan Eligibility & Lead Management

This project is a Loan Eligibility and Lead Management System developed using Python, FastAPI, React and SQLAlchemy.

The main purpose of this project is to collect loan leads, check their eligibility based on business rules and provide an admin panel to manage leads and rules.

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication

### Frontend
- React
- Vite
- JavaScript
- CSS

### Database
- SQLite

### Other Tools
- Postman
- Swagger / OpenAPI

## Main Features

### Customer

- Loan eligibility form
- Form validation
- Consent validation
- Mobile number validation
- Duplicate mobile number check
- Mock credit score generation
- Loan eligibility checking
- Rejection reasons

### Admin

- Admin login
- JWT authentication
- Dashboard
- Total leads
- Eligible leads
- Rejected leads
- Average credit score
- Search leads
- Filter leads
- Pagination
- Business rule management

## Business Rule Engine

The project uses a Business Rule Engine (BRE) to check whether a customer is eligible for a loan.

Rules are stored in the database, so the eligibility conditions can be changed without changing the main application code.

Currently supported operators are:

- >
- >=
- <
- <=
- ==
- =
- !=

Some examples of rules are:

- Age >= required age
- Credit score >= required score
- Monthly income >= required income
- Loan amount <= allowed amount
- Loan to property value ratio <= allowed ratio

If any rule fails, the customer is marked as `Not Eligible` and the system returns the reason.

## Credit Score

For this assessment, I have used a mock credit score service instead of a real credit bureau API.

The mock score is generated using the customer's mobile number. This makes testing easy because the same mobile number gives the same score.

File:

```text
backend/app/services/credit_score.py