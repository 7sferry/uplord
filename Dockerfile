FROM eclipse-temurin:17-jdk-alpine as build
WORKDIR /workspace/app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src
COPY lombok.config .

RUN ./mvnw install -DskipTests
EXPOSE 8787

ENTRYPOINT ["java","-jar","target/uplord-0.0.1-SNAPSHOT.jar"]
