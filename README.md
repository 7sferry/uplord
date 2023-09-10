# uplord
simple upload to server using spring boot and thymeleaf

I use this app for transfering files between devices via upload. to use this app, change 'upload-path' in application.yml to directory you wanted, for example 'C:\' for windows or '/home/username/' for linux or any directory path. It will create subdirectories inside based on file category at startup if does not exist. then, open 'localhost:8787' to start uploading, 

if you run using dockerfile you don't need to change the application.yml, just execute this for window host: `docker build --tag uplord .` or this for linux host `docker build --build-arg DOCKER_USER=$(id -u) --tag uplord .`. Then run using `docker run -dp 8787:8787 -v /home/username:/usr/share/uplord --name uplord uplord`. It will create an image with your host user id and run using port 8787 with volume "/home/username" to get the uploaded files. you can change the volume path to your own in command.

to run using docker compose, after execute "docker build ..." above run this command: `docker compose -f compose.yaml up -d uplord-service`
