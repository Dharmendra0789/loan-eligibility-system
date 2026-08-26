BEGIN TRANSACTION;CREATE TABLE admin_users (
	id INTEGER NOT NULL, 
	username VARCHAR(100) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (username)
);INSERT INTO "admin_users" VALUES(1,'admin','$2b$12$iFvf.SXpVA/zyvK7WKIaiukVuyCDArdwuTrc.RHUi8hWOSauHZ57.',1);CREATE TABLE business_rules (
	id INTEGER NOT NULL, 
	field_name VARCHAR(100) NOT NULL, 
	operator VARCHAR(10) NOT NULL, 
	value FLOAT NOT NULL, 
	active BOOLEAN NOT NULL, 
	description VARCHAR(255), 
	PRIMARY KEY (id)
);INSERT INTO "business_rules" VALUES(1,'age','>=',21.0,1,'Age must be at least 21');INSERT INTO "business_rules" VALUES(2,'age','<=',60.0,1,'Age must not exceed 60');INSERT INTO "business_rules" VALUES(3,'monthly_income','>=',30000.0,1,'Monthly income below minimum requirement');INSERT INTO "business_rules" VALUES(4,'credit_score','>=',700.0,1,'Credit score below minimum requirement');CREATE TABLE leads (
	id INTEGER NOT NULL, 
	full_name VARCHAR(120) NOT NULL, 
	mobile VARCHAR(20) NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	date_of_birth DATE NOT NULL, 
	city VARCHAR(100) NOT NULL, 
	pincode VARCHAR(10) NOT NULL, 
	loan_type VARCHAR(50) NOT NULL, 
	employment_type VARCHAR(50) NOT NULL, 
	monthly_income FLOAT NOT NULL, 
	loan_amount FLOAT NOT NULL, 
	property_value FLOAT NOT NULL, 
	consent BOOLEAN NOT NULL, 
	credit_score INTEGER, 
	bre_status VARCHAR(30), 
	rejection_reasons TEXT, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id)
);INSERT INTO "leads" VALUES(1,'Rahul Kumar','9876543210','rahul.kumar@example.com','1998-05-20','Jaipur','302001','Home Loan','Salaried',50000.0,500000.0,1000000.0,1,695,'Not Eligible','["Credit score below minimum requirement"]','2026-08-25 12:08:26.407966');INSERT INTO "leads" VALUES(2,'Amit Sharma','9876543211','amit.sharma@example.com','1995-05-20','Rajgir','803116','Home Loan','Salaried',60000.0,3000000.0,5000000.0,1,696,'Not Eligible','["Credit score below minimum requirement"]','2026-08-25 12:22:32.082833');INSERT INTO "leads" VALUES(3,'Vikash Singh','9123456789','vikash.singh2026@demo.com','1992-11-15','Patna','800001','Home Loan','Salaried',80000.0,2000000.0,5000000.0,1,704,'Eligible','[]','2026-08-25 12:24:06.685498');INSERT INTO "leads" VALUES(4,'Rahul Kumar','9876543212','rahul@gmail.com','1995-08-15','jaipur','302001','Home Loan','Salaried',60000.0,1999999.0,7999999.0,1,697,'Not Eligible','["Credit score below minimum requirement"]','2026-08-25 14:37:40.435749');INSERT INTO "leads" VALUES(5,'Rahul Kumar','0987654321','rahul@gmail.com','1995-08-15','jaipur','302001','Home Loan','Salaried',60000.0,6000000.0,8000000.0,1,695,'Not Eligible','["Credit score below minimum requirement"]','2026-08-25 15:43:10.204203');INSERT INTO "leads" VALUES(6,'Rahul Sharma','98765432210','rahultest@gmail.com','1995-08-15','jaipur','302001','Home Loan','Salaried',60000.0,2000000.0,3000000.0,1,697,'Not Eligible','["Credit score below minimum requirement"]','2026-08-25 15:53:22.504279');INSERT INTO "leads" VALUES(7,'Rahul Kumar','9876543215','rahul@gmail.com','1995-08-15','jaipur','302001','Home Loan','Salaried',60000.0,2000000.0,3000000.0,1,700,'Eligible','[]','2026-08-25 15:56:46.340468');INSERT INTO "leads" VALUES(8,'Rahul Kumar','1020304550','rahul@gmail.com','2004-06-15','jaipur','302001','Home Loan','Salaried',60000.0,2000000.0,2999997.0,1,670,'Not Eligible','["Credit score below minimum requirement"]','2026-08-25 15:58:59.209345');INSERT INTO "leads" VALUES(9,'Test Customer','9876543206','test700@gmail.com','1995-01-01','jaipur','302001','Home Loan','Salaried',50000.0,400000.0,599995.0,1,700,'Not Eligible','["Credit score below minimum requirement"]','2026-08-25 16:28:58.664738');INSERT INTO "leads" VALUES(10,'Demo Eligible','9876543218','demoeligible@gmail.com','1995-01-01','jaipur','302001','Home Loan','Salaried',50000.0,400000.0,599997.0,1,703,'Eligible','[]','2026-08-25 16:32:37.856676');INSERT INTO "leads" VALUES(11,'Test Customer','9876543219','testcustomer@gmail.com','1995-05-15','Jaipur','302001','Home Loan','Salaried',50000.0,2000000.0,3000000.0,1,704,'Eligible','[]','2026-08-25 16:57:29.421579');INSERT INTO "leads" VALUES(12,'Test Frontend','9876543256','testfrontend@gmail.com','1998-01-01','jaipur','302001','Home Loan','Salaried',50000.0,200000.0,300000.0,1,705,'Eligible','[]','2026-08-25 17:09:15.382937');INSERT INTO "leads" VALUES(13,'dharu raj','7080901000','raj@gmail.com','1999-02-09','jaipur','302001','Home Loan','Salaried',50000.0,2000000.0,2999997.0,1,675,'Not Eligible','["Credit score below minimum requirement"]','2026-08-25 18:03:14.089658');INSERT INTO "leads" VALUES(14,'Amit Sharma','9123456780','amit.sharma@testmail.com','1995-11-20','Delhi','110001','Home Loan','Self Employed',75000.0,1500000.0,2500000.0,1,695,'Not Eligible','["Credit score below minimum requirement"]','2026-08-25 21:02:51.314485');INSERT INTO "leads" VALUES(15,'yash','4060102030','yash@gmail.com','1995-01-01','jaipur','302001','Home Loan','Salaried',100000.0,2000000.0,4999998.0,1,666,'Not Eligible','["Credit score below minimum requirement"]','2026-08-25 21:18:34.989624');INSERT INTO "leads" VALUES(16,'Test Eligible','9876543299','testeligible@gmail.com','1995-01-01','Jaipur','302001','Home Loan','Salaried',50000.0,2000000.0,3000000.0,1,712,'Eligible','[]','2026-08-26 05:20:14.922615');INSERT INTO "leads" VALUES(17,'roko','8090405030','roko@gmail.com','1998-06-16','bihar','803142','Home Loan','Salaried',60000.0,2000000.0,2999999.0,1,679,'Not Eligible','["Credit score below minimum requirement"]','2026-08-26 06:11:45.803779');CREATE INDEX ix_leads_id ON leads (id);CREATE UNIQUE INDEX ix_leads_mobile ON leads (mobile);CREATE INDEX ix_business_rules_id ON business_rules (id);CREATE INDEX ix_admin_users_id ON admin_users (id);COMMIT;