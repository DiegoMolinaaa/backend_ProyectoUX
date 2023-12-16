//Importanto express
const express = require('express')
//Importar otras librerias
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateCurrentUser } = require( "firebase/auth" ) ;

//Init express 
const app = express()

const firebaseConfig = {
  apiKey: "AIzaSyBoKQ4Lv_lsOuvMT19jWmCArzfxx-3WY88",
  authDomain: "backendproyectoux.firebaseapp.com",
  projectId: "backendproyectoux",
  storageBucket: "backendproyectoux.appspot.com",
  messagingSenderId: "249326656607",
  appId: "1:249326656607:web:bc2b6bab27143afe428fea",
  measurementId: "G-XK634MZ9KZ"
};

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
const firebaseApp = initializeApp(firebaseConfig);
app.use(urlEncodeParser);
app.use(express.json());
app.use(cors())

//Levantar el servidor 
app.listen(port, ()=>{
    console.log('SERVIDOR CONEXTANDOSE CORRECTAMENTE EN EL PUERTO', port);
})


//Endpoint
app.get('/getAlojamientos',async (req,res)=>{
  try {
    const client = new MongoClient(uri);
 
    const database = client.db("proyectoUX");
    const alojamiento = database.collection("Alojamientos");
    const cursor = alojamiento.find({});
    let arr = []
    for await (const doc of cursor) {
      arr.push(doc)
    }
    res.status(200).json(arr);
  }catch (error){
    res.status(500).send("No se pudo ejecutar la query");
  } finally {
    //await client.close();
  }

} )
app.get('/getAlojamientosDetalles',async (req,res)=>{
  try {
    const client = new MongoClient(uri);
 
    const database = client.db("proyectoUX");
    const alojamiento = database.collection("Alojamientos");
    const filter = req.body;
    const options ={
      projection: {Detalles:1},
    };
    const cursor = alojamiento.find({filter},options);
    let arr = []
    for await (const doc of cursor) {
      arr.push(doc)
    }
    res.status(200).json(arr);
  }catch (error){
    res.status(500).send("No se pudo ejecutar la query");
  } finally {
    await client.close();
  }

} )

app.get('/getAlojamientosXCategoria',async (req,res)=>{
  try {
    const client = new MongoClient(uri);
 
    const database = client.db("proyectoUX");
    const alojamiento = database.collection("Alojamientos");
    console.log(req.body);
    const categorias = !Array.isArray(req.body.categoria) ? [req.body.categoria] : req.body.categoria;
    console.log(categorias);
    const cursor = alojamiento.find({ categoria: { $in: categorias } });
    let arr = []
    for await (const doc of cursor) {
      arr.push(doc)
    }
    res.status(200).json(arr);
  }catch (error){
    res.status(500).send("No se pudo ejecutar la query");
  } finally {
    await client.close();
  }

} )
app.put('/crearReservacion',async (req,res)=>{
  try {
    const client = new MongoClient(uri);
    const database = client.db("proyectoUX");
    const alojamiento = database.collection("Alojamientos");
    // Crear el filtro para la informacion
    const alojamientoRecibido = req.body.body.alojamiento;
    const nuevaReserva = req.body.body.reservacion;
    /* Upsert en true significa que si el documento no existe lo crea*/
    const idAlojamiento = alojamientoRecibido._id;
    const filter = { _id: new ObjectId(idAlojamiento) };
    const options = { upsert: false ,returnOriginal: false};

    // Data con la que actualizaremos el documento.
    const updateDoc = {
      $push: { reservacion: nuevaReserva },
    };
    // Actualizar el primer documento que haga match con el filtro 
    const result = await alojamiento.findOneAndUpdate(filter, updateDoc, options);
    res.status(200).json({ message: "Se creó la reservación correctamente", result:result });
  }catch (error){
    res.status(500).send("No se pudo crear la reservacion")
  } finally {
    // Close the connection after the operation completes
    await client.close();
  }
})
app.put('/addAlojamientoFavorito',async (req,res)=>{
  try {
    const client = new MongoClient(uri);
    const database = client.db("proyectoUX");
    const usuarios = database.collection("Usuarios");
    // Crear el filtro para la informacion
    const { filter, nuevoFavorito } = req.body;
    // Upsert en true significa que si el documento no existe lo crea*/
    const options = { upsert: false ,returnOriginal: false};
    // Data con la que actualizaremos el documento.
    const updateDoc = {
      $push: { favoritos: nuevoFavorito },
    };
    // Actualizar el primer documento que haga match con el filtro 
    const result = await usuarios.findOneAndUpdate(filter, updateDoc, options);
    res.status(200).json({ message: "Se agrego nuevo alojamiento favorito" });
  }catch (error){
    res.status(500).send("No se pudo agregar el alojamiento a su favorito")
  } finally {
    // Close the connection after the operation completes
    await client.close();
  }
})
app.delete('/removeAlojamientoFavorito', async (req, res) => {
  try {
    const client = new MongoClient(uri);
    const database = client.db("proyectoUX");
    const usuarios = database.collection("Usuarios");

    const { filter, favoritoAEliminar } = req.body;
    
    const updateDoc = {
      $pull: { favoritos: favoritoAEliminar },
    };
    
    const result = await usuarios.findOneAndUpdate(filter, updateDoc);
    res.status(200).json({ message: "Se eliminó el alojamiento de los favoritos" });
  } catch (error) {
    res.status(500).send("No se pudo eliminar el alojamiento de los favoritos");
  } finally {
    await client.close();
  }
});
app.post('/createAlojamiento', async(req,res)=>{
    try{
        const client = new MongoClient(uri);
        const database = client.db("proyectoUX");
        const alojamiento = database.collection("Alojamientos");

        //Documento a insertar
        const doc = req.body;
        console.log(req.body);
        const result = await alojamiento.insertOne(doc);
        console.log("Inserto");
        //Print the ID if the inserted docuemnt
        console.log(`A document was inserted with the _id:   ${result.insertedId}`);
        res.status(200).send("El Post se creo exitosamente")
    }catch(error){
        res.status(500).send("No se creo el post, algo salio mal")
    } finally{
        //Close the MongoDB client connection
        await client.close();
    }
})

app.put('/editDatosUsuario',async (req,res)=>{
  try {
    const client = new MongoClient(uri);
    const database = client.db("proyectoUX");
    const usuarios = database.collection("Usuarios");
    // Crear el filtro para la informacion
    const tokenRecuperada = req.body.accessToken;
    const filter = { accessToken: tokenRecuperada };

    /* Upsert en true significa que si el documento no existe lo crea*/
    const options = { upsert: false };

    // Data con la que actualizaremos el documento.
    const updateDoc = {
      $set: {
        ...req.body,
      },
    };
    // Actualizar el primer documento que haga match con el filtro 
    const result = await usuarios.updateOne(filter, updateDoc, options);
    
    // Print the number of matching and modified documents
    console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
    );
    res.status(200).send("Se actualizo la informacion correctamente");
  }catch (error){
    res.status(500).send("No se pudo actualizar la información")
  } finally {
    // Close the connection after the operation completes
    await client.close();
  }
   
} )

//post usando firebase
app.post("/createUser",  (req, res) => {
    const auth = getAuth(firebaseApp);
    const email = req.body.email;
    const password = req.body.password;
    const userName = req.body.userName;
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    console.log("Intenta crear usuario");
    createUserWithEmailAndPassword(auth, email, password)
    .then(async(userCredential) => {
      try{
        console.log("Creo usuario firebase. Intenta mongo");
        const client = new MongoClient(uri);
        //Conectar con la base de datos, examenII, si la base de datos existe nos conectamos
        const database = client.db("proyectoUX");
        const post = database.collection("Usuarios");
        const accessToken = await userCredential.user.getIdToken();
        let usuario = {
          accessToken: accessToken,
          userName: userName,
          nombre: nombre,
          apellido: apellido,
          favoritos : [{}],
        };
        //Documento a insertar
        const doc = usuario;
        console.log(doc);
        console.log("Intenta crear usuario mongo");
        const result = await post.insertOne(doc);
        //Print the ID if the inserted docuemnt
        console.log(`El resultado fue:   ${result}`);
        console.log(`A document was inserted with the _id:   ${result.insertedId}`);
        res.status(200).json({ success: true });
      }catch(error){
        res.status(500).json({ success: false })
      } finally{
          //Close the MongoDB client connection
          await client.close();
      }
    })  
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      res.status(500).send("No se logro crear el usuario");
    });
})

app.post("/logIn", (req, res) =>{
  try {
    const auth = getAuth(firebaseApp);
    const email = req.body.email;
    const password = req.body.password;
    signInWithEmailAndPassword(auth, email, password)
    .then((resp) => {
      //Signed In
      console.log("Log in exitoso");
      res.status(200).json({ success: true });
      
    })
    .catch ((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      res.status(500).json({ success: false })
    });
    
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    res.status(500).json({ success: false })
  }
})

app.post("/logOut",  (req,res) => {
    const auth = getAuth(firebaseApp);
    signOut(auth).then(() => {
      console.log('Se cerro bien la sesion');
      res.status(200).json({ success: true });
    }).catch((error) => {
      console.log('Hubo un error');
      res.status(500).json({ success: false })
    });
});