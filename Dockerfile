# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/pom.xml ./backend/
COPY backend/src ./backend/src/
# Build the application
WORKDIR /app/backend
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
# Copy the built jar from the build stage
COPY --from=build /app/backend/target/*.jar app.jar
# Expose the standard Spring Boot port
EXPOSE 8080
# Run the jar file
ENTRYPOINT ["java","-jar","/app/app.jar"]
