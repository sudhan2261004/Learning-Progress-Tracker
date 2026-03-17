import psycopg2

DATABASE_URL = """
host=9qasp5v56q8ckkf5dc.leapcellpool.com
port=6438
dbname=anasjhqsrarpsbomdozt
user=eecteteksnktvicqwqsr
password=wljmnlqclgxejmwadcbnkwmufrgkyh
sslmode=require
"""

def get_connection():
    return psycopg2.connect(DATABASE_URL)

def get_cursor():
    conn = get_connection()
    cur = conn.cursor()
    return cur, conn