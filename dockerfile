FROM denoland/deno

EXPOSE 3741

WORKDIR /app

ADD . /app

#RUN deno install --entrypoint main.ts

CMD ["run",  "--allow-net", "--allow-import", "--allow-read", "--allow-write", "--allow-env", "main.ts"]
