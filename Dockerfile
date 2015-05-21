FROM ubuntu:14.04

RUN apt-get update
RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:fkrull/deadsnakes
RUN apt-get update
RUN apt-get install -y python3.4 python3.4-dev python3-pip build-essential gunicorn libpq-dev libxml2-dev libxslt1-dev libffi-dev libssl-dev

COPY . /srv

WORKDIR /srv/

RUN pip3 install -r requirements.txt

EXPOSE 8000

CMD gunicorn -b 0.0.0.0:8000 tracker_project.wsgi --log-file=-