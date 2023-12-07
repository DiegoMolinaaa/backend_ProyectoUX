//Importanto express
const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');


//Importar otras librerias
const path = require('path');
const bodyParser = require('body-parser');

//Init express 
const app = express()

//definir el parse
var urlEncodeParser = bodyParser.urlencoded({extended:true});


//Definir el puerto
let port = 3000;
const uri = "mongodb+srv://moli:admin1@clusterproyectoux.qshylyi.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server    (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir); 

// utilizar / set el parser
app.use(urlEncodeParser);
//Levantar el servidor 
app.listen(port, ()=>{
    console.log('SERVIDOR CONEXTANDOSE CORRECTAMENTE EN EL PUERTO', port);
})
console.log('Esta linea esta despues del .listen');
//Callback


//Endpoint
app.get('/getInfo', (_req,res)=>{
    console.log('Recibi una peticion -get');
    res.status(200).send({
        nombre: "Diego",
        apellido: "Molina",
        carrera: "Ingenieria en Sistemas Computacionales",
    });
})

app.put('/MiPrimerput', (_req,res)=>{
    console.log('Recibi una peticion - put');
    res.status(200).send('Se deberia ejecutar un update por el :) ');
    
})

app.delete('/deleteUser', (_req,res)=>{
    console.log('Recibi una peticion - delete');
    res.status(200).send('Se elimino el usuario :) ');
    
})

app.post('/createUser', async(_req,res)=>{
    console.log('Recibi una peticion- post');
    try{
        const client = new MongoClient(uri);
        //Conectar con la base de datos, claseUX, si la base de datos existe nos conectamos
        const database = client.db("claseUX");
        const usuarios = database.collection("usuarios");

        //Documento a insertar
        const doc = _req.body;
        //Insert the defined document into the "haiku" collection 
        const result = await usuarios.insertOne(doc);
        //Print the ID if the inserted docuemnt
        console.log(`El rsultado fue:   ${result}`);
        console.log(`A document was inserted with the _id:   ${result.insertedId}`);
        res.status(200).send("El usuario se creo exitosamente")
    }catch(error){
        res.status(200).send("No se creo el usuario, algo salio mal")
    } finally{
        //Close the MongoDB client connection
        await client.close();
    }
    
})

app.get('/getFile', (_req,res)=>{
    console.log('Recibi una peticion - Regresar HTML');
    res.status(200).sendFile(path.join(__dirname+"/info.html"));
    
})