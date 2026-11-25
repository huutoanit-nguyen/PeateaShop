# ==========================================
# Stage 1: Build Spring Boot Application
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build jar
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Production JRE Runtime
# ==========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Security: Run as unprivileged user
RUN addgroup -S peatea && adduser -S peatea -G peatea

# Copy application jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Permissions
RUN chown -R peatea:peatea /app
USER peatea

# Render dynamically sets PORT env variable (default 8080)
ENV PORT=8080
EXPOSE ${PORT}

# JVM flags optimized for container resource limits
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT} -jar app.jar"]
