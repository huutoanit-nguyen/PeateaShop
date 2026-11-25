# ==========================================
# Stage 1: Build Spring Boot Application
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Configure Google Cloud Maven Central mirror to prevent 429 Too Many Requests rate limits on cloud builders
RUN mkdir -p /root/.m2 && \
    printf '<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0"><mirrors><mirror><id>google-maven-central</id><name>Google Maven Central Mirror</name><url>https://maven-central.storage-download.googleapis.com/maven2/</url><mirrorOf>central</mirrorOf></mirror></mirrors></settings>' > /root/.m2/settings.xml

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build production jar skipping tests
RUN mvn clean package -DskipTests -B

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
