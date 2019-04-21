import os
from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json

app = Flask(__name__)


MONGODB_HOST = os.getenv('MONGODB_URI','<host>')
DBS_NAME = os.getenv('DB','<db>')
COLLECTION_NAME = os.getenv('COLL','<coll>')


@app.route('/')
def home():
    return render_template("home.html", page_title="Home")

@app.route('/about')
def about():
    return render_template("about.html", page_title="About")

@app.route('/help')
def help():
    return render_template("help.html", page_title="Get Involved")

@app.route("/data")
def data():
  FIELDS = {
    '_id': False, 'STATE': True, 'YEAR': True, 'MONTH_NAME': True, 'EVENT_TYPE': True, 'INJURIES_DIRECT': True, 'DEATHS_DIRECT': True
  }

  with MongoClient(MONGODB_HOST) as conn:
    collection = conn[DBS_NAME][COLLECTION_NAME]
    projects = collection.find(projection=FIELDS, limit=20000)
    return json.dumps(list(projects))

if __name__ == '__main__':
    app.run(debug=True)