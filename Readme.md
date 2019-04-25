# Stream Two Project

## Overview

The Reset Project

### What is this site for?

This is my final project for Code Institute Stream Two. The Example page can be found here: [Example Site](https://theresetproject.herokuapp.com/)

This is only an example website. Only some of the data is actually true
but this site is largely fabricated simply to fit my narrative.

### What does it do?

In this project I use DC.JS, crossfilter, D3.JS, and the flask framework
to create a website for the fictional Terra-Reformation Project.

This app shows data and information on the growth of damage resulting from storms and other natural disasters since 1996. Data can be filtered by year, number of injuries and deaths.

### Installation

Mongo DB is needed for the data.json file.

1. git clone https://github.com/Lenox89/streamTwoProject.git
2. cd streamTwoProject
3. pip install -r requirements.txt
4. mongod --dbpath "<any_path_to_where_you_want_your_db_stored>"
5. add stormsdata.csv to mongodb
6. mongoimport -d <DBS_name> -c <Collection_name> --type csv --file stormsdata.csv --headerline
7. Now just run the app.
8. python app.py

Please enjoy.