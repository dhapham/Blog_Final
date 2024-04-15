const mongodb = require("mongodb");

class Database {
    collections = {
        blogs: null,
        users: null
    }

    client = null;
    database = null;

    async setup() {
        this.client = await new mongodb.
            MongoClient("mongodb+srv://n01575957:Diemha3007@cluster0.mq4q0s7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").
            connect();

        this.database = await this.client.db("blogsdb")

        var mongoCollections = await this.database.listCollections({}, { nameOnly: true }).toArray();
        var collectionNames = mongoCollections.map((collection) => {
            return collection.name;
        });

        Object.keys(this.collections).forEach(async (collection) => {
            if (collectionNames.includes(collection)) {
                this.collections[collection] = await this.database.collection(collection);
                console.log('Collection fetched from MongoDB');
            } else {
                this.collections[collection] = await this.database.createCollection(collection);
                console.log('Collection created in MongoDB');
            }
        });
    }
}

module.exports = Database