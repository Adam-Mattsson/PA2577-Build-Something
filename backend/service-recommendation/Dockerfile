FROM python:3.14-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
EXPOSE 5002

CMD ["flask", "--app", "app.py", "run", "--host=0.0.0.0", "--port=5002"]