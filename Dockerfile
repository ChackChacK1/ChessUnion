FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY target/ChessUnion-0.0.2.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]