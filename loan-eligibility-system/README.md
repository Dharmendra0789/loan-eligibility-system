# MoneyBeing Loan Eligibility & Lead Management

This is a Loan Eligibility and Lead Management System developed as part of the MoneyBeing Python Full Stack Developer assessment.

The application allows customers to submit their loan details and check their loan eligibility. The admin can log in, view leads, check the dashboard and manage the business rules used for eligibility checking.

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

### Tools
- Postman
- Swagger / OpenAPI
- Git & GitHub

## Features

### Customer

- Loan eligibility form
- Customer and loan details validation
- Consent validation
- Mobile number validation
- Duplicate mobile number checking
- Credit score generation using a mock service
- Loan eligibility checking
- Rejection reasons when a customer is not eligible

### Admin

- Admin login
- JWT based authentication
- Dashboard
- Total leads count
- Eligible leads count
- Rejected leads count
- Average credit score
- Search leads
- Filter leads
- Pagination
- Business rule management

## Business Rule Engine (BRE)

The application uses a Business Rule Engine to check the loan eligibility of a customer.

The rules are stored in the database instead of being directly written in the application logic. This allows the admin to change the eligibility conditions without changing the source code.

The supported operators are:

- >
- >=
- <
- <=
- ==
- =
- !=

Some of the rules used in the application include:

- Age should meet the required age
- Credit score should meet the required score
- Monthly income should meet the required income
- Loan amount should be within the allowed limit
- Loan amount compared with property value should be within the allowed ratio

If a customer does not satisfy one or more rules, the application returns `Not Eligible` along with the reason for rejection.

## Credit Score

For this assessment, a mock credit score service is used instead of a real credit bureau API.

The score is generated using the customer's mobile number. The same mobile number produces the same score, which makes it easier to test the application.

The credit score service is available here:

```text
backend/app/services/credit_score.py