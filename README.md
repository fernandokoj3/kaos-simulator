# Health Controller

A simple health and resilience testing controller for a NestJS application.

This module provides:

- Health check endpoint
- Readiness probe endpoint
- Simulated unhealthy state
- Temporary readiness failures
- CPU stress testing
- Memory stress testing
- Process termination (success/failure) for chaos engineering experiments

---

## Base Route

```http
/health
```

---

# Endpoints

## Health Check

Returns the application health status.

```http
GET /health
```

### Response (Healthy)

```json
{
  "status": "ok",
  "timestamp": "2026-04-26T18:00:00.000Z"
}
```

### Response (Unhealthy)

```json
{
  "status": "Internal Server Error",
  "timestamp": "2026-04-26T18:00:00.000Z"
}
```

Status codes:

- 200 → Healthy
- 500 → Unhealthy

---

## Readiness Probe

Useful for Kubernetes readiness probes.

```http
GET /health/ready
```

Responses:

- `200 OK`
- `500 Internal Server Error`

Example Kubernetes probe:

```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

---

## Force Application Unhealthy

Marks application as unhealthy.

```http
PUT /health/unhealth
```

Response:

```text
A aplicação agora está fora.
```

Useful for:

- Failure simulation
- Chaos testing
- Probe validation

---

## Simulate Readiness Failure For N Seconds

Makes the application unavailable for a defined period.

```http
PUT /health/unreadfor/:seconds
```

Example:

```http
PUT /health/unreadfor/60
```

Response:

```text
A aplicação ficará indisponível por 60 segundos.
```

---

# Stress Testing

Requires:

```bash
stress
```

Install:

### Ubuntu/Debian

```bash
sudo apt install stress
```

### Alpine

```bash
apk add stress
```

---

## CPU Stress

Simulates CPU load.

```http
PUT /health/stress/cpu?duration=30
```

Default:

```http
30 seconds
```

Example:

```http
curl -X PUT "http://localhost:3000/health/stress/cpu?duration=60"
```

---

## Memory Stress

Simulates memory pressure.

```http
PUT /health/stress/memory?duration=30
```

Example:

```http
curl -X PUT "http://localhost:3000/health/stress/memory?duration=45"
```

Current stress profile:

- 1 worker
- 1024MB allocated
- Configurable duration

Useful for testing:

- OOM scenarios
- Kubernetes evictions
- Resource limits
- Autoscaling behavior

---

# Chaos Endpoints

## Graceful Exit (Success)

Terminates process with exit code 0

```http
PUT /health/exit/success
```

Equivalent:

```bash
process.exit(0)
```

---

## Forced Failure Exit

Terminates process with exit code 1

```http
PUT /health/exit/fail
```

Equivalent:

```bash
process.exit(1)
```

Useful for testing:

- Pod restart behavior
- Liveness probes
- Crash recovery
- Self-healing

---

## Example Liveness Probe

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10
```

---

# Chaos Engineering Use Cases

This controller can be used to simulate:

- Pod crashes
- Readiness failures
- CPU exhaustion
- Memory pressure
- Kubernetes self-healing
- Restart policies
- Probe validation
- Autoscaling tests

---

## Example Test Flow

Simulate pod becoming unready:

```bash
curl -X PUT localhost:3000/health/unreadfor/30
```

Trigger CPU stress:

```bash
curl -X PUT "localhost:3000/health/stress/cpu?duration=60"
```

Crash process:

```bash
curl -X PUT localhost:3000/health/exit/fail
```

---

## Warning

⚠ These endpoints are intended for:

- Development
- Staging
- Chaos experiments

Do **not** expose them publicly in production environments without protection.

Recommended protections:

- Authentication
- Internal network only
- Feature flags
- Environment-based disabling

---

## Stack

- NestJS
- Express
- class-transformer
- stress (linux utility)
- Kubernetes-ready probes support

---
