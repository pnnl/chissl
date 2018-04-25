# Introduction 

Welcome to CHISSL, an interactive machine learning prototype. It is designed to provide a novel, simpler way for non-expert users to quickly and effortlessly explore large datasets without becoming overwhelmed.

![CHISSL Screenshot showing the VAST Challenge 2014 Dataset](chissl-screenshot.png)

The system provides a few recommendations to start with. Then, the user can double-click on one or more instances to create a group. For each group the user has created, CHISSL will recommend a few more things for the user to look at that it thinks is most similar to the examples(s) the user has provided. More than one example can be provided per group, and the user is free to correct the recommendations when they do not agree with her mental model.

CHISSL also recommends a borderline instance for each group to check out. Borderlines are likely to belong in another group.

Clicking below instances will show more instances on the sidebar that are similar to that example. Bars on the time histogram will similarly reveal instances within that time window.


# Getting Started

Install MongoDB. For example, on MacOS the easiest way to do this is with [Homebrew](https://brew.sh), by running the following command.

```bash
brew install mongodb
```

Install a [python 3.5 environment](https://www.anaconda.com/download/) with the following packages
* pymongo
    * if using Anaconda, this is the only additional dependency (use **conda install pymongo**)
* flask
* scikit-learn
* pandas

Install the [node.js](https://nodejs.org/en/) dependencies

```bash
npm install
```

Start the development server

```bash
npm start
```

Restore the JSON data to the database

```bash
python restore.py
```

Go to [localhost:3000](http://localhost:3000)


# Adding Datasets

Adding a completely new dataset requires touching the project in the several places. You will need to determine the following three things:
* How to store your data in the database, e.g. **MyNewDataset**
* How to represent your data as a dendrogram, e.g. **MyNewClustering**
* How to represent your data visually, e.g. **MyNewComponent**

What, you thought this would be easy?

## Back End
* mongodb://chissl_MyNewDataset.instances
* clusters/MyNewClustering.json

Put your data in a Mongo database. This part is pretty flexible, each document in the database should hold whatever information is needed to render an instance on the client side. This data will eventually be passed directly to the **MyNewComponent** as props. An example document is shown below:

```json
{
  "tags": [
    "Home",
    "Coffee",
    "GASTech",
    "Dining",
    "1",
    "Monday",
    "Alcazar",
    "Lucas",
    "Information Technology",
    "IT Helpdesk"
  ],
  "_id": "1-14-01-06",
  "places": {
    "8": "GASTech",
    "14": "GASTech",
    "19": "Home",
    "15": "GASTech",
    "22": "GASTech",
    "12": "Dining",
    "9": "GASTech",
    "7": "Coffee",
    "21": "Home",
    "20": "Home",
    "17": "GASTech",
    "11": "GASTech",
    "13": "GASTech",
    "18": "Home",
    "23": "GASTech",
    "16": "GASTech",
    "10": "GASTech"
  },
  "date": "2014-01-06 00:00:00",
  "name": "Alcazar, Lucas"
}
```

If you want your data to be query-able, use the `tags` field to store any keywords strings relevant to the document. You will want to add `tags` as an index to the database, e.g.:

```python
client = MongoClient('mongodb://<your database URL>')
client.chissl_MyNewDataset.instances.create_index('tags')
```

Represent your dendrogram as a JSON object containing a parent pointer array. The JSON object tells which database to connect to as well as what the parents, costs, and dates associated for each instance are. Clustering implementations and convenience functions are found in `/util/cluster`. A portion of an example cluster object is shown below.

```json
{
  "db": "chissl_VAST",
  "parents": [
    922,
    747,
    573,
    551,
    849,
    ...
  ],
  "instances": [
    "1-14-01-06",
    "1-14-01-07",
    "1-14-01-08",
    "1-14-01-09",
    "1-14-01-10",
    ...
  ],
  "costs": [
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    ...
  ],
  "dates": [
    "2014-01-06 00:00:00",
    "2014-01-07 00:00:00",
    "2014-01-08 00:00:00",
    "2014-01-09 00:00:00",
    "2014-01-10 00:00:00",
    ...
  ]
}
```

## Front End
* src/components/icons/MyNewComponent.js
* src/components/icons/index.js

Create a React component to render your instance. The component will be passed the instance document directly from the database as props.

```jsx
import React from 'react';

import './MyNewComponent.css'

export const MyNewComponent = ({_id, date, tags, ...rest}) =>
    <div className='my-new-component'>
        <div>{_id}</div>

        <div>{date}</div>

        <div>{tags}</div>

        Secret sauce goes here.
    </div>
```

If you want to use CSS, create `MyNewComponent.scss` namespaced as shown below. This will be automatically compiled into a CSS file which you include in the component. Don't include the .scss file.

```scss
.my-new-component {
  div {
    font-family: "Comic Sans MS";
  }
}
```

Export your component in `src/components/icons/index.js`. The component should be exported as the database name so CHISSL knows what component to use to render data coming from a particular source.

```js
export {MyNewComponent as myComponentsDatabaseName} from './MyNewComponent';
```

OK, if you got this far I guess it wasn't impossible.