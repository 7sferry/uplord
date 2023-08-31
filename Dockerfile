FROM eclipse-temurin:17-jdk-alpine AS build
ARG DOCKER_USER=0
RUN addgroup -S $DOCKER_USER && adduser -S $DOCKER_USER -G $DOCKER_USER
USER $DOCKER_USER
WORKDIR /workspace/app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src
COPY lombok.config .

RUN ./mvnw install -DskipTests
EXPOSE 8787

ENTRYPOINT ["java","-jar","target/uplord-0.0.1-SNAPSHOT.jar"]
