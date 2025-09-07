# 📄 Project Notes: Initial Setup - LogMiner

## ✅ Summary of Work
I created the **MVC structure** for the project and set up all necessary packages and base classes for future development.

### 📂 Project Structure
- `controller` – API endpoints for `User`, `Project`, and `Log` management.
- `model` – Entities: `User`, `Project`, `Log`, and `Role`.
- `repository` – JPA Repositories for database operations.
- `service` – Service layer (with service interfaces and `impl` package for their implementations).
- `security` – Security configuration package.
- `security.jwt` – Dedicated JWT management package (currently contains `JwtUtil` class only).

---

## ✅ Implemented
- Created project **package structure (MVC compliant)**.
- Defined **models**: `User`, `Project`, `Log`, `Role`.
- Created **JwtUtil class** to handle JWT token generation and validation.

---

## 🚧 Pending (For Future Tickets)
- Implement `JwtRequestFilter` for request interception and token validation.
- Complete `SecurityConfig` to configure secured endpoints and integrate JWT filter.
- Implement `AuthController` for login and token issuance.
- Add **user registration** and database persistence logic.
- Add **role-based access control** in security configuration.

---

## 🔧 Notes
- JWT setup is **partially implemented**: only the `JwtUtil` is completed.
- All other security components will be implemented in upcoming tasks.

---

Feel free to ask me if you need any clarifications or additional explanations! 😊
