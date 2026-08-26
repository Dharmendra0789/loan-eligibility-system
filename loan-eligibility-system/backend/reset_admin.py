from app.database import SessionLocal
from app.models import AdminUser
from app.auth.security import hash_password

db = SessionLocal()

admin = db.query(AdminUser).filter(AdminUser.username == "admin").first()

if admin:
    admin.password_hash = hash_password("Admin@123")
    admin.is_active = True
    db.commit()
    print("Admin password updated successfully")
else:
    admin = AdminUser(
        username="admin",
        password_hash=hash_password("Admin@123"),
        is_active=True
    )
    db.add(admin)
    db.commit()
    print("Admin user created successfully")

db.close()