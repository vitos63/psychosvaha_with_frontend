FROM python:3.14-alpine

ENV PYTHONPATH=/app
WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /var/lib/postgresql/data


ENTRYPOINT ["./entrypoint.sh"]