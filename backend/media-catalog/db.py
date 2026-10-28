import os
import psycopg2 as postgres
import json

DB_HOST = os.environ.get("DB_HOST")
DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")


def connect() -> postgres.connection:
    return postgres.connect(host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD)


def init_db():
    db = connect()
    cursor = db.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    type TEXT,
    title TEXT,
    year SERIAL,
    runtime SERIAL,
    photo_url TEXT,
    offers TEXT
    )
    """)
    db.commit()
    cursor.close()
    db.close()
    return


def save_media(media: dict):
    """Inserts a singular media into the media table"""
    print(media)
    photo_url_text = json.dumps(media["photo_url"])
    offers_text = json.dumps(media["offers"])
    db = connect()
    cursor = db.cursor()
    cursor.execute(
        """
    INSERT INTO media (id, type, title, year, runtime, photo_url, offers) VALUES (%s, %s,%s, %s,%s, %s, %s) ON CONFLICT DO NOTHING
    """, (media["id"], media["type"], media["title"], media["year"], media["runtime"], photo_url_text, offers_text)
    )
    db.commit()
    cursor.close()
    db.close()


def save_medias(medias: list[dict]):
    """Stores a list of medias in the db"""
    for media in medias:
        save_media(media)
    return {"message": "Sucessfully Saved Media"}, 200


def remove_media(media_id: str) -> dict:
    db = connect()
    cursor = db.cursor()
    cursor.execute("""
    DELETE FROM media WHERE id=%s;
    """, (media_id,))
    rows_affected = cursor.rowcount
    cursor.close()
    db.commit()
    db.close()
    if rows_affected > 0:
        return {"message": "Media removed from collection"}, 200
    else:
        return {"message": "Media not found"}, 404


def get_stored():
    db = connect()
    cursor = db.cursor()
    cursor.execute(
        """
    SELECT * FROM media
    """
    )
    result: list = cursor.fetchall()
    cursor.close()
    db.close()
    return [
        {
            "id": r[0],
            "type": r[1],
            "title": r[2],
            "year": r[3],
            "runtime": r[4],
            "photo_url": json.loads(r[5]),
            "offers": json.loads(r[6])
        }
        for r in result
    ]
