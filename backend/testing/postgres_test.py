import psycopg2

conn = psycopg2.connect(host='localhost', dbname='postgres', user='postgres', password='sarbachan21')

cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS person (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    age INT,
    gender CHAR
);             
               
""")

cursor.execute("""
INSERT INTO person (id, name, age, gender) VALUES 
(1, 'Mike', 30, 'M'),
(2, 'Lisa', 30, 'F'),
(3, 'John', 54, 'M'),
(4, 'Bob', 80, 'M'),
(5, 'Julie', 40, 'F');
""")

cursor.execute("SELECT * FROM person WHERE name = 'Bob';")
print(cursor.fetchone())

cursor.execute("SELECT * FROM person WHERE age < 50;")
# print(cursor.fetchall())
for row in cursor.fetchall():
    print(row)


conn.commit()

cursor.close()
conn.close()
