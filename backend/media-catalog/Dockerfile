FROM python:3.14-slim

WORKDIR /app

ENV SEARCH_SERVICE_URL="https://imdb.iamidiotareyoutoo.com"
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY db.py .
EXPOSE 5001

CMD ["flask", "--app", "app.py", "run", "--host=0.0.0.0", "--port=5001"]