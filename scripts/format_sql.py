import json
import sys

def format_sql_payload():
    with open("supabase/migrations/20240115_create_study_goals.sql", "r") as f:
        sql = f.read()
    
    payload = {"query": sql}
    with open("/tmp/sql_payload.json", "w") as f:
        json.dump(payload, f)

if __name__ == "__main__":
    format_sql_payload()
