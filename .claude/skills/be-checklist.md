# Backend PR Checklist

## API Design

- [ ] RESTful conventions followed (or GraphQL schema appropriate)
- [ ] HTTP methods appropriate (GET/POST/PUT/PATCH/DELETE)
- [ ] Status codes correct (200, 201, 400, 401, 403, 404, 500)
- [ ] Response format consistent
- [ ] API versioning considered
- [ ] Rate limiting needed

## Input Validation

- [ ] All inputs validated (DTO validation)
- [ ] SQL Injection prevented
- [ ] XSS prevented
- [ ] File upload validated (type, size)
- [ ] Boundary values tested (min, max, null, empty)

## Authentication/Authorization

- [ ] Protected endpoints require authentication
- [ ] Permission checks appropriate
- [ ] JWT/session handling appropriate
- [ ] Sensitive data access restricted
- [ ] CORS settings appropriate

## Database

- [ ] Query optimization (no N+1 problems)
- [ ] Indexes needed
- [ ] Transaction scope appropriate
- [ ] No deadlock potential
- [ ] Migration rollback possible
- [ ] Soft delete vs Hard delete appropriate

## Error Handling

- [ ] Exception handling appropriate
- [ ] Error messages user-friendly (no internal info exposed)
- [ ] Global exception handler used
- [ ] Error logging appropriate
- [ ] Retry logic needed

## Logging/Monitoring

- [ ] Appropriate log levels used (debug, info, warn, error)
- [ ] No sensitive info in logs
- [ ] Request tracking ID (correlation ID)
- [ ] Metric collection points

## Performance

- [ ] No unnecessary DB calls
- [ ] Caching needed
- [ ] Pagination applied
- [ ] Async processing appropriate
- [ ] Large data streaming handled
- [ ] Connection pool configured

## Concurrency/Distributed

- [ ] No race conditions
- [ ] Distributed lock needed
- [ ] Idempotency guaranteed
- [ ] Message queue handling (retry, DLQ)
- [ ] Distributed transactions considered

## Security

- [ ] No hardcoded secrets/keys
- [ ] Config managed via environment variables
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Dependency security vulnerabilities checked

## Testing

- [ ] Unit test coverage
- [ ] Integration tests (DB, external services)
- [ ] API tests (E2E)
- [ ] Mocks used appropriately
- [ ] Edge cases tested
- [ ] Load testing needed

## Documentation

- [ ] API docs updated (Swagger/OpenAPI)
- [ ] README update needed
- [ ] Comments accurate
- [ ] CHANGELOG updated

---

## YesTravel Backend Conventions

### Coding Style

- [ ] **No await in for loops** - Use `Promise.all()` + `map()` pattern
- [ ] **No single-letter variables** - Use `item`, `product` instead of `i`, `p`, `x`
- [ ] **Functional methods** - Use `map`, `filter`, `reduce` instead of `for` loops

### Schema & Type Patterns

- [ ] **DTO files separated** - No interface definitions inside Service files, use `*.dto.ts`
- [ ] **nullish() unified** - Use `nullish()` instead of `optional().nullable()`
- [ ] **Update schema pattern** - Use `createSchema.extend({ id: z.number() })`
- [ ] **Entity retrieval** - Use `findOneOrFail` + `.catch()` pattern

### tRPC + NestJS Architecture

- [ ] **Router decorator import** - Must import from `'nestjs-trpc'` package
- [ ] **Router not in providers** - Router should NOT be in Module's providers (auto-discovered)
- [ ] **MessagePattern naming** - Follow `moduleName.methodName` pattern
- [ ] **Schema validation** - Input/output schema defined in Router
- [ ] **Response formatting** - Controller formats response to match schema (remove TypeORM metadata)

### Repository Patterns

- [ ] **No TypeOrmModule.forFeature()** - Use `RepositoryProvider` only
- [ ] **Custom repository extend()** - Use `.extend({})` pattern, NOT `Object.assign()`
- [ ] **Entity location** - All entities in `apps/api/src/module/backoffice/domain/`

### Transaction Management

- [ ] **@Transactional decorator** - Applied to mutation methods in Service
- [ ] **TransactionService injection** - Controller must inject `TransactionService`

### Migration Rules

- [ ] **Use yarn migration:create** - Don't let AI generate timestamp manually
- [ ] **INHERITS columns** - Add/remove columns on parent table only (auto-inherited)
- [ ] **No TypeORM inheritance decorators** - Don't use `@TableInheritance`, `@ChildEntity`
- [ ] **Parent table query** - Use Raw Query for INHERITS parent table (no QueryBuilder)

### Entity Conventions

- [ ] **Soft delete auto-applied** - No need for `deletedAt: null` condition
- [ ] **Nullish type** - Use `Nullish<T>` from `@src/types/utility.type` for nullable columns

### Enum Naming

- [ ] **Value array**: `{NAME}_ENUM_VALUE` (e.g., `ROLE_ENUM_VALUE`)
- [ ] **Type**: `{Name}EnumType` (e.g., `RoleEnumType`)
- [ ] **Object**: `{Name}Enum` (e.g., `RoleEnum`)
- [ ] **Schema**: `{name}EnumSchema` (e.g., `roleEnumSchema`)

### Index & Constraints

- [ ] **Composite index** - Add for frequently queried column combinations
- [ ] **Foreign key** - Must be added to each INHERITS child table individually

### Error Handling

- [ ] **NestJS HttpException** - Use `NotFoundException`, `BadRequestException`, etc.
- [ ] **Auto-converted to tRPC** - Errors automatically converted to appropriate tRPC error codes