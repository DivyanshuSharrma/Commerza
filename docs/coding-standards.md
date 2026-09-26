# Commerza - Naming and Coding Standards

To maintain visual and technical excellence:
1. **File Sizes**: Keep files under 300 lines of code.
2. **Exception Handling**: Always throw domain-specific exceptions (`BusinessException`, `ValidationException`) rather than generic Javascript Errors.
3. **No Direct ORM usage in Services**: Inject and consume repositories (`ProductRepository`, etc.) rather than calling Prisma directly.
4. **API Versioning**: Prefix all endpoints with version namespace `/api/v1/`.
5. **Dynamic Branding**: Inject custom CSS properties dynamically in layout contexts instead of hardcoding styles.
